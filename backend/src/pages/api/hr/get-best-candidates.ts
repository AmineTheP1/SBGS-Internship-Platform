import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Get HR info from token
    const token = req.cookies?.hr_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      // If we reach here, the token is valid and it's an HR user
    } catch (jwtError) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    // Create necessary tables if they don't exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS evaluations_stagiaire (
          evalid SERIAL PRIMARY KEY,
          cdtid VARCHAR(255) NOT NULL,
          rapportid VARCHAR(255) NOT NULL,
          resid VARCHAR(255) NOT NULL,
          competences_techniques INTEGER CHECK (competences_techniques >= 0 AND competences_techniques <= 10),
          qualite_travail INTEGER CHECK (qualite_travail >= 0 AND qualite_travail <= 10),
          respect_delais INTEGER CHECK (respect_delais >= 0 AND respect_delais <= 10),
          travail_equipe INTEGER CHECK (travail_equipe >= 0 AND travail_equipe <= 10),
          autonomie_initiative INTEGER CHECK (autonomie_initiative >= 0 AND autonomie_initiative <= 10),
          communication INTEGER CHECK (communication >= 0 AND communication <= 10),
          commentaires TEXT,
          date_evaluation TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (cdtid) REFERENCES candidat(cdtid),
          FOREIGN KEY (resid) REFERENCES responsables_stage(resid)
        )
      `);
    } catch (error) {
      console.log("Evaluations table might already exist or error occurred:", error);
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rapports_stage (
          rstid SERIAL PRIMARY KEY,
          cdtid VARCHAR(255) NOT NULL,
          titre VARCHAR(255),
          contenu TEXT,
          fichier_url VARCHAR(500),
          statut VARCHAR(50) DEFAULT 'En attente',
          commentaires_superviseur TEXT,
          note INTEGER,
          date_revision TIMESTAMP,
          revise_par VARCHAR(255),
          date_creation TIMESTAMP DEFAULT NOW(),
          stagesid VARCHAR(255),
          FOREIGN KEY (cdtid) REFERENCES candidat(cdtid)
        )
      `);
    } catch (error) {
      console.log("Rapports_stage table might already exist or error occurred:", error);
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS responsables_stage (
          resid VARCHAR(255) PRIMARY KEY,
          nom VARCHAR(255),
          prenom VARCHAR(255),
          email VARCHAR(255),
          telephone VARCHAR(20),
          departement VARCHAR(255),
          titre VARCHAR(255)
        )
      `);
    } catch (error) {
      console.log("Responsables_stage table might already exist or error occurred:", error);
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS propositions_entretien (
          id SERIAL PRIMARY KEY,
          cdtid VARCHAR(255) NOT NULL,
          date_proposition TIMESTAMP DEFAULT NOW(),
          email_content TEXT,
          subject VARCHAR(255),
          FOREIGN KEY (cdtid) REFERENCES candidat(cdtid)
        )
      `);
    } catch (error) {
      console.log("Propositions_entretien table might already exist or error occurred:", error);
    }

    // Get top-rated former interns who haven't received interview proposals yet
    const result = await pool.query(
      `SELECT 
        c.cdtid, c.nom, c.prenom, c.email, c.telephone,
        e.competences_techniques, e.qualite_travail, e.respect_delais, 
        e.travail_equipe, e.autonomie_initiative, e.communication, 
        e.commentaires, e.date_evaluation,
        COALESCE(rs.titre, 'Rapport de stage') as rapport_titre,
        s.datedebut, 
        s.datefin, 
        COALESCE(s.serviceaffectation, 'Non défini') as departement,
        COALESCE(r.nom, 'Superviseur') as supervisor_nom, 
        COALESCE(r.prenom, '') as supervisor_prenom,
        (
          e.competences_techniques + e.qualite_travail + e.respect_delais + 
          e.travail_equipe + e.autonomie_initiative + e.communication
        ) as total_score
      FROM evaluations_stagiaire e
      JOIN candidat c ON e.cdtid = c.cdtid
      LEFT JOIN demandes_stage ds ON c.cdtid = ds.cdtid
      LEFT JOIN stages s ON ds.dsgid = s.demandes_stageid
      LEFT JOIN rapports_stage rs ON e.rapportid = rs.rstid::VARCHAR
      LEFT JOIN responsables_stage r ON e.resid = r.resid
      LEFT JOIN LATERAL (
        SELECT 1 FROM propositions_entretien pe WHERE pe.cdtid = c.cdtid LIMIT 1
      ) pe ON true
      WHERE e.competences_techniques IS NOT NULL 
        AND e.qualite_travail IS NOT NULL 
        AND e.respect_delais IS NOT NULL 
        AND e.travail_equipe IS NOT NULL 
        AND e.autonomie_initiative IS NOT NULL 
        AND e.communication IS NOT NULL
        AND pe IS NULL
      ORDER BY total_score DESC
      LIMIT 20`
    );

    // If no evaluations exist, return appropriate message
    if (result.rows.length === 0) {
      // Check if there are any candidates with evaluations but all have received interview proposals
      const checkEvaluatedCandidates = await pool.query(
        `SELECT COUNT(*) as count FROM evaluations_stagiaire`
      );
      
      const evaluatedCandidatesCount = parseInt(checkEvaluatedCandidates.rows[0].count);
      
      if (evaluatedCandidatesCount > 0) {
        // There are evaluated candidates but they've all received interview proposals
        return res.status(200).json({
          success: true,
          candidates: [],
          message: "Tous les anciens stagiaires évalués ont déjà reçu une proposition d'entretien."
        });
      } else {
        // No evaluated candidates at all
        return res.status(200).json({
          success: true,
          candidates: [],
          message: "Aucun ancien stagiaire évalué trouvé dans la base de données. Les évaluations sont créées par les superviseurs après approbation des rapports de stage."
        });
      }
    }

    // Format the results
    const candidates = result.rows.map(row => {
      // Calculate total score and percentage
      const totalScore = (
        parseInt(row.competences_techniques) +
        parseInt(row.qualite_travail) +
        parseInt(row.respect_delais) +
        parseInt(row.travail_equipe) +
        parseInt(row.autonomie_initiative) +
        parseInt(row.communication)
      );
      
      const percentage = (totalScore / 60) * 100;
      
      // Determine rating level
      let niveau = "";
      if (percentage >= 90) niveau = "Excellent";
      else if (percentage >= 80) niveau = "Très bien";
      else if (percentage >= 70) niveau = "Bien";
      else if (percentage >= 60) niveau = "Moyen";
      else niveau = "Insuffisant";

      // Format dates
      const formatDate = (dateString: string | null) => {
        if (!dateString || dateString === 'null') return 'Non défini';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Non défini';
        return date.toLocaleDateString('fr-FR');
      };

      return {
        cdtid: row.cdtid,
        nom: row.nom,
        prenom: row.prenom,
        fullName: `${row.prenom || ''} ${row.nom || ''}`.trim(),
        email: row.email,
        telephone: row.telephone,
        departement: row.departement,
        rapport_titre: row.rapport_titre,
        date_debut: row.datedebut,
        date_fin: row.datefin,
        date_debut_formatted: formatDate(row.datedebut),
        date_fin_formatted: formatDate(row.datefin),
        date_evaluation_formatted: formatDate(row.date_evaluation),
        supervisor: `${row.supervisor_prenom || ''} ${row.supervisor_nom || ''}`.trim(),
        competences_techniques: row.competences_techniques,
        qualite_travail: row.qualite_travail,
        respect_delais: row.respect_delais,
        travail_equipe: row.travail_equipe,
        autonomie_initiative: row.autonomie_initiative,
        communication: row.communication,
        commentaires: row.commentaires,
        total_score: totalScore,
        percentage: percentage.toFixed(2),
        niveau: niveau
      };
    });

    return res.status(200).json({
      success: true,
      candidates
    });

  } catch (error) {
    console.error("Error getting best candidates:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
}