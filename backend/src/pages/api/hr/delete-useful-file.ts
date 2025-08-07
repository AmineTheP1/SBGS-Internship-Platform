import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { handleCors } from "../../../utilities/cors";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;
  
  if (req.method !== "DELETE") {
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

    const { fileId } = req.query;

    if (!fileId) {
      return res.status(400).json({ success: false, error: "File ID is required" });
    }

    // Get file information from database
    const fileResult = await pool.query(`
      SELECT file_path
      FROM fichiers_utiles
      WHERE id = $1
    `, [fileId]);

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    const filePath = path.join(process.cwd(), fileResult.rows[0].file_path);

    // Delete file from database
    await pool.query(`
      DELETE FROM fichiers_utiles
      WHERE id = $1
    `, [fileId]);

    // Delete file from filesystem if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(200).json({
      success: true,
      message: "File deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}