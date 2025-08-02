import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import sendEmail from '../../../utilities/sendEmail';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const formatStageType = (stageType: string) => {
  if (!stageType) return 'Non spécifié';
  
  return stageType
    .split(' ')
    .map(word => {
      const lowerWord = word.toLowerCase();
      if (lowerWord === 'de' || lowerWord === 'd\'' || lowerWord === 'du' || lowerWord === 'des') {
        return lowerWord;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { cdtid, rapportid } = req.body;

    if (!cdtid || !rapportid) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }

    // Get candidate details
    const candidateResult = await pool.query(`
      SELECT 
        c.cdtid, c.nom, c.prenom, c.email, c.cin, c.statutetudiant,
        r.rstid, r.titre, r.datevalidation, r.stagesid,
        s.datedebut, s.datefin,
        ds.typestage,
        e.nom as ecole_nom
      FROM candidat c
      JOIN rapports_stage r ON c.cdtid = r.cdtid
      JOIN stages s ON r.stagesid = s.stagesid
      LEFT JOIN demandes_stage ds ON s.demandes_stageid = ds.dsgid
      LEFT JOIN ecole e ON c.ecoleid = e.ecoleid
      WHERE c.cdtid = $1 AND r.rstid = $2
    `, [cdtid, rapportid]);

    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }

    const candidate = candidateResult.rows[0];

    // Send email notification to candidate
    try {
      const emailSubject = "Votre attestation de stage est prête - SBGS";
      const emailBodyHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #dc2626;">Attestation de Stage - SBGS</h2>
          <p>Bonjour ${candidate.prenom} ${candidate.nom},</p>
          <p>Nous avons le plaisir de vous informer que votre attestation de stage a été générée avec succès.</p>
          <p><strong>Détails de votre stage :</strong></p>
          <ul>
            <li><strong>Type de stage :</strong> ${formatStageType(candidate.typestage)}</li>
            <li><strong>Période :</strong> Du ${candidate.datedebut ? new Date(candidate.datedebut).toLocaleDateString('fr-FR') : 'Non spécifié'} au ${candidate.datefin ? new Date(candidate.datefin).toLocaleDateString('fr-FR') : 'Non spécifié'}</li>
            <li><strong>Établissement :</strong> ${candidate.ecole_nom || 'Non spécifié'}</li>
          </ul>
          <p>Votre attestation officielle est maintenant disponible et peut être récupérée auprès du service RH.</p>
          <p>Nous vous remercions pour votre stage au sein de notre entreprise et vous souhaitons le meilleur pour la suite de votre parcours professionnel.</p>
          <br>
          <p>Cordialement,</p>
          <p><strong>L'équipe des Ressources Humaines</strong><br>
          SBGS - Société des Boissons Gazeuse du Souss</p>
        </div>
      `;
      
      const emailBodyText = `
Attestation de Stage - SBGS

Bonjour ${candidate.prenom} ${candidate.nom},

Nous avons le plaisir de vous informer que votre attestation de stage a été générée avec succès.

Détails de votre stage :
- Type de stage : ${formatStageType(candidate.typestage)}
- Période : Du ${candidate.datedebut ? new Date(candidate.datedebut).toLocaleDateString('fr-FR') : 'Non spécifié'} au ${candidate.datefin ? new Date(candidate.datefin).toLocaleDateString('fr-FR') : 'Non spécifié'}
- Établissement : ${candidate.ecole_nom || 'Non spécifié'}

Votre attestation officielle est maintenant disponible et peut être récupérée auprès du service RH.

Nous vous remercions pour votre stage au sein de notre entreprise et vous souhaitons le meilleur pour la suite de votre parcours professionnel.

Cordialement,
L'équipe des Ressources Humaines
SBGS - Société des Boissons Gazeuse du Souss
      `;
      
      await sendEmail({
        to: candidate.email,
        subject: emailSubject,
        text: emailBodyText
      }); 
      console.log(`Email notification sent to ${candidate.email}`);
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the entire request if email fails
    }

    res.status(200).json({ 
      success: true, 
      message: "Email notification sent successfully."
    });

  } catch (error) {
    console.error('Error sending download notification:', error);
    res.status(500).json({ success: false, error: "Erreur lors de l'envoi de la notification." });
  }
}