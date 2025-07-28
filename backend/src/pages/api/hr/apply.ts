import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import crypto from 'crypto';
const sendEmail = require('../../../utilities/sendEmail');

export const config = {
  api: {
    bodyParser: false,
  },
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function saveFile(file: File) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  
  console.log("File upload debug:", {
    originalFilename: file.originalFilename,
    newFilename: file.newFilename,
    filepath: file.filepath
  });
  
  // Create a better filename: timestamp_originalname
  const timestamp = Date.now();
  const originalName = file.originalFilename || file.newFilename || 'cv.pdf';
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_'); // Replace special chars
  const finalFilename = `${timestamp}_${safeName}`;
  
  const filePath = path.join(uploadsDir, finalFilename);
  await fs.promises.copyFile(file.filepath, filePath);
  const savedUrl = "/uploads/" + finalFilename;
  
  console.log("Saved file:", {
    filePath,
    savedUrl,
    finalFilename
  });
  
  return savedUrl;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
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
    uploadDir: path.join(process.cwd(), "public", "uploads"),
    keepExtensions: true,
  });

  await new Promise<void>((resolve) => {
    form.parse(req, async (err: any, fields: formidable.Fields, files: formidable.Files) => {
      if (err) {
        console.error('Formidable error:', err); 
        res.status(500).json({ success: false, error: "Erreur lors de l'upload." });
        return resolve();
      }
      try {
        // Required fields - extract string values from formidable arrays
        const nom = Array.isArray(fields.nom) ? fields.nom[0] : fields.nom;
        const prenom = Array.isArray(fields.prenom) ? fields.prenom[0] : fields.prenom;
        const cin = Array.isArray(fields.cin) ? fields.cin[0] : fields.cin;
        const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
        const telephone = Array.isArray(fields.telephone) ? fields.telephone[0] : fields.telephone;
        const ecoleid = Array.isArray(fields.ecoleid) ? fields.ecoleid[0] : fields.ecoleid;
        const typestage = Array.isArray(fields.typestage) ? fields.typestage[0] : fields.typestage;
        const fieldOfStudy = Array.isArray(fields.fieldOfStudy) ? fields.fieldOfStudy[0] : fields.fieldOfStudy;
        const currentYear = Array.isArray(fields.currentYear) ? fields.currentYear[0] : fields.currentYear;
        const internshipApplication = Array.isArray(fields.internshipApplication) ? fields.internshipApplication[0] : fields.internshipApplication;
        const periode = Array.isArray(fields.periode) ? fields.periode[0] : fields.periode;
        const moisDebut = Array.isArray(fields.moisDebut) ? fields.moisDebut[0] : fields.moisDebut;
        
        // Debug: Log the received values
        console.log("Received form data:", {
          nom, prenom, cin, email, telephone, ecoleid, typestage, fieldOfStudy, currentYear
        });
        
        let areasOfInterest: string[] = [];
        if (fields.areasOfInterest) {
          if (Array.isArray(fields.areasOfInterest)) {
            areasOfInterest = fields.areasOfInterest.map(String);
          } else {
            try {
              areasOfInterest = JSON.parse(fields.areasOfInterest as string);
            } catch {
              areasOfInterest = [fields.areasOfInterest as string];
            }
          }
        }
        let cvFile: File | undefined;
        if (files.cv) {
          cvFile = Array.isArray(files.cv) ? files.cv[0] : files.cv;
        }
        let imageFile: File | undefined;
        if (files.photo) {
          imageFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;
        }
        let imageUrl: string | null = null;
        if (imageFile) {
          imageUrl = await saveFile(imageFile);
        }
        let carteNationaleFile: File | undefined;
        if (files.carteNationale) {
          carteNationaleFile = Array.isArray(files.carteNationale) ? files.carteNationale[0] : files.carteNationale;
        }
        let conventionStageFile: File | undefined;
        if (files.conventionStage) {
          conventionStageFile = Array.isArray(files.conventionStage) ? files.conventionStage[0] : files.conventionStage;
        }
        let assuranceFile: File | undefined;
        if (files.assurance) {
          assuranceFile = Array.isArray(files.assurance) ? files.assurance[0] : files.assurance;
        }
        if (!nom || !prenom || !cin || !email || !telephone || !typestage || !fieldOfStudy || !currentYear || !internshipApplication || !cvFile || !periode || !moisDebut || !imageFile || !carteNationaleFile || !conventionStageFile || !assuranceFile) {
          return res.status(400).json({ success: false, error: "Champs manquants." });
        }
        // Save CV file
        const cvUrl = await saveFile(cvFile);
        // Generate a random cdtid
        const cdtid = crypto.randomBytes(8).toString('hex');

        // Check if domaines_interet column exists, if not create it
        try {
          await pool.query(`
            ALTER TABLE demandes_stage 
            ADD COLUMN IF NOT EXISTS domaines_interet TEXT
          `);
        } catch (error) {
          console.log("Column might already exist or error occurred:", error);
        }

        // Check if demande_stage column exists, if not create it
        try {
          await pool.query(`
            ALTER TABLE demandes_stage 
            ADD COLUMN IF NOT EXISTS demande_stage TEXT
          `);
        } catch (error) {
          console.log("Column might already exist or error occurred:", error);
        }

        // Check if mois_debut column exists, if not create it
        try {
          await pool.query(`
            ALTER TABLE demandes_stage 
            ADD COLUMN IF NOT EXISTS mois_debut VARCHAR(20)
          `);
        } catch (error) {
          console.log("mois_debut column might already exist or error occurred:", error);
        }

        // Check if imageurl column exists, if not create it
        try {
          await pool.query(`
            ALTER TABLE candidat 
            ADD COLUMN IF NOT EXISTS imageurl character varying(254)
          `);
        } catch (error) {
          console.log("imageurl column might already exist or error occurred:", error);
        }

        // Insert candidate with cdtid
        console.log("Inserting candidate with ecoleid:", ecoleid);
        await pool.query(
          `INSERT INTO candidat (cdtid, ecoleid, nom, prenom, statutetudiant, email, cin, telephone, imageurl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [cdtid, ecoleid || null, nom, prenom, currentYear, email, cin, telephone, imageUrl]
        );
        // Insert application
        const dsgid = crypto.randomBytes(8).toString('hex');
        await pool.query(
          `INSERT INTO demandes_stage (dsgid, cdtid, typestage, periode, mois_debut, statut, datesoumission, domaines_interet, demande_stage, domaine) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9)`,
          [dsgid, cdtid, typestage, periode, moisDebut, "En attente", JSON.stringify(areasOfInterest), internshipApplication, fieldOfStudy]
        );
        // Insert CV as piece jointe
        const pjtid = crypto.randomBytes(8).toString('hex');
        await pool.query(
          `INSERT INTO pieces_jointes (pjtid, dsgid, typepiece, url, dateajout) VALUES ($1, $2, $3, $4, NOW())`,
          [pjtid, dsgid, "CV", cvUrl]
        );

        const carteNationaleUrl = await saveFile(carteNationaleFile);
        const conventionStageUrl = await saveFile(conventionStageFile);
        const assuranceUrl = await saveFile(assuranceFile);

        // Insert Carte Nationale
        const pjtidCarte = crypto.randomBytes(8).toString('hex');
        await pool.query(
          `INSERT INTO pieces_jointes (pjtid, dsgid, typepiece, url, dateajout) VALUES ($1, $2, $3, $4, NOW())`,
          [pjtidCarte, dsgid, "Carte Nationale", carteNationaleUrl]
        );

        // Insert Convention de Stage
        const pjtidConvention = crypto.randomBytes(8).toString('hex');
        await pool.query(
          `INSERT INTO pieces_jointes (pjtid, dsgid, typepiece, url, dateajout) VALUES ($1, $2, $3, $4, NOW())`,
          [pjtidConvention, dsgid, "Convention de Stage", conventionStageUrl]
        );

        // Insert Assurance
        const pjtidAssurance = crypto.randomBytes(8).toString('hex');
        await pool.query(
          `INSERT INTO pieces_jointes (pjtid, dsgid, typepiece, url, dateajout) VALUES ($1, $2, $3, $4, NOW())`,
          [pjtidAssurance, dsgid, "Assurance", assuranceUrl]
        );
        // Send confirmation email
        await sendEmail({
          to: email,
          subject: "Votre demande de stage a bien été enregistrée",
          text: `Bonjour ${prenom} ${nom},\n\nVotre demande de stage a bien été enregistrée.\n\nType de stage : ${typestage}\nDurée : ${periode}\n\nNous vous contacterons après examen.\n\nCordialement,\nSBGS Plateforme`
        });
        res.status(200).json({ success: true });
        return resolve();
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: (error as Error).message });
        return resolve();
      }
    });
  });
} 