import type { NextApiRequest, NextApiResponse } from "next";
import sendEmail from "../../utilities/sendEmail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
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

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: "Tous les champs sont obligatoires." });
  }

  // Send confirmation email to the sender
  await sendEmail({
    to: email,
    subject: "Confirmation de réception de votre message",
    text: `Bonjour ${name},

Votre message a bien été reçu par l'équipe SBGS. Nous vous répondrons dans les plus brefs délais.

Résumé de votre message :
Sujet : ${subject}
Message : ${message}

Merci de nous avoir contactés !

Cordialement,
L'équipe SBGS`
  });

  return res.status(200).json({ success: true });
}