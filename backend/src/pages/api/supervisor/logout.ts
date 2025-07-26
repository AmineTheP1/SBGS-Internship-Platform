import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Clear the supervisor_token cookie
  res.setHeader(
    "Set-Cookie",
    "supervisor_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  );
  res.status(200).json({ success: true });
} 