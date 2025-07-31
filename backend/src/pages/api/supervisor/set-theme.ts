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

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Get supervisor info from token
    const token = req.cookies?.supervisor_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const supervisor = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { cdtid, theme } = req.body;

    if (!cdtid || !theme) {
      return res.status(400).json({ 
        success: false, 
        error: "CDTID et thème sont obligatoires" 
      });
    }

    // Verify supervisor is assigned to this intern
    const assignmentCheck = await pool.query(
      `SELECT * FROM assignations_stage WHERE resid = $1 AND cdtid = $2 AND statut = 'Actif'`,
      [supervisor.resid, cdtid]
    );

    if (assignmentCheck.rows.length === 0) {
      return res.status(403).json({ success: false, error: "Not authorized to manage this intern" });
    }

    // Update the assignment with the theme
    await pool.query(
      `UPDATE assignations_stage 
       SET theme_stage = $1
       WHERE resid = $2 AND cdtid = $3 AND statut = 'Actif'`,
      [theme, supervisor.resid, cdtid]
    );

    return res.status(200).json({ 
      success: true, 
      message: "Thème de stage mis à jour avec succès"
    });

  } catch (error) {
    console.error("Error setting theme:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 