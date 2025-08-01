import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import path from 'path';

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
    const { superviseurid } = req.query;

    if (!superviseurid) {
      return res.status(400).json({ success: false, error: "superviseurid est requis." });
    }

    // Get all reports from interns assigned to this supervisor
    const result = await pool.query(
      `SELECT 
         r.rstid as rapportid,
         r.url,
         r.titre,
         r.commentaire as description,
         r.dateenvoi as date_soumission,
         r.statut,
         r.commentaire as commentaires_superviseur,
         c.cdtid,
         c.nom,
         c.prenom,
         c.email
       FROM rapports_stage r
       JOIN candidat c ON r.cdtid = c.cdtid
       JOIN stages s ON r.stagesid = s.stagesid
       WHERE s.responsables_stageid = $1
       ORDER BY r.dateenvoi DESC`,
      [superviseurid]
    );

    // Process the results to extract filename from URL and remove timestamp prefix
    const processedReports = result.rows.map(report => {
      let filename = 'Unknown file';
      if (report.url) {
        // Get the basename first
        const basename = path.basename(report.url);
        // Remove the timestamp prefix (numbers + underscore)
        filename = basename.replace(/^\d+_/, '');
      }
      
      return {
        ...report,
        titre: filename
      };
    });

    res.status(200).json({ 
      success: true, 
      reports: processedReports 
    });

  } catch (error) {
    console.error('Error fetching intern reports:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la récupération des rapports." });
  }
} 