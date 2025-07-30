import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { handleCors } from "../../../utilities/cors";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Get candidate info from token
    const token = req.cookies?.candidate_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const candidate = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get assignment information including theme
    const result = await pool.query(
      `SELECT 
        a.theme_stage,
        a.date_assignation,
        a.statut as statut_assignation,
        r.nom as supervisor_nom,
        r.prenom as supervisor_prenom,
        r.email as supervisor_email
       FROM assignations_stage a
       LEFT JOIN responsables_stage r ON a.resid = r.resid
       WHERE a.cdtid = $1 AND a.statut = 'Actif'
       ORDER BY a.date_assignation DESC
       LIMIT 1`,
      [candidate.cdtid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Aucune assignation trouvée" 
      });
    }

    const assignment = result.rows[0];

    return res.status(200).json({ 
      success: true,
      assignment: {
        theme_stage: assignment.theme_stage,
        date_assignation: assignment.date_assignation,
        statut_assignation: assignment.statut_assignation,
        supervisor: {
          nom: assignment.supervisor_nom,
          prenom: assignment.supervisor_prenom,
          email: assignment.supervisor_email
        }
      }
    });

  } catch (error) {
    console.error("Error getting assignment:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 