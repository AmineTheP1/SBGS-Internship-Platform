import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sendEmail = require('../../../utilities/sendEmail');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  const { dsgid, status } = req.body;
  if (!dsgid || !status) {
    return res.status(400).json({ success: false, error: "Missing parameters" });
  }
  try {
    await pool.query(
      `UPDATE demandes_stage SET statut = $1 WHERE dsgid = $2`,
      [status, dsgid]
    );
    // Fetch candidate email
    const result = await pool.query(`
      SELECT c.email, c.prenom, c.nom FROM demandes_stage d
      JOIN candidat c ON d.cdtid = c.cdtid
      WHERE d.dsgid = $1
      LIMIT 1
    `, [dsgid]);
    if (result.rows.length > 0) {
      const email = result.rows[0].email;
      const fullName = `${result.rows[0].prenom} ${result.rows[0].nom}`.trim();
      // Fetch type de stage and durée
      const detailsResult = await pool.query(`
        SELECT typestage, periode FROM demandes_stage WHERE dsgid = $1 LIMIT 1
      `, [dsgid]);
      let typestage = '';
      let periode = '';
      if (detailsResult.rows.length > 0) {
        typestage = detailsResult.rows[0].typestage;
        periode = detailsResult.rows[0].periode;
      }
      let subject = '';
      let text = '';
      let currentCdtid = '';
      let randomPassword = '';
      
      if (status === 'Accepté') {
        console.log("Processing acceptance for dsgid:", dsgid);
        // Generate random password
        randomPassword = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10).toUpperCase();
        console.log("Generated password:", randomPassword);
        
        // Hash the password
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        
        // Check if password column exists, if not create it
        try {
          await pool.query(`
            ALTER TABLE candidat 
            ADD COLUMN IF NOT EXISTS password character varying(255)
          `);
        } catch (error) {
          console.log("Password column might already exist or error occurred:", error);
        }

        // Create presence table if it doesn't exist
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS presence (
              id SERIAL PRIMARY KEY,
              cdtid VARCHAR(255) NOT NULL,
              date DATE NOT NULL,
              heure_entree TIME,
              heure_sortie TIME,
              statut VARCHAR(50) DEFAULT 'En cours',
              created_at TIMESTAMP DEFAULT NOW(),
              UNIQUE(cdtid, date)
            )
          `);
        } catch (error) {
          console.log("Presence table might already exist or error occurred:", error);
        }

        // Create daily reports table if it doesn't exist
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS rapports_journaliers (
              id SERIAL PRIMARY KEY,
              cdtid VARCHAR(255) NOT NULL,
              date DATE NOT NULL,
              nom_prenom VARCHAR(255) NOT NULL,
              periode_stage VARCHAR(100),
              heure_entree TIME,
              heure_sortie TIME,
              service_affectation VARCHAR(255) DEFAULT 'À définir',
              taches_effectuees TEXT,
              documents_utilises TEXT,
              date_creation TIMESTAMP DEFAULT NOW(),
              date_modification TIMESTAMP DEFAULT NOW(),
              UNIQUE(cdtid, date)
            )
          `);
        } catch (error) {
          console.log("Daily reports table might already exist or error occurred:", error);
        }
        
        // Get the current cdtid first
        const currentCdtidResult = await pool.query(
          `SELECT cdtid FROM demandes_stage WHERE dsgid = $1`,
          [dsgid]
        );
        
        if (currentCdtidResult.rows.length > 0) {
          currentCdtid = currentCdtidResult.rows[0].cdtid;
          console.log("Using existing cdtid:", currentCdtid);
          
          // Update candidate with password only (keep existing cdtid)
          await pool.query(
            `UPDATE candidat SET password = $1 WHERE cdtid = $2`,
            [hashedPassword, currentCdtid]
          );
        }
        
        subject = 'Félicitations, vous avez été accepté(e) - Vos identifiants de connexion';
        text = `Bonjour ${fullName},

Félicitations, vous avez été accepté(e) pour le stage chez SBGS !

Type de stage : ${typestage}
Durée : ${periode}

Vos identifiants de connexion pour accéder à votre espace candidat :

Identifiant : ${currentCdtid}
Mot de passe : ${randomPassword}

Vous pouvez vous connecter sur notre plateforme pour suivre votre candidature et accéder aux informations importantes.

Cordialement,
SBGS Plateforme`;
      } else if (status === 'Rejeté') {
        subject = "Malheureusement, vous n'avez pas été sélectionné(e)";
        text = `Bonjour ${fullName},\n\nMalheureusement, vous n'avez pas été sélectionné(e) pour le stage chez SBGS.\n\nType de stage : ${typestage}\nDurée : ${periode}\n\nCordialement,\nSBGS Plateforme`;
      }
      if (subject && text) {
        await sendEmail({ to: email, subject, text });
      }
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in update-status API:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 