import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import sendEmail from '../../../utilities/sendEmail';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { attestationid, commentaires } = req.body;

    if (!attestationid) {
      return res.status(400).json({ success: false, error: "attestationid est requis." });
    }

    // Get certificate request details
    const certificateResult = await pool.query(`
      SELECT 
        a.attestationid,
        c.cdtid,
        c.nom,
        c.prenom,
        c.email,
        c.telephone,
        c.statutetudiant,
                 r.titre as rapport_titre,
        r.date_soumission as rapport_date,
        s.nom as superviseur_nom,
        s.prenom as superviseur_prenom,
        e.nom as ecole_nom,
        d.domaine,
        d.periode,
        d.mois_debut
      FROM attestations_stage a
      JOIN candidat c ON a.cdtid = c.cdtid
      JOIN rapports_stage r ON a.rapportid = r.rapportid
      LEFT JOIN superviseur s ON a.superviseurid = s.superviseurid
      LEFT JOIN ecole e ON c.ecoleid = e.ecoleid
      LEFT JOIN demandes_stage d ON c.cdtid = d.cdtid
      WHERE a.attestationid = $1
    `, [attestationid]);

    if (certificateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Demande d'attestation non trouvée." });
    }

    const certificate = certificateResult.rows[0];

    // Generate certificate PDF (simplified - in real implementation, use a PDF library)
    const certificateContent = generateCertificatePDF(certificate);
    const certificateUrl = await saveCertificate(certificateContent, certificate);

    // Update certificate status
    await pool.query(
      `UPDATE attestations_stage 
       SET statut = 'Généré', date_generation = NOW(), url_attestation = $1, commentaires_hr = $2
       WHERE attestationid = $3`,
      [certificateUrl, commentaires || '', attestationid]
    );

    // Send email to candidate
    const emailSubject = 'Votre attestation de stage est prête';
    const emailBody = `
      Bonjour ${certificate.prenom} ${certificate.nom},

      Votre attestation de stage a été générée avec succès et est maintenant disponible.

      Détails de votre stage :
      - Domaine : ${certificate.domaine || 'Non spécifié'}
      - Période : ${certificate.periode || 'Non spécifié'}
      - Rapport : ${certificate.rapport_titre}

      Veuillez vous présenter au service RH pour récupérer votre attestation en personne.

      Cordialement,
      Service RH - SBGS
    `;

    try {
      await sendEmail({
        to: certificate.email,
        subject: emailSubject,
        text: emailBody
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    res.status(200).json({ 
      success: true, 
      message: "Attestation générée et email envoyé au stagiaire.",
      certificateUrl 
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la génération de l'attestation." });
  }
}

function generateCertificatePDF(certificate: any) {
  // This is a simplified version. In a real implementation, you would use a PDF library
  // like jsPDF, Puppeteer, or a service like DocRaptor
  const currentDate = new Date().toLocaleDateString('fr-FR');
  
  return `
    ATTESTATION DE STAGE

    La Société des Boissons Gazeuses du Souss (SBGS)
    Certifie que

    ${certificate.prenom} ${certificate.nom}
    Étudiant(e) en ${certificate.statutetudiant}
    ${certificate.ecole_nom ? `de l'établissement ${certificate.ecole_nom}` : ''}

    A effectué un stage dans le domaine de ${certificate.domaine || 'Non spécifié'}
    Pendant la période : ${certificate.periode || 'Non spécifiée'}
    
    Sous la supervision de : ${certificate.superviseur_prenom} ${certificate.superviseur_nom}
    
    Le rapport de stage intitulé "${certificate.rapport_titre}" a été approuvé.

    Date de génération : ${currentDate}
    
    Cette attestation est générée automatiquement par le système de gestion des stages SBGS.
  `;
}

async function saveCertificate(content: string, certificate: any) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "certificates");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  
  const timestamp = Date.now();
  const filename = `attestation_${certificate.cdtid}_${timestamp}.txt`;
  const filePath = path.join(uploadsDir, filename);
  
  await fs.promises.writeFile(filePath, content, 'utf8');
  const savedUrl = "/uploads/certificates/" + filename;
  
  return savedUrl;
} 