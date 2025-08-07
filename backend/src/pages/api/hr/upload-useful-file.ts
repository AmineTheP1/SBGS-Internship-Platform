import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { handleCors } from "../../../utilities/cors";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  await handleCors(req, res);
  
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      hrId = decoded.id;
    } catch (error) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "fichiers_utiles");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Parse form data
    const form = new IncomingForm({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing form:", err);
          res.status(500).json({ success: false, error: "Error uploading file" });
          return resolve(undefined);
        }

        try {
          // Extract form fields
          const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
          const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
          
          if (!title) {
            res.status(400).json({ success: false, error: "Title is required" });
            return resolve(undefined);
          }

          // Get file information
          const file = Array.isArray(files.file) ? files.file[0] : files.file;
          if (!file) {
            res.status(400).json({ success: false, error: "File is required" });
            return resolve(undefined);
          }

          // Generate unique filename
          const fileId = uuidv4();
          const originalFilename = file.originalFilename || "unknown_file";
          const fileExtension = path.extname(originalFilename);
          const newFilename = `${Date.now()}_${fileId}${fileExtension}`;
          const newFilePath = path.join(uploadsDir, newFilename);

          // Rename the file
          fs.renameSync(file.filepath, newFilePath);

          // Save file information to database
          const relativePath = `/uploads/fichiers_utiles/${newFilename}`;
          const result = await pool.query(`
            INSERT INTO fichiers_utiles (
              title, 
              description, 
              filename, 
              file_path, 
              file_type, 
              uploaded_by
            ) VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id
          `, [
            title,
            description || null,
            originalFilename,
            relativePath,
            file.mimetype || null,
            hrId
          ]);

          res.status(200).json({
            success: true,
            fileId: result.rows[0].id,
            message: "File uploaded successfully"
          });
          return resolve(undefined);
        } catch (error) {
          console.error("Error processing file:", error);
          res.status(500).json({ success: false, error: "Server error" });
          return resolve(undefined);
        }
      });
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}