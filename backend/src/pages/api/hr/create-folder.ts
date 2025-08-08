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
    // Verify HR is authenticated
    const token = req.cookies?.hr_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    let hrId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { rhId: string };
      hrId = decoded.rhId;
    } catch (error) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Folder name is required" });
    }

    // Check if folder with same name already exists
    const existingFolder = await pool.query(`
      SELECT id FROM dossiers_utiles WHERE name = $1
    `, [name]);

    if (existingFolder.rows.length > 0) {
      return res.status(400).json({ success: false, error: "A folder with this name already exists" });
    }

    // Create new folder
    const result = await pool.query(`
      INSERT INTO dossiers_utiles (
        name, 
        description, 
        created_by
      ) VALUES ($1, $2, $3) 
      RETURNING id, name, description, created_at
    `, [
      name,
      description || null,
      hrId
    ]);

    return res.status(201).json({
      success: true,
      folder: result.rows[0],
      message: "Folder created successfully"
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}