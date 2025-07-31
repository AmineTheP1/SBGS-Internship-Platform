import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { handleCors } from "../../../utilities/cors";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  const token = req.cookies?.hr_token;
  if (!token) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
} 