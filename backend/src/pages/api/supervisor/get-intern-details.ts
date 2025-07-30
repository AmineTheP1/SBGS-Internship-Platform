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
    const { cdtid } = req.query;

    if (!cdtid) {
      return res.status(400).json({ success: false, error: "CDTID is required" });
    }

    // Verify supervisor is assigned to this intern
    const assignmentCheck = await pool.query(
      `SELECT * FROM assignations_stage WHERE resid = $1 AND cdtid = $2 AND statut = 'Actif'`,
      [supervisor.resid, cdtid]
    );

    if (assignmentCheck.rows.length === 0) {
      return res.status(403).json({ success: false, error: "Not authorized to view this intern" });
    }

    // Create absences table if it doesn't exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS absences (
          id SERIAL PRIMARY KEY,
          cdtid VARCHAR(255) NOT NULL,
          date_absence DATE NOT NULL,
          motif TEXT,
          justifiee BOOLEAN DEFAULT false,
          notee_par VARCHAR(255) NOT NULL,
          date_creation TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (cdtid) REFERENCES candidat(cdtid)
        )
      `);
    } catch (error) {
      console.log("Absences table might already exist or error occurred:", error);
    }

    // Create presence table if it doesn't exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS presence (
          id SERIAL PRIMARY KEY,
          cdtid VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          heure_entree TIMESTAMP,
          heure_sortie TIMESTAMP,
          statut VARCHAR(50) DEFAULT 'En cours',
          confirme_par_superviseur BOOLEAN DEFAULT NULL,
          date_confirmation TIMESTAMP,
          FOREIGN KEY (cdtid) REFERENCES candidat(cdtid)
        )
      `);
      
      // Add confirmation columns if they don't exist
      try {
        await pool.query(`ALTER TABLE presence ADD COLUMN IF NOT EXISTS confirme_par_superviseur BOOLEAN DEFAULT NULL`);
        await pool.query(`ALTER TABLE presence ADD COLUMN IF NOT EXISTS date_confirmation TIMESTAMP`);
      } catch (error) {
        console.log("Confirmation columns might already exist:", error);
      }
    } catch (error) {
      console.log("Presence table might already exist or error occurred:", error);
    }

    // Create rapports_journaliers table if it doesn't exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rapports_journaliers (
          id SERIAL PRIMARY KEY,
          cdtid VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          taches_effectuees TEXT,
          documents_utilises TEXT,
          date_creation TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (cdtid) REFERENCES candidat(cdtid)
        )
      `);
    } catch (error) {
      console.log("Rapports_journaliers table might already exist or error occurred:", error);
    }

    // Create rapports_stage table if it doesn't exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rapports_stage (
          rstid SERIAL PRIMARY KEY,
          cdtid VARCHAR(255) NOT NULL,
          titre VARCHAR(255),
          contenu TEXT,
          fichier_url VARCHAR(500),
          statut VARCHAR(50) DEFAULT 'En attente',
          commentaires_superviseur TEXT,
          note INTEGER,
          date_revision TIMESTAMP,
          revise_par VARCHAR(255),
          date_creation TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (cdtid) REFERENCES candidat(cdtid)
        )
      `);
    } catch (error) {
      console.log("Rapports_stage table might already exist or error occurred:", error);
    }

    // Get intern details
    const internResult = await pool.query(
      `SELECT 
        c.*,
        d.statut as statut_candidature,
        d.typestage,
        d.periode
       FROM candidat c
       LEFT JOIN demandes_stage d ON c.cdtid = d.cdtid
       WHERE c.cdtid = $1`,
      [cdtid]
    );

    // Get attendance records (last 30 days)
    const attendanceResult = await pool.query(
      `SELECT * FROM presence WHERE cdtid = $1 ORDER BY date DESC LIMIT 30`,
      [cdtid]
    );

    // Get daily reports (last 30 days)
    const dailyReportsResult = await pool.query(
      `SELECT * FROM rapports_journaliers WHERE cdtid = $1 ORDER BY date DESC LIMIT 30`,
      [cdtid]
    );

    // Get absences
    const absencesResult = await pool.query(
      `SELECT * FROM absences WHERE cdtid = $1 ORDER BY date_absence DESC`,
      [cdtid]
    );

    // Get final internship report (skip for now since table structure is different)
    // const finalReportResult = await pool.query(
    //   `SELECT * FROM rapports_stage WHERE cdtid = $1 ORDER BY date_creation DESC LIMIT 1`,
    //   [cdtid]
    // );

    return res.status(200).json({ 
      success: true,
      intern: internResult.rows[0],
      attendance: attendanceResult.rows,
      dailyReports: dailyReportsResult.rows,
      absences: absencesResult.rows,
      finalReport: null // Skip for now since table structure is different
    });

  } catch (error) {
    console.error("Error getting intern details:", error);
    console.error("Error details:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
      cdtid: req.query.cdtid
    });
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 