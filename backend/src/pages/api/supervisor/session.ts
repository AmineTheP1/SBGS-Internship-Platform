import type { NextApiRequest, NextApiResponse } from "next"
import { handleCors } from "../../../utilities/cors";;
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

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