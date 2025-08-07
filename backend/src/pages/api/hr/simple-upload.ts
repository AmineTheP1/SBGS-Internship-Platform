import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
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
  if (handleCors(req, res)) return;
  
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { rhId: string };
      hrId = decoded.rhId;
    } catch (error) {
      console.error("JWT verification error:", error);
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    // Test database connection
    const testResult = await pool.query("SELECT COUNT(*) FROM fichiers_utiles");
    console.log("Database test result:", testResult.rows[0]);

    // For now, just return success without processing the file
    return res.status(200).json({
      success: true,
      message: "Simple upload test successful",
      hrId: hrId,
      databaseCount: testResult.rows[0].count
    });

  } catch (error) {
    console.error("Simple upload error:", error);
    return res.status(500).json({ 
      success: false, 
      error: (error as Error).message,
      stack: (error as Error).stack
    });
  }
}
