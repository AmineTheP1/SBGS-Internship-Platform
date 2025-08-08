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

    const { folderId } = req.query;

    if (!folderId) {
      return res.status(400).json({ success: false, error: "Folder ID is required" });
    }

    // Check if folder exists
    const folderResult = await pool.query(`
      SELECT id FROM dossiers_utiles WHERE id = $1
    `, [folderId]);

    if (folderResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Folder not found" });
    }

    // Check if folder has files
    const filesResult = await pool.query(`
      SELECT COUNT(*) FROM fichiers_utiles WHERE folder_id = $1
    `, [folderId]);

    const fileCount = parseInt(filesResult.rows[0].count);
    if (fileCount > 0) {
      // Option 1: Return error if folder has files
      // return res.status(400).json({ 
      //   success: false, 
      //   error: `Cannot delete folder with files. The folder contains ${fileCount} file(s).` 
      // });

      // Option 2: Set folder_id to NULL for all files in the folder
      await pool.query(`
        UPDATE fichiers_utiles SET folder_id = NULL WHERE folder_id = $1
      `, [folderId]);
    }

    // Delete folder
    await pool.query(`
      DELETE FROM dossiers_utiles WHERE id = $1
    `, [folderId]);

    return res.status(200).json({
      success: true,
      message: "Folder deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}