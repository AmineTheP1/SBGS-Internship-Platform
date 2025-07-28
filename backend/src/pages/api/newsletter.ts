import type { NextApiRequest, NextApiResponse } from "next";
import sendEmail from "../../utilities/sendEmail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: "Email requis." });
  }

  await sendEmail({
    to: email,
    subject: "Merci pour votre inscription à la newsletter SBGS",
    text: `Bonjour,\n\nMerci de vous être inscrit à la newsletter SBGS !\n\nCordialement,\nL'équipe SBGS`
  });
  return res.status(200).json({ success: true });
}
