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

  try {
    // Verify HR authentication
    const token = req.cookies?.hr_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated as HR" });
    }

    const hr = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!hr.isAdmin) {
      return res.status(403).json({ success: false, error: "Admin access required" });
    }

    const { nom, prenom, email, service, telephone } = req.body;

    if (!nom || !prenom || !email || !service) {
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
          rspid VARCHAR(255) UNIQUE NOT NULL,
          nom VARCHAR(255) NOT NULL,
          prenom VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          service VARCHAR(255) NOT NULL,
          telephone VARCHAR(50),
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
    } catch (error) {
      console.log("Supervisors table might already exist or error occurred:", error);
    }

    // Generate supervisor ID (rsp001, rsp002, etc.)
    const supervisorCount = await pool.query("SELECT COUNT(*) FROM responsables_stage");
    const supervisorId = `rsp${String(supervisorCount.rows[0].count + 1).padStart(3, '0')}`;

    // Generate random password
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Insert supervisor
    await pool.query(
      `INSERT INTO responsables_stage (rspid, nom, prenom, email, service, telephone, password) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [supervisorId, nom, prenom, email, service, telephone, hashedPassword]
    );

    // Send email with credentials
    const sendEmailModule = await import("../../../utilities/sendEmail");
    const emailText = `Bonjour ${prenom} ${nom},

Vous avez été nommé(e) Responsable de Stage chez SBGS.

Vos identifiants de connexion :
Identifiant : ${supervisorId}
Mot de passe : ${randomPassword}

Vous pouvez vous connecter sur : http://localhost:5173/supervisor-login

Service d'affectation : ${service}

Cordialement,
L'équipe RH - SBGS`;

    await sendEmailModule.default({ to: email, subject: "Nomination Responsable de Stage - SBGS", text: emailText });

    return res.status(200).json({ 
      success: true, 
      message: "Responsable de stage créé avec succès",
      supervisor: {
        rspid: supervisorId,
        nom,
        prenom,
        email,
        service,
        telephone
      }
    });

  } catch (error) {
    console.error("Error creating supervisor:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 