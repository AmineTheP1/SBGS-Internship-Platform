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

    // Get current month's absences for all assigned interns
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get detailed absences data
    const absencesResult = await pool.query(
      `SELECT 
        a.id as absenceid,
        a.cdtid,
        c.nom,
        c.prenom,
        c.imageurl,
        a.date_absence,
        a.date_creation as date_declaration,
        a.motif as raison,
        a.justifiee as type
       FROM absences a
       JOIN candidat c ON a.cdtid = c.cdtid
       JOIN assignations_stage ast ON a.cdtid = ast.cdtid
       WHERE ast.resid = $1 
       AND ast.statut = 'Actif'
       AND a.date_absence >= $2 
       AND a.date_absence <= $3
       ORDER BY a.date_absence DESC`,
      [supervisor.resid, firstDayOfMonth.toISOString().split('T')[0], lastDayOfMonth.toISOString().split('T')[0]]
    );

    // Get count for backward compatibility
    const countResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM absences a
       JOIN assignations_stage ast ON a.cdtid = ast.cdtid
       WHERE ast.resid = $1 
       AND ast.statut = 'Actif'
       AND a.date_absence >= $2 
       AND a.date_absence <= $3`,
      [supervisor.resid, firstDayOfMonth.toISOString().split('T')[0], lastDayOfMonth.toISOString().split('T')[0]]
    );

    return res.status(200).json({ 
      success: true, 
      count: parseInt(countResult.rows[0].count) || 0,
      absences: absencesResult.rows
    });

  } catch (error) {
    console.error("Error getting monthly absences:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 