import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function saveFile(file: any) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "reports");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const timestamp = Date.now();
  const originalName = file.originalFilename || file.newFilename || 'report.pdf';
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const finalFilename = `${timestamp}_${safeName}`;
  
  const filePath = path.join(uploadsDir, finalFilename);
  
  // Copy the file from the temporary location to the final location
  try {
    await fs.promises.copyFile(file.filepath, filePath);
    // Clean up the temporary file
    await fs.promises.unlink(file.filepath);
  } catch (error) {
    console.error('Error copying file:', error);
    throw new Error('Failed to save file');
  }
  
  const savedUrl = "/uploads/reports/" + finalFilename;
  return savedUrl;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const form = formidable({
    uploadDir: path.join(process.cwd(), "tmp"), // Use a temporary directory
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });

  await new Promise<void>((resolve) => {
    form.parse(req, async (err: any, fields: formidable.Fields, files: formidable.Files) => {
      if (err) {
        console.error('Formidable error:', err);
        res.status(500).json({ success: false, error: "Erreur lors de l'upload." });
        return resolve();
      }

      try {
        const { cdtid, reportTitle, reportDescription } = fields;
        
        // Handle array values from formidable
        const candidateId = Array.isArray(cdtid) ? cdtid[0] : cdtid;
        const title = Array.isArray(reportTitle) ? reportTitle[0] : reportTitle;
        const description = Array.isArray(reportDescription) ? reportDescription[0] : reportDescription;
        const reportFile = files.report;

        if (!candidateId || !title || !reportFile) {
          return res.status(400).json({ success: false, error: "Tous les champs sont requis." });
        }

        // Check if candidate exists
        console.log('Checking candidate with ID:', candidateId);
        console.log('Type of candidateId:', typeof candidateId);
        console.log('Length of candidateId:', candidateId ? candidateId.length : 'null');
        
        const candidateCheck = await pool.query(
          'SELECT cdtid FROM candidat WHERE cdtid = $1',
          [candidateId]
        );

        console.log('Candidate check result:', candidateCheck.rows);
        console.log('Number of rows found:', candidateCheck.rows.length);

        if (candidateCheck.rows.length === 0) {
          return res.status(404).json({ success: false, error: "Candidat non trouvé." });
        }

        // Save the report file
        const file = Array.isArray(reportFile) ? reportFile[0] : reportFile;
        const reportUrl = await saveFile(file);

        // Check existing table structure
        const tableCheck = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'rapports_stage'
          ORDER BY ordinal_position
        `);
        console.log('Existing table columns:', tableCheck.rows);

        // Check stages table structure
        const stagesTableCheck = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'stages'
          ORDER BY ordinal_position
        `);
        console.log('Stages table columns:', stagesTableCheck.rows);

        // Check what tables exist that might link candidates to stages
        const tablesCheck = await pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name LIKE '%stage%' OR table_name LIKE '%affect%'
          ORDER BY table_name
        `);
        console.log('Tables with "stage" or "affect":', tablesCheck.rows);

        // Check if candidate has an assigned stage using assignations_stage table
        const stageCheck = await pool.query(`
          SELECT s.stagesid 
          FROM assignations_stage a
          JOIN stages s ON a.resid = s.responsables_stageid
          WHERE a.cdtid = $1
        `, [candidateId]);
        console.log('Stage check result:', stageCheck.rows);

        // Insert the report using existing column names
        const rstid = crypto.randomBytes(8).toString('hex');
        const stagesid = stageCheck.rows.length > 0 ? stageCheck.rows[0].stagesid : null;
        
        if (!stagesid) {
          return res.status(400).json({ success: false, error: "Aucun stage assigné à ce candidat." });
        }
        
        // First, let's add a cdtid column to the rapports_stage table if it doesn't exist
        try {
          await pool.query(`
            ALTER TABLE rapports_stage 
            ADD COLUMN IF NOT EXISTS cdtid VARCHAR(16) REFERENCES candidat(cdtid)
          `);
        } catch (error: any) {
          console.log('Column might already exist:', error.message);
        }
        
        // Add a titre column if it doesn't exist
        try {
          await pool.query(`
            ALTER TABLE rapports_stage 
            ADD COLUMN IF NOT EXISTS titre VARCHAR(255)
          `);
        } catch (error: any) {
          console.log('Titre column might already exist:', error.message);
        }
        
        await pool.query(
          `INSERT INTO rapports_stage (rstid, stagesid, url, dateenvoi, statut, commentaire, cdtid, titre) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [rstid, stagesid, reportUrl, new Date().toISOString().split('T')[0], 'En attente', description || '', candidateId, title || '']
        );

        res.status(200).json({ 
          success: true, 
          message: "Rapport soumis avec succès. En attente d'approbation du superviseur."
        });

      } catch (error: any) {
        console.error('Error uploading report:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          detail: error.detail,
          hint: error.hint
        });
        res.status(500).json({ success: false, error: "Erreur lors de la soumission du rapport." });
      }
      resolve();
    });
  });
} 