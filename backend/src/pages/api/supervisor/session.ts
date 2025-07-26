import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const token = req.cookies?.supervisor_token;
  if (!token) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }
  try {
    const supervisor = jwt.verify(token, process.env.JWT_SECRET!);
    return res.status(200).json({ success: true, supervisor });
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
} 