import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sendEmail = require('../../../utilities/sendEmail');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  try {
    const { dsgid } = req.query;
    if (dsgid) {
      // Fetch the application first to check current status
      const result = await pool.query(`
        SELECT 
          c.cdtid, c.nom, c.prenom, c.email, c.statutetudiant as currentyear, c.telephone,
          c.imageurl as imageurl,
          d.dsgid, d.typestage, d.domaine, d.statut as status, d.datesoumission, d.domaines_interet, d.demande_stage, d.periode, d.datetraitement,
          p.url as cvurl, e.nom as universityname
        FROM demandes_stage d
        JOIN candidat c ON d.cdtid = c.cdtid
        LEFT JOIN ecole e ON c.ecoleid = e.ecoleid
        LEFT JOIN pieces_jointes p ON p.dsgid = d.dsgid AND p.typepiece = 'CV'
        WHERE d.dsgid = $1
        LIMIT 1
      `, [dsgid]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: "Candidature non trouvée" });
      }

      const application = result.rows[0];

      // Only send email and update datetraitement if status is "En attente" and hasn't been processed before
      if (application.status === "En attente" && !application.datetraitement) {
        // Update datetraitement to NOW()
        await pool.query(
          `UPDATE demandes_stage SET datetraitement = NOW() WHERE dsgid = $1`,
          [dsgid]
        );

        // Send email to candidate
        const fullName = `${application.prenom} ${application.nom}`.trim();
        await sendEmail({
          to: application.email,
          subject: "Votre demande de stage est en cours d'examen",
          text: `Bonjour ${fullName},\n\nVotre demande de stage est en cours d'examen.\n\nType de stage : ${application.typestage}\nDurée : ${application.periode}\n\nNous vous contacterons après examen.\n\nCordialement,\nSBGS Plateforme`
        });
      }

      // Fetch all pieces_jointes for this dsgid
      const piecesResult = await pool.query(
        `SELECT typepiece, url FROM pieces_jointes WHERE dsgid = $1`,
        [dsgid]
      );

      // Attach pieces_jointes to the application object
      application.pieces_jointes = piecesResult.rows;
      return res.status(200).json({ success: true, applications: [application] });
    } else {
      // Fetch all applications as before
      const countResult = await pool.query('SELECT COUNT(*) as count FROM demandes_stage');
      console.log("Total applications in database:", countResult.rows[0].count);
      
      const result = await pool.query(`
        SELECT 
          c.cdtid, c.nom, c.prenom, c.email, c.statutetudiant as currentyear, c.telephone,
          c.imageurl as imageurl,
          d.dsgid, d.typestage, d.domaine, d.statut as status, d.datesoumission, d.domaines_interet, d.demande_stage, d.periode,
          p.url as cvurl, e.nom as universityname
        FROM demandes_stage d
        JOIN candidat c ON d.cdtid = c.cdtid
        LEFT JOIN ecole e ON c.ecoleid = e.ecoleid
        LEFT JOIN pieces_jointes p ON p.dsgid = d.dsgid AND p.typepiece = 'CV'
        ORDER BY d.datesoumission DESC
      `);
      
      console.log("Applications found:", result.rows.length);
      console.log("Applications data:", result.rows);
      
      // Debug each application's date field
      result.rows.forEach((app, index) => {
        console.log(`Application ${index + 1}:`, {
          dsgid: app.dsgid,
          nom: app.nom,
          prenom: app.prenom,
          fullName: `${app.prenom || ''} ${app.nom || ''}`.trim(),
          datesoumission: app.datesoumission,
          datesoumissionType: typeof app.datesoumission,
          domaines_interet: app.domaines_interet,
          cvUrl: app.cvurl
        });
      });
      
      return res.status(200).json({ success: true, applications: result.rows });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 