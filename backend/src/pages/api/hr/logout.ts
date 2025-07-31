import type { NextApiRequest, NextApiResponse } from "next"
import { handleCors } from "../../../utilities/cors";;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Clear the hr_token cookie
  res.setHeader(
    "Set-Cookie",
    "hr_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  );
  res.status(200).json({ success: true });
} 