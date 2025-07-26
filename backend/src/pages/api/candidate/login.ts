import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

  const { candidateId, password, rememberMe } = req.body;

  if (!candidateId || !password) {
    return res.status(400).json({ success: false, error: "Veuillez remplir tous les champs." });
  }

  try {
    // Find the candidate by candidateId (cdtid)
    const result = await pool.query(
      "SELECT c.*, d.statut, d.typestage, d.periode FROM candidat c LEFT JOIN demandes_stage d ON c.cdtid = d.cdtid WHERE c.cdtid = $1",
      [candidateId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Identifiants incorrects. Veuillez réessayer." });
    }

    const candidate = result.rows[0];

    // Check if candidate has a password (only accepted candidates should have passwords)
    if (!candidate.password) {
      return res.status(401).json({ success: false, error: "Votre candidature n'a pas encore été acceptée ou vous n'avez pas encore reçu vos identifiants." });
    }

    // Use bcrypt to compare the password
    const passwordMatch = await bcrypt.compare(password, candidate.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: "Identifiants incorrects. Veuillez réessayer." });
    }

    // Check if candidate is accepted
    if (candidate.statut !== 'Accepté') {
      return res.status(401).json({ success: false, error: "Votre candidature n'a pas encore été acceptée." });
    }

    // Login successful
    // Generate JWT token
    const token = jwt.sign(
      { 
        cdtid: candidate.cdtid, 
        nom: candidate.nom, 
        prenom: candidate.prenom, 
        email: candidate.email,
        statut: candidate.statut,
        typestage: candidate.typestage,
        periode: candidate.periode,
        imageurl: candidate.imageurl
      },
      process.env.JWT_SECRET!,
      { expiresIn: rememberMe ? "30d" : "1h" }
    );

    // Set token as HTTP-only cookie
    res.setHeader("Set-Cookie", `candidate_token=${token}; HttpOnly; Path=/; Max-Age=${rememberMe ? 60 * 60 * 24 * 30 : 60 * 60}; SameSite=Lax`);

    return res.status(200).json({ 
      success: true, 
      candidate: { 
        cdtid: candidate.cdtid, 
        nom: candidate.nom, 
        prenom: candidate.prenom, 
        email: candidate.email,
        statut: candidate.statut,
        typestage: candidate.typestage,
        periode: candidate.periode,
        imageurl: candidate.imageurl
      } 
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 