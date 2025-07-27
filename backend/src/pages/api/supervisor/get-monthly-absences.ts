import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

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

    const result = await pool.query(
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
      count: parseInt(result.rows[0].count) || 0
    });

  } catch (error) {
    console.error("Error getting monthly absences:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 