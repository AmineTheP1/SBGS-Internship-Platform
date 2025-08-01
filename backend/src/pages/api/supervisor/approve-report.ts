import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import sendEmail from '../../../utilities/sendEmail';
import crypto from 'crypto';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { rapportid, action, commentaires, resid, requestCertificate } = req.body;

    if (!rapportid || !action || !resid) {
      return res.status(400).json({ success: false, error: "Tous les champs sont requis." });
    }

    if (!['Approuvé', 'Rejeté'].includes(action)) {
      return res.status(400).json({ success: false, error: "Action invalide." });
    }

    // Update the report status using rstid
    const updateQuery = action === 'Approuvé' 
      ? `UPDATE rapports_stage 
         SET statut = $1, commentaire = $2, datevalidation = NOW()
         WHERE rstid = $3`
      : `UPDATE rapports_stage 
         SET statut = $1, commentaire = $2
         WHERE rstid = $3`;

    await pool.query(updateQuery, [action, commentaires || '', rapportid]);

    // If approved and certificate is requested, create certificate request
    if (action === 'Approuvé' && requestCertificate) {
      // Create certificates table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS attestations_stage (
          attestationid VARCHAR(16) PRIMARY KEY,
          cdtid VARCHAR(16) REFERENCES candidat(cdtid),
          rapportid VARCHAR(16) REFERENCES rapports_stage(rstid),
          superviseurid VARCHAR(16),
          date_demande TIMESTAMP DEFAULT NOW(),
          statut VARCHAR(20) DEFAULT 'En attente',
          date_generation TIMESTAMP,
          url_attestation VARCHAR(500),
          commentaires_hr TEXT
        )
      `);

      // Get candidate info for the report
      const candidateResult = await pool.query(
        `SELECT c.cdtid, c.nom, c.prenom, c.email, r.titre
         FROM rapports_stage r
         JOIN candidat c ON r.cdtid = c.cdtid
         WHERE r.rstid = $1`,
        [rapportid]
      );

      if (candidateResult.rows.length > 0) {
        const candidate = candidateResult.rows[0];
        const attestationid = crypto.randomBytes(8).toString('hex');

        // Insert certificate request
        await pool.query(
          `INSERT INTO attestations_stage (attestationid, cdtid, rapportid, superviseurid) 
           VALUES ($1, $2, $3, $4)`,
          [attestationid, candidate.cdtid, rapportid, resid]
        );

        // Send email to HR
        const hrEmail = process.env.HR_EMAIL || 'hr@sbgs.ma';
        const emailSubject = 'Demande d\'attestation de stage';
        const emailBody = `
          Bonjour,
          
          Le superviseur a approuvé le rapport de stage et demande une attestation pour le stagiaire suivant :
          
          Nom : ${candidate.prenom} ${candidate.nom}
          Email : ${candidate.email}
          Rapport : ${candidate.titre}
          
          Veuillez générer l'attestation de stage et informer le stagiaire.
          
          Cordialement,
          Système de gestion des stages
        `;

        try {
          await sendEmail({
            to: hrEmail,
            subject: emailSubject,
            text: emailBody
          });
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      }
    }

    res.status(200).json({ 
      success: true, 
      message: action === 'Approuvé' 
        ? "Rapport approuvé avec succès." + (requestCertificate ? " Demande d'attestation envoyée à HR." : "")
        : "Rapport rejeté."
    });

  } catch (error) {
    console.error('Error approving report:', error);
    res.status(500).json({ success: false, error: "Erreur lors de l'approbation du rapport." });
  }
} 