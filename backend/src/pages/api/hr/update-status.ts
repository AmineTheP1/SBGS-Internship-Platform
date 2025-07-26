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
      if (status === 'Accepté') {
        subject = 'Félicitations, vous avez été accepté(e)';
        text = `Bonjour ${fullName},\n\nFélicitations, vous avez été accepté(e) pour le stage chez SBGS.\n\nType de stage : ${typestage}\nDurée : ${periode}\n\nCordialement,\nSBGS Plateforme`;
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
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 