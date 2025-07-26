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
    // Verify HR authentication
    const token = req.cookies?.hr_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated as HR" });
    }

    const hr = jwt.verify(token, process.env.JWT_SECRET!) as any;
    // All HR users can access supervisors list

    // Get all supervisors
    const result = await pool.query(`
      SELECT 
        resid,
        nom,
        prenom,
        email,
        service
      FROM responsables_stage
      ORDER BY nom, prenom
    `);

    return res.status(200).json({ 
      success: true,
      supervisors: result.rows
    });

  } catch (error) {
    console.error("Error getting supervisors:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 