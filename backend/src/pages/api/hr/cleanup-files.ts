import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    
    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json({ 
        success: true, 
        message: "Uploads directory does not exist",
        files: []
      });
    }

    const files = fs.readdirSync(uploadsDir);
    const fileStats = files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    });

    if (req.method === "DELETE") {
      // Clean up old files (older than 1 hour for testing)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      const oldFiles = fileStats.filter(file => file.created.getTime() < oneHourAgo);
      
      oldFiles.forEach(file => {
        const filePath = path.join(uploadsDir, file.filename);
        fs.unlinkSync(filePath);
        console.log(`Deleted old file: ${file.filename}`);
      });

      return res.status(200).json({ 
        success: true, 
        message: `Cleaned up ${oldFiles.length} old files`,
        deletedFiles: oldFiles.map(f => f.filename),
        remainingFiles: fileStats.filter(file => file.created.getTime() >= oneHourAgo)
      });
    }

    return res.status(200).json({ 
      success: true, 
      files: fileStats,
      totalFiles: files.length
    });

  } catch (error) {
    console.error("Error in cleanup:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 