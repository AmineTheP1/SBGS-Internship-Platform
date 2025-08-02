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
    // Get supervisor info from token
    const token = req.cookies?.supervisor_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const supervisor = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get pending confirmations for assigned interns
    const result = await pool.query(
      `SELECT 
        p.id as confirmationid,
        p.cdtid,
        c.nom,
        c.prenom,
        c.imageurl,
        p.date as date_presence,
        p.heure_entree as heure_pointage
       FROM presence p
       JOIN candidat c ON p.cdtid = c.cdtid
       JOIN assignations_stage ast ON p.cdtid = ast.cdtid
       WHERE ast.resid = $1 
       AND ast.statut = 'Actif'
       AND p.confirme_par_superviseur IS NULL
       ORDER BY p.date DESC, p.heure_entree DESC`,
      [supervisor.resid]
    );

    return res.status(200).json({ 
      success: true, 
      count: result.rows.length,
      confirmations: result.rows
    });

  } catch (error) {
    console.error("Error getting pending confirmations:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 