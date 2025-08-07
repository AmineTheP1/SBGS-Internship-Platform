import type { NextApiRequest, NextApiResponse } from "next";

export function setCorsHeaders(req: NextApiRequest, res: NextApiResponse) {
  // Allow requests from localhost (development) and any origin (production)
  const allowedOrigins = [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',  // Frontend dev server
    'http://localhost',       // Docker setup
    'http://localhost:80',    // Nginx proxy
  ];
  
  // Get the origin from the request header
  const requestOrigin = req?.headers?.origin || '';
  // Set the origin to the requesting origin if it's in the allowed list, otherwise use the first allowed origin
  const origin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];
  
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function handleCors(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(req, res);
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  
  return false;
}