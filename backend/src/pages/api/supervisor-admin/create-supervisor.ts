import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-secret");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Verify admin secret
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== "SecretGetOut") {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { resid, nom, prenom, email, service, password } = req.body;

    if (!resid || !nom || !prenom || !email || !service || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Tous les champs obligatoires doivent être remplis" 
      });
    }

    // Create supervisors table if it doesn't exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS responsables_stage (
          id SERIAL PRIMARY KEY,
          resid VARCHAR(255) UNIQUE NOT NULL,
          nom VARCHAR(255) NOT NULL,
          prenom VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          service VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
    } catch (error) {
      console.log("Supervisors table might already exist or error occurred:", error);
    }

    // Check if supervisor ID already exists
    const existingSupervisor = await pool.query("SELECT resid FROM responsables_stage WHERE resid = $1", [resid]);
    if (existingSupervisor.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Cet identifiant responsable existe déjà" 
      });
    }

    // Check if email already exists
    const existingEmail = await pool.query("SELECT email FROM responsables_stage WHERE email = $1", [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Cet email existe déjà" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert supervisor
    await pool.query(
      `INSERT INTO responsables_stage (resid, nom, prenom, email, service, password) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [resid, nom, prenom, email, service, hashedPassword]
    );

    // Send email with credentials
    const sendEmailModule = await import("../../../utilities/sendEmail");
    const emailText = `Bonjour ${prenom} ${nom},

Votre compte Responsable de Stage a été créé avec succès.

Vos identifiants de connexion :
Identifiant : ${resid}
Mot de passe : ${password}

Vous pouvez vous connecter sur : http://localhost:5173/supervisor-login

Cordialement,
L'équipe SBGS`;

    await sendEmailModule.default({ to: email, subject: "Compte Responsable de Stage - SBGS", text: emailText });

    return res.status(200).json({ 
      success: true, 
      message: "Responsable de stage créé avec succès",
      supervisor: {
        resid,
        nom,
        prenom,
        email,
        service
      }
    });

  } catch (error) {
    console.error("Error creating supervisor:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 