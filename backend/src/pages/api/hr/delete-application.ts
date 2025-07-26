import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { dsgid } = req.body;

    if (!dsgid) {
      return res.status(400).json({ success: false, error: "Application ID is required" });
    }

    // First, get the CV file path to delete it from the filesystem
    const cvResult = await pool.query(
      "SELECT url FROM pieces_jointes WHERE dsgid = $1 AND typepiece = 'CV'",
      [dsgid]
    );

    // Delete the CV file from filesystem if it exists
    if (cvResult.rows.length > 0) {
      const cvUrl = cvResult.rows[0].url;
      if (cvUrl) {
        const filePath = path.join(process.cwd(), "public", cvUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("Deleted CV file:", filePath);
        }
      }
    }

    // Get the candidate ID before deleting the application
    const candidateResult = await pool.query(
      "SELECT cdtid FROM demandes_stage WHERE dsgid = $1",
      [dsgid]
    );

    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }

    const cdtid = candidateResult.rows[0].cdtid;

    // Delete in the correct order to respect foreign key constraints
    // 1. Delete pieces_jointes (CV files)
    await pool.query("DELETE FROM pieces_jointes WHERE dsgid = $1", [dsgid]);
    
    // 2. Delete demandes_stage (application)
    await pool.query("DELETE FROM demandes_stage WHERE dsgid = $1", [dsgid]);
    
    // 3. Delete candidat (candidate)
    await pool.query("DELETE FROM candidat WHERE cdtid = $1", [cdtid]);

    console.log(`Successfully deleted application ${dsgid} and candidate ${cdtid}`);

    return res.status(200).json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 