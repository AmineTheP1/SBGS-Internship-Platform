// nextjs-app/src/pages/api/super-admin/create-rh.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  // Simple "admin password" check (replace with real auth in production)
  if (req.headers["x-admin-secret"] !== process.env.SUPER_ADMIN_SECRET) {
    return res.status(403).json({ success: false, error: "Forbidden" });
  }

  const { rhId, nom, prenom, email, password } = req.body;
  if (!rhId || !nom || !prenom || !email || !password) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO rh (rhId, nom, prenom, email, password) VALUES ($1, $2, $3, $4, $5)",
      [rhId, nom, prenom, email, hashedPassword]
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
}