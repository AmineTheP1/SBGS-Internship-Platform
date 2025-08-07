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

    // Get all useful files
    const result = await pool.query(`
      SELECT 
        uf.id, 
        uf.title, 
        uf.description, 
        uf.filename, 
        uf.file_path, 
        uf.file_type, 
        uf.uploaded_at, 
        uf.uploaded_by,
        rh.nom as uploaded_by_name
      FROM fichiers_utiles uf
      LEFT JOIN rh ON uf.uploaded_by = rh.rhid
      ORDER BY uf.uploaded_at DESC
    `);

    return res.status(200).json({
      success: true,
      files: result.rows
    });
  } catch (error) {
    console.error("Error fetching useful files:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}