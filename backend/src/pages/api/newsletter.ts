import type { NextApiRequest, NextApiResponse } from "next";
import sendEmail from "../../utilities/sendEmail";
import { handleCors } from "../../utilities/cors";

// In-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const EMAIL_SUBMISSIONS = new Set<string>();

// Rate limiting: 1 newsletter signup per IP per hour
const RATE_LIMIT = {
  maxRequests: 1,
  windowMs: 60 * 60 * 1000, // 1 hour
};

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function getRateLimitKey(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req.socket.remoteAddress;
  return `newsletter:${ip}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return false;
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return true;
  }

  record.count++;
  return false;
}

function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false; // RFC 5321 limit
  if (!EMAIL_REGEX.test(email)) return false;
  
  // Block suspicious patterns
  const suspiciousPatterns = [
    /test@/i,
    /admin@/i,
    /noreply@/i,
    /no-reply@/i,
    /spam@/i,
    /abuse@/i,
    /postmaster@/i,
    /@example\./i,
    /@test\./i,
    /@localhost/i,
    /\+.*\+.*@/i, // Multiple + signs
    /\.{2,}/,     // Multiple consecutive dots
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(email));
}

function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
    'tempmail.org', 'throwaway.email', 'temp-mail.org',
    'yopmail.com', 'maildrop.cc', 'sharklasers.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  // Rate limiting check
  const rateLimitKey = getRateLimitKey(req);
  if (isRateLimited(rateLimitKey)) {
    console.log(`Newsletter rate limit exceeded for IP: ${rateLimitKey}`);
    return res.status(429).json({ 
      success: false, 
      error: "Trop de tentatives. Veuillez réessayer dans une heure." 
    });
  }

  const { email, honeypot } = req.body;

  // Honeypot check - if filled, it's a bot
  if (honeypot && honeypot.trim() !== '') {
    console.log(`Bot detected via honeypot: ${honeypot}`);
    // Return success to not reveal the honeypot
    return res.status(200).json({ success: true });
  }
  
  // Basic validation
  if (!email) {
    return res.status(400).json({ success: false, error: "Email requis." });
  }

  // Email validation
  if (!validateEmail(email)) {
    console.log(`Invalid email format: ${email}`);
    return res.status(400).json({ success: false, error: "Format d'email invalide." });
  }

  // Check for disposable email
  if (isDisposableEmail(email)) {
    console.log(`Disposable email blocked: ${email}`);
    return res.status(400).json({ success: false, error: "Les emails temporaires ne sont pas autorisés." });
  }

  // Check if email already subscribed (prevent duplicates)
  const normalizedEmail = email.toLowerCase().trim();
  if (EMAIL_SUBMISSIONS.has(normalizedEmail)) {
    console.log(`Duplicate email submission: ${normalizedEmail}`);
    // Return success to prevent email enumeration
    return res.status(200).json({ success: true, message: "Email déjà inscrit." });
  }

  try {
    // Add to submissions set
    EMAIL_SUBMISSIONS.add(normalizedEmail);

    // Send email
    await sendEmail({
      to: normalizedEmail,
      subject: "Merci pour votre inscription à la newsletter SBGS",
      text: `Bonjour,\n\nMerci de vous être inscrit à la newsletter SBGS !\n\nCordialement,\nL'équipe SBGS`
    });

    console.log(`Newsletter subscription successful: ${normalizedEmail}`);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    // Remove from set if email failed
    EMAIL_SUBMISSIONS.delete(normalizedEmail);
    return res.status(500).json({ success: false, error: "Erreur lors de l'inscription." });
  }
}
