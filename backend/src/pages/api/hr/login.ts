import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

import { handleCors } from "../../../utilities/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { employeeId, password, rememberMe } = req.body;

  if (!employeeId || !password) {
    return res.status(400).json({ success: false, error: "Veuillez remplir tous les champs." });
  }

  try {
    // Find the RH user by employeeId (rhId)
    const result = await pool.query(
      "SELECT * FROM rh WHERE rhId = $1",
      [employeeId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Identifiants incorrects. Veuillez réessayer." });
    }

    const user = result.rows[0];

    // Use bcrypt to compare the password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: "Identifiants incorrects. Veuillez réessayer." });
    }

    // Login successful
    // Generate JWT token
    const token = jwt.sign(
      { 
        rhId: user.rhid || user.rhId, 
        nom: user.nom, 
        prenom: user.prenom, 
        email: user.email,
        role: 'hr' // Add the role to the token
      },
      process.env.JWT_SECRET!,
      { expiresIn: rememberMe ? "30d" : "1h" }
    );

    // Set token as HTTP-only cookie
    res.setHeader("Set-Cookie", `hr_token=${token}; HttpOnly; Path=/; Max-Age=${rememberMe ? 60 * 60 * 24 * 30 : 60 * 60}; SameSite=Lax; Secure=false`);

    return res.status(200).json({ success: true, user: { rhId: user.rhid || user.rhId, nom: user.nom, prenom: user.prenom, email: user.email } });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
}