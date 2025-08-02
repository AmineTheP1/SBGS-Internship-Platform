import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost");
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
    const { cdtid } = req.query;

    if (!cdtid) {
      return res.status(400).json({ success: false, error: "cdtid est requis." });
    }

    // Check if the candidate has any downloaded attestations
    const result = await pool.query(`
      SELECT 
        ats.atsid,
        ats.dategeneration,
        ats.downloaded,
        r.titre as rapport_titre,
        s.datedebut,
        s.datefin
      FROM attestations_stage ats
      JOIN rapports_stage r ON ats.rapportid = r.rstid
      JOIN stages s ON ats.stagesid = s.stagesid
      WHERE ats.cdtid = $1 AND ats.downloaded = true
      ORDER BY ats.dategeneration DESC
      LIMIT 1
    `, [cdtid]);

    if (result.rows.length > 0) {
      const attestation = result.rows[0];
      res.status(200).json({ 
        success: true, 
        hasAttestation: true,
        attestation: {
          id: attestation.atsid,
          dateGenerated: attestation.dategeneration,
          rapportTitre: attestation.rapport_titre,
          dateDebut: attestation.datedebut,
          dateFin: attestation.datefin
        }
      });
    } else {
      res.status(200).json({ 
        success: true, 
        hasAttestation: false 
      });
    }

  } catch (error) {
    console.error('Error checking attestation:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la vérification de l'attestation." });
  }
} 