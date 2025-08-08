import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { handleCors } from "../../../utilities/cors";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  await handleCors(req, res);
  
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Verify HR is authenticated
    const token = req.cookies?.hr_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    // Get all folders
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        description, 
        created_at, 
        created_by
      FROM dossiers_utiles
      ORDER BY name ASC
    `);

    return res.status(200).json({
      success: true,
      folders: result.rows
    });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}