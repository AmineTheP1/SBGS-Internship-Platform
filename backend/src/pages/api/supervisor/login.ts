import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { handleCors } from "../../../utilities/cors";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { supervisorId, password, rememberMe } = req.body;

  if (!supervisorId || !password) {
    return res.status(400).json({ success: false, error: "Veuillez remplir tous les champs." });
  }

  try {
    // Find the supervisor by supervisorId (resid)
    const result = await pool.query(
      "SELECT * FROM responsables_stage WHERE resid = $1",
      [supervisorId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Identifiants incorrects. Veuillez réessayer." });
    }

    const supervisor = result.rows[0];

    // Use bcrypt to compare the password
    const passwordMatch = await bcrypt.compare(password, supervisor.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: "Identifiants incorrects. Veuillez réessayer." });
    }

    // Login successful
    // Generate JWT token
    const token = jwt.sign(
      { 
        resid: supervisor.resid, 
        nom: supervisor.nom, 
        prenom: supervisor.prenom, 
        email: supervisor.email,
        service: supervisor.service
      },
      process.env.JWT_SECRET!,
      { expiresIn: rememberMe ? "30d" : "1h" }
    );

    // Set token as HTTP-only cookie
    res.setHeader("Set-Cookie", `supervisor_token=${token}; HttpOnly; Path=/; Max-Age=${rememberMe ? 60 * 60 * 24 * 30 : 60 * 60}; SameSite=Lax`);

    return res.status(200).json({ 
      success: true, 
      supervisor: { 
        resid: supervisor.resid, 
        nom: supervisor.nom, 
        prenom: supervisor.prenom, 
        email: supervisor.email,
        service: supervisor.service
      } 
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 