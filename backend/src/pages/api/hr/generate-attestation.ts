import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
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
    const { cdtid, rapportid } = req.body;

    if (!cdtid || !rapportid) {
      return res.status(400).json({ success: false, error: "cdtid et rapportid sont requis." });
    }

    // Get candidate and report details
    const candidateResult = await pool.query(`
      SELECT 
        c.cdtid, c.nom, c.prenom, c.email, c.cin, c.statutetudiant,
        r.rstid, r.titre, r.datevalidation, r.stagesid,
        s.date_debut, s.date_fin,
        e.nom as ecole_nom
      FROM candidat c
      JOIN rapports_stage r ON c.cdtid = r.cdtid
      JOIN stages s ON r.stagesid = s.stagesid
      LEFT JOIN ecole e ON c.ecoleid = e.ecoleid
      WHERE c.cdtid = $1 AND r.rstid = $2 AND r.statut = 'Approuvé'
    `, [cdtid, rapportid]);

    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Candidat ou rapport non trouvé." });
    }

    const candidate = candidateResult.rows[0];
    const attestationid = crypto.randomBytes(8).toString('hex');

    // Check if attestation already exists
    const existingAttestation = await pool.query(
      `SELECT atsid FROM attestations_stage WHERE stagesid = $1`,
      [candidate.stagesid]
    );

    if (existingAttestation.rows.length > 0) {
      return res.status(400).json({ success: false, error: "Une attestation existe déjà pour ce stage." });
    }

    // Insert attestation record
    await pool.query(
      `INSERT INTO attestations_stage (atsid, stagesid, url, dategeneration, cdtid) 
       VALUES ($1, $2, $3, NOW(), $4)`,
      [attestationid, candidate.stagesid, null, candidate.cdtid]
    );

    // Generate attestation data (this would normally generate a PDF)
    const attestationData = {
      attestationid,
      candidateName: `${candidate.prenom} ${candidate.nom}`,
      cin: candidate.cin,
      rapportTitre: candidate.titre,
      dateValidation: candidate.datevalidation,
      dateDebut: candidate.date_debut,
      dateFin: candidate.date_fin,
      ecole: candidate.ecole_nom,
      dateGeneration: new Date().toISOString()
    };

    res.status(200).json({ 
      success: true, 
      message: "Attestation générée avec succès.",
      attestation: attestationData
    });

  } catch (error) {
    console.error('Error generating attestation:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la génération de l'attestation." });
  }
} 