import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

  try {
    // Test database connection
    let dbStatus = "unknown";
    try {
      await pool.query('SELECT 1');
      dbStatus = "connected";
    } catch (dbError) {
      dbStatus = "failed";
      console.error('Database connection error:', dbError);
    }

    // Test file upload
    const form = formidable({
      uploadDir: path.join(process.cwd(), "tmp"),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
    });

    await new Promise<void>((resolve) => {
      form.parse(req, async (err: any, fields: formidable.Fields, files: formidable.Files) => {
        if (err) {
          console.error('Formidable error:', err);
          res.status(500).json({ 
            success: false, 
            error: "Formidable error",
            details: err.message,
            dbStatus
          });
          return resolve();
        }

        try {
          const { testField } = fields;
          const testFile = files.testFile;

          let fileStatus = "no file";
          let filePath = "";

          if (testFile) {
            const file = Array.isArray(testFile) ? testFile[0] : testFile;
            fileStatus = "received";
            filePath = file.filepath;
            
            // Test directory creation
            const uploadsDir = path.join(process.cwd(), "public", "uploads", "test");
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            // Test file copy
            const timestamp = Date.now();
            const finalFilename = `test_${timestamp}.txt`;
            const finalPath = path.join(uploadsDir, finalFilename);
            
            try {
              await fs.promises.copyFile(file.filepath, finalPath);
              await fs.promises.unlink(file.filepath);
              fileStatus = "saved";
              filePath = finalPath;
            } catch (copyError) {
              fileStatus = "copy failed";
              console.error('File copy error:', copyError);
            }
          }

          res.status(200).json({ 
            success: true, 
            message: "Test completed",
            dbStatus,
            fileStatus,
            filePath,
            fields: Object.keys(fields),
            files: Object.keys(files),
            env: {
              hasDatabaseUrl: !!process.env.DATABASE_URL,
              hasSmptHost: !!process.env.SMTP_HOST,
              nodeEnv: process.env.NODE_ENV
            }
          });

        } catch (error) {
          console.error('Test error:', error);
          res.status(500).json({ 
            success: false, 
            error: "Test error",
            details: error.message,
            dbStatus
          });
        }
        resolve();
      });
    });

  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      success: false, 
      error: "Handler error",
      details: error.message
    });
  }
} 