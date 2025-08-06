import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import sendEmail from '../../../utilities/sendEmail';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Verify HR is authenticated
    const token = req.cookies?.hr_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, error: "Subject and message are required" });
    }

    // Get all accepted interns
    const result = await pool.query(`
      SELECT DISTINCT
        c.cdtid,
        c.nom,
        c.prenom,
        c.email
      FROM candidat c
      JOIN demandes_stage d ON c.cdtid = d.cdtid
      WHERE d.statut = 'Accepté'
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "No accepted interns found" });
    }

    // Send email to each intern
    const emailPromises = result.rows.map(async (intern) => {
      const fullName = `${intern.prenom} ${intern.nom}`.trim();
      
      const emailBodyHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #dc2626;">Annonce SBGS</h2>
          <p>Bonjour ${fullName},</p>
          <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #dc2626; background-color: #f9f9f9;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p>Cordialement,</p>
          <p><strong>L'équipe des Ressources Humaines</strong><br>
          SBGS - Société des Boissons Gazeuse du Souss</p>
        </div>
      `;
      
      const emailBodyText = `
Annonce SBGS

Bonjour ${fullName},

${message}

Cordialement,
L'équipe des Ressources Humaines
SBGS - Société des Boissons Gazeuse du Souss
      `;

      return sendEmail({
        to: intern.email,
        subject: subject,
        text: emailBodyText,
        html: emailBodyHTML
      });
    });

    await Promise.all(emailPromises);

    return res.status(200).json({ 
      success: true, 
      message: `Annonce envoyée avec succès à ${result.rows.length} stagiaire(s)` 
    });

  } catch (error) {
    console.error('Error sending announcement emails:', error);
    return res.status(500).json({ 
      success: false, 
      error: "Erreur lors de l'envoi des emails d'annonce." 
    });
  }
}