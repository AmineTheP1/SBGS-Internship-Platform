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
         // Create certificates table if it doesn't exist
     await pool.query(`
       CREATE TABLE IF NOT EXISTS attestations_stage (
         attestationid VARCHAR(16) PRIMARY KEY,
         cdtid VARCHAR(16) REFERENCES candidat(cdtid),
         rapportid INTEGER REFERENCES rapports_stage(id),
         superviseurid VARCHAR(16),
         date_demande TIMESTAMP DEFAULT NOW(),
         statut VARCHAR(20) DEFAULT 'En attente',
         date_generation TIMESTAMP,
         url_attestation VARCHAR(500),
         commentaires_hr TEXT
       )
     `);

         // Get all certificate requests with candidate and report details
     const result = await pool.query(`
       SELECT 
         a.attestationid,
         a.date_demande,
         a.statut,
         a.date_generation,
         a.url_attestation,
         a.commentaires_hr,
         c.cdtid,
         c.nom,
         c.prenom,
         c.email,
         c.telephone,
         c.statutetudiant,
         r.url as rapport_url,
         r.dateenvoi as rapport_date,
         rs.nom as superviseur_nom,
         rs.prenom as superviseur_prenom,
         e.nom as ecole_nom
       FROM attestations_stage a
       JOIN candidat c ON a.cdtid = c.cdtid
       JOIN rapports_stage r ON a.rapportid = r.rstid
       JOIN assignations_stage ass ON r.stagesid = ass.stagesid
       JOIN stages s ON ass.stagesid = s.stagesid
       JOIN responsables_stage rs ON s.responsables_stageid = rs.responsables_stageid
       LEFT JOIN ecole e ON c.ecoleid = e.ecoleid
       ORDER BY a.date_demande DESC
     `);

    res.status(200).json({ 
      success: true, 
      certificates: result.rows 
    });

  } catch (error) {
    console.error('Error fetching certificate requests:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la récupération des demandes d'attestation." });
  }
} 