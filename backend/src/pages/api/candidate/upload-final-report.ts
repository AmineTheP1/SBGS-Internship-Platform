import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import formidable from "formidable";
import fs from "fs";
import path from "path";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Get candidate info from token
    const token = req.cookies?.candidate_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const candidate = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Parse form data
    const form = formidable({
      uploadDir: path.join(process.cwd(), "public/uploads"),
      keepExtensions: true,
      maxFiles: 1,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const { titre, contenu } = fields;
    const file = files.fichier?.[0];

    if (!titre || !contenu) {
      return res.status(400).json({ 
        success: false, 
        error: "Titre et contenu sont obligatoires" 
      });
    }

    // Check if candidate already has a final report
    const existingReport = await pool.query(
      `SELECT * FROM rapports_stage WHERE cdtid = $1`,
      [candidate.cdtid]
    );

    if (existingReport.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Vous avez déjà soumis un rapport de stage" 
      });
    }

    // Create final reports table if it doesn't exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rapports_stage (
          id SERIAL PRIMARY KEY,
          cdtid VARCHAR(255) NOT NULL,
          titre VARCHAR(255) NOT NULL,
          contenu TEXT NOT NULL,
          fichier_url VARCHAR(500),
          statut VARCHAR(50) DEFAULT 'En attente',
          note INTEGER CHECK (note >= 0 AND note <= 20),
          commentaires_superviseur TEXT,
          date_soumission TIMESTAMP DEFAULT NOW(),
          date_revision TIMESTAMP,
          revise_par VARCHAR(255),
          FOREIGN KEY (cdtid) REFERENCES candidat(cdtid)
        )
      `);
    } catch (error) {
      console.log("Final reports table might already exist or error occurred:", error);
    }

    // Generate file URL if file was uploaded
    let fichierUrl = null;
    if (file) {
      const fileName = `${Date.now()}_${file.originalFilename}`;
      const newPath = path.join(process.cwd(), "public/uploads", fileName);
      
      // Move file to uploads directory
      fs.renameSync(file.filepath, newPath);
      fichierUrl = `/uploads/${fileName}`;
    }

    // Insert final report
    await pool.query(
      `INSERT INTO rapports_stage (cdtid, titre, contenu, fichier_url) 
       VALUES ($1, $2, $3, $4)`,
      [candidate.cdtid, titre, contenu, fichierUrl]
    );

    return res.status(200).json({ 
      success: true, 
      message: "Rapport de stage soumis avec succès"
    });

  } catch (error) {
    console.error("Error uploading final report:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 