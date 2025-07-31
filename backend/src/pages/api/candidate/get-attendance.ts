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
    // Get candidate info from token
    const token = req.cookies?.candidate_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const candidate = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get today's presence record
    const todayRecord = await pool.query(
      `SELECT * FROM presence WHERE cdtid = $1 AND date = $2`,
      [candidate.cdtid, today]
    );

    // Get recent presence records (last 7 days)
    const recentRecords = await pool.query(
      `SELECT * FROM presence WHERE cdtid = $1 ORDER BY date DESC LIMIT 7`,
      [candidate.cdtid]
    );

    // Get today's daily report
    const todayReport = await pool.query(
      `SELECT * FROM rapports_journaliers WHERE cdtid = $1 AND date = $2`,
      [candidate.cdtid, today]
    );

    return res.status(200).json({ 
      success: true,
      todayRecord: todayRecord.rows[0] || null,
      recentRecords: recentRecords.rows,
      todayReport: todayReport.rows[0] || null,
      currentStatus: todayRecord.rows[0]?.statut || 'Non pointé'
    });

  } catch (error) {
    console.error("Error getting attendance:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 