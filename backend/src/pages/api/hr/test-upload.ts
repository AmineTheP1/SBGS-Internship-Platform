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
    // Test database connection
    const dbResult = await pool.query("SELECT COUNT(*) FROM fichiers_utiles");
    
    // Test JWT secret
    const jwtSecret = process.env.JWT_SECRET;
    
    // Test environment variables
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Not set",
      JWT_SECRET: jwtSecret ? "Set" : "Not set",
      NODE_ENV: process.env.NODE_ENV
    };

    return res.status(200).json({
      success: true,
      message: "Test endpoint working",
      database: {
        connection: "OK",
        tableCount: dbResult.rows[0].count
      },
      environment: envVars
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return res.status(500).json({ 
      success: false, 
      error: (error as Error).message,
      stack: (error as Error).stack
    });
  }
}
