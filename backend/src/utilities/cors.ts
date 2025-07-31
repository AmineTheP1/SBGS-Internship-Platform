import type { NextApiRequest, NextApiResponse } from "next";

export function setCorsHeaders(res: NextApiResponse) {
  // Allow requests from localhost (development) and any origin (production)
  const allowedOrigins = [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',  // Frontend dev server
    'http://localhost',       // Docker setup
    'http://localhost:80',    // Nginx proxy
  ];
  
  const origin = allowedOrigins.includes('*') ? '*' : allowedOrigins.join(', ');
  
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function handleCors(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res);
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  
  return false;
} 