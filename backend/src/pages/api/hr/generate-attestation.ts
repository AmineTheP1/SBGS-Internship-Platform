import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Function to convert image to base64
const getLogoBase64 = () => {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'sbgs-logo.jpeg');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      return logoBuffer.toString('base64');
    }
  } catch (error) {
    console.log('Error reading logo:', error);
  }
  // Fallback to a simple placeholder if logo not found
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
};

// Function to format stage type with proper capitalization
const formatStageType = (stageType: string) => {
  if (!stageType) return 'Type de stage non spécifié';
  
  // Convert to lowercase first, then capitalize each word
  const words = stageType.toLowerCase().split(' ');
  const formattedWords = words.map(word => {
    // Handle special cases like "d'" and "de"
    if (word === 'd' || word === 'de' || word === 'du' || word === 'des') {
      return word;
    }
    // Capitalize first letter of each word
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  
  return formattedWords.join(' ');
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Professional HTML to PDF generation function
const generateAttestationPDF = (attestationData: any) => {
  const logoBase64 = getLogoBase64();
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Attestation de Stage - SBGS</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
                 body {
           font-family: 'Inter', sans-serif;
           background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
           min-height: 100vh;
           padding: 10px 5px;
           color: #1e293b;
           line-height: 1.3;
           margin: 0;
         }
        
                 .attestation-container {
           max-width: 800px;
           width: 100%;
           margin: 0 auto;
           background: white;
           border-radius: 15px;
           box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
           overflow: hidden;
           position: relative;
           min-height: 100vh;
           display: flex;
           flex-direction: column;
         }
        
                 .header {
           background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
           color: white;
           padding: 20px;
           text-align: center;
           position: relative;
         }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }
        
                 .logo-section {
           display: flex;
           align-items: center;
           justify-content: center;
           margin-bottom: 15px;
           position: relative;
           z-index: 1;
         }
        
        .logo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
        
        .logo img {
          width: 45px;
          height: 45px;
          object-fit: contain;
        }
        
        .company-info {
          text-align: left;
        }
        
        .company-name {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 900;
          margin-bottom: 3px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .company-subtitle {
          font-size: 12px;
          opacity: 0.9;
          font-weight: 300;
        }
        
                 .title-section {
           margin-top: 15px;
           position: relative;
           z-index: 1;
         }
        
        .main-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .subtitle {
          font-size: 14px;
          opacity: 0.9;
          font-weight: 300;
        }
        
                 .content {
           padding: 25px 25px;
           position: relative;
           flex: 1;
           display: flex;
           flex-direction: column;
         }
        
        .content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 40px;
          right: 40px;
          height: 3px;
          background: linear-gradient(90deg, #dc2626, #b91c1c);
          border-radius: 2px;
        }
        
                 .intro-text {
           font-size: 15px;
           color: #374151;
           margin-bottom: 15px;
           font-weight: 500;
         }
        
                 .candidate-info {
           background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
           border-radius: 12px;
           padding: 15px;
           margin: 15px 0;
           border-left: 4px solid #dc2626;
         }
        
        .info-row {
          display: flex;
          margin-bottom: 12px;
          align-items: center;
        }
        
        .info-row:last-child {
          margin-bottom: 0;
        }
        
                 .info-label {
           font-weight: 600;
           color: #374151;
           min-width: 120px;
           font-size: 12px;
           text-transform: uppercase;
           letter-spacing: 0.5px;
         }
        
        .info-value {
          font-weight: 500;
          color: #1e293b;
          font-size: 14px;
        }
        
                 .stage-details {
           background: white;
           border: 2px solid #e5e7eb;
           border-radius: 12px;
           padding: 15px;
           margin: 15px 0;
         }
        
        .stage-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: #dc2626;
          margin-bottom: 15px;
          text-align: center;
        }
        
                 .conclusion {
           font-size: 13px;
           color: #374151;
           margin: 15px 0;
           text-align: center;
           font-style: italic;
         }
        
                 .signature-section {
           margin-top: 20px;
           display: flex;
           justify-content: space-between;
           align-items: flex-end;
         }
        
        .signature-box {
          text-align: center;
          flex: 1;
        }
        
                 .signature-line {
           width: 200px;
           height: 2px;
           background: #374151;
           margin: 20px auto 10px;
           border-radius: 1px;
         }
        
        .signature-text {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }
        
                 .date-section {
           text-align: center;
           margin-top: 20px;
           padding: 15px;
           background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
           border-radius: 10px;
           margin-top: auto;
         }
        
                 .date-text {
           font-size: 16px;
           color: #374151;
           font-weight: 500;
         }
         
         .additional-info {
           background: white;
           border: 2px solid #e5e7eb;
           border-radius: 12px;
           padding: 15px;
           margin: 15px 0;
         }
         
         .additional-title {
           font-family: 'Playfair Display', serif;
           font-size: 16px;
           font-weight: 700;
           color: #dc2626;
           margin-bottom: 12px;
           text-align: center;
         }
         
         .terms-section {
           background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
           border-radius: 12px;
           padding: 15px;
           margin: 15px 0;
           border-left: 4px solid #dc2626;
         }
         
         .terms-title {
           font-family: 'Playfair Display', serif;
           font-size: 16px;
           font-weight: 700;
           color: #374151;
           margin-bottom: 10px;
           text-align: center;
         }
         
         .terms-list {
           list-style: none;
           padding: 0;
         }
         
         .terms-list li {
           margin-bottom: 8px;
           padding-left: 20px;
           position: relative;
           font-size: 13px;
           color: #374151;
         }
         
         .terms-list li::before {
           content: '•';
           color: #dc2626;
           font-weight: bold;
           position: absolute;
           left: 0;
         }
        
        .stamp {
          position: absolute;
          top: 30px;
          right: 30px;
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 12px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
          transform: rotate(15deg);
        }
        
        .stamp::before {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          border: 2px dashed rgba(255, 255, 255, 0.3);
          border-radius: 50%;
        }
        
        .attestation-number {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }
        
                 @media print {
           @page {
             size: A4;
             margin: 10mm;
           }
           
           /* Hide browser-generated headers and footers */
           @page :first {
             margin-top: 0;
           }
           
           @page :left {
             margin-left: 0;
           }
           
           @page :right {
             margin-right: 0;
           }
           body {
             background: white;
             padding: 0;
             margin: 0;
             font-size: 11px;
             color: #000;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
           .attestation-container {
             box-shadow: none;
             border-radius: 0;
             max-width: 100%;
             width: 100%;
             margin: 0;
             border: 2px solid #333;
             min-height: auto;
             height: 100vh;
           }
           .header {
             padding: 12px;
             background: #dc2626 !important;
             color: white !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
           .content {
             padding: 20px 25px;
           }
           .logo {
             width: 50px;
             height: 50px;
             background: white !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
           .logo img {
             width: 35px;
             height: 35px;
           }
           .company-name {
             font-size: 20px;
             color: white !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
           .company-subtitle {
             color: white !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
           .main-title {
             font-size: 24px;
             color: white !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
           .subtitle {
             color: white !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
           .intro-text {
             font-size: 12px;
             margin-bottom: 10px;
             color: #000 !important;
           }
           .candidate-info {
             padding: 10px;
             margin: 10px 0;
             background: #f8f9fa !important;
             border-left: 4px solid #dc2626 !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
           .stage-details {
             padding: 10px;
             margin: 10px 0;
             border: 2px solid #333 !important;
           }
           .stage-title {
             color: #dc2626 !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
           .info-label {
             font-size: 11px;
             min-width: 100px;
             color: #333 !important;
             font-weight: bold !important;
           }
           .info-value {
             font-size: 13px;
             color: #000 !important;
           }
           .conclusion {
             font-size: 11px;
             margin: 10px 0;
             color: #000 !important;
           }
           .signature-section {
             margin-top: 15px;
           }
           .signature-line {
             background: #333 !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
             width: 200px !important;
           }
           .signature-text {
             color: #333 !important;
           }
           .date-section {
             background: #f8f9fa !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
             padding: 10px;
             margin-top: 15px;
           }
           .date-text {
             color: #000 !important;
             font-size: 11px;
           }
           
           .additional-info {
             padding: 10px;
             margin: 10px 0;
             border: 2px solid #333 !important;
           }
           
           .additional-title {
             color: #dc2626 !important;
             font-size: 14px;
           }
           
           .terms-section {
             padding: 10px;
             margin: 10px 0;
             background: #f8f9fa !important;
             border-left: 4px solid #dc2626 !important;
           }
           
           .terms-title {
             color: #333 !important;
             font-size: 14px;
           }
           
           .terms-list li {
             font-size: 10px;
             margin-bottom: 6px;
           }
           .stamp {
             width: 80px;
             height: 80px;
             font-size: 10px;
             background: #dc2626 !important;
             color: white !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
           .attestation-number {
             background: rgba(255, 255, 255, 0.9) !important;
             color: #333 !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
           
           /* Ensure content fits on one page */
           .info-row {
             margin-bottom: 8px;
           }
           
           .info-label {
             font-size: 10px;
             min-width: 100px;
           }
           
           .info-value {
             font-size: 11px;
           }
           
           .main-title {
             font-size: 20px;
           }
           
           .company-name {
             font-size: 18px;
           }
           
           .logo {
             width: 40px;
             height: 40px;
           }
           
           .logo img {
             width: 30px;
             height: 30px;
           }
         }
      </style>
    </head>
    <body>
      <div class="attestation-container">
        <div class="stamp">ATTESTATION<br>OFFICIELLE</div>
        <div class="attestation-number">N° ${attestationData.attestationid}</div>
        
        <div class="header">
                     <div class="logo-section">
             <div class="logo">
               <img src="data:image/jpeg;base64,${logoBase64}" alt="SBGS Logo" />
             </div>
            <div class="company-info">
              <div class="company-name">SBGS</div>
              <div class="company-subtitle">Société des Boissons Gazeuse du Souss</div>
            </div>
          </div>
          
          <div class="title-section">
            <div class="main-title">ATTESTATION DE STAGE</div>
            <div class="subtitle">Certificat officiel de stage professionnel</div>
          </div>
        </div>
        
        <div class="content">
          <div class="intro-text">
            La présente attestation certifie officiellement que :
          </div>
          
          <div class="candidate-info">
            <div class="info-row">
              <div class="info-label">Nom et Prénom</div>
              <div class="info-value">${attestationData.candidateName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">CIN</div>
              <div class="info-value">${attestationData.cin || 'Non spécifié'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Établissement</div>
              <div class="info-value">${attestationData.ecole || 'Non spécifié'}</div>
            </div>
          </div>
          
          <div class="stage-details">
            <div class="stage-title">Détails du Stage</div>
            <div class="info-row">
              <div class="info-label">Période</div>
              <div class="info-value">Du ${attestationData.dateDebut ? new Date(attestationData.dateDebut).toLocaleDateString('fr-FR') : 'Non spécifié'} au ${attestationData.dateFin ? new Date(attestationData.dateFin).toLocaleDateString('fr-FR') : 'Non spécifié'}</div>
            </div>
                         <div class="info-row">
               <div class="info-label">Type de stage</div>
               <div class="info-value">${attestationData.rapportTitre}</div>
             </div>
            <div class="info-row">
              <div class="info-label">Approbation</div>
              <div class="info-value">${attestationData.dateValidation ? new Date(attestationData.dateValidation).toLocaleDateString('fr-FR') : 'Non spécifié'}</div>
            </div>
          </div>
          
                     <div class="conclusion">
             Cette attestation officielle est délivrée pour faire valoir ce que de droit et atteste de la réalisation complète du stage professionnel au sein de notre entreprise.
           </div>
           
           <div class="additional-info">
             <div class="additional-title">Informations Complémentaires</div>
             <div class="info-row">
               <div class="info-label">Service d'affectation</div>
               <div class="info-value">Service des Ressources Humaines</div>
             </div>
             <div class="info-row">
               <div class="info-label">Superviseur</div>
               <div class="info-value">Responsable RH - SBGS</div>
             </div>
             <div class="info-row">
               <div class="info-label">Statut du stage</div>
               <div class="info-value">Terminé avec succès</div>
             </div>
           </div>
           
           <div class="terms-section">
             <div class="terms-title">Conditions et Validité</div>
             <ul class="terms-list">
               <li>Cette attestation est valable uniquement pour le stage mentionné ci-dessus</li>
               <li>Elle ne peut être utilisée à des fins autres que celles déclarées</li>
               <li>La durée et les conditions du stage sont conformes aux exigences académiques</li>
               <li>L'évaluation du stagiaire a été effectuée selon les critères établis</li>
               <li>Cette attestation est délivrée en un seul exemplaire original</li>
             </ul>
           </div>
           
           <div class="signature-section">
             <div class="signature-box">
               <div class="signature-line"></div>
               <div class="signature-text">Signature du Responsable RH</div>
             </div>
             <div class="signature-box">
               <div class="signature-line"></div>
               <div class="signature-text">Cachet de l'entreprise</div>
             </div>
           </div>
           
           <div class="date-section">
             <div class="date-text">Fait à Agadir, le ${new Date().toLocaleDateString('fr-FR')}</div>
           </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return html;
};

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
         s.datedebut, s.datefin,
         ds.typestage,
         e.nom as ecole_nom
       FROM candidat c
       JOIN rapports_stage r ON c.cdtid = r.cdtid
       JOIN stages s ON r.stagesid = s.stagesid
       LEFT JOIN demandes_stage ds ON s.demandes_stageid = ds.dsgid
       LEFT JOIN ecole e ON c.ecoleid = e.ecoleid
       WHERE c.cdtid = $1 AND r.rstid = $2 AND r.statut = 'Approuvé'
     `, [cdtid, rapportid]);

    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Candidat ou rapport non trouvé." });
    }

    const candidate = candidateResult.rows[0];
    console.log('Candidate data for attestation:', candidate);
    const attestationid = crypto.randomBytes(8).toString('hex');

    // First, ensure the cdtid column exists in attestations_stage table
    try {
      await pool.query(`ALTER TABLE attestations_stage ADD COLUMN IF NOT EXISTS cdtid VARCHAR(16) REFERENCES candidat(cdtid)`);
    } catch (error) {
      console.log("cdtid column might already exist or error occurred:", error);
    }

    // Check if attestation already exists for this specific candidate and stage
    const existingAttestation = await pool.query(
      `SELECT atsid FROM attestations_stage WHERE stagesid = $1 AND cdtid = $2`,
      [candidate.stagesid, candidate.cdtid]
    );

    if (existingAttestation.rows.length > 0) {
      return res.status(400).json({ success: false, error: "Une attestation existe déjà pour ce candidat et ce stage." });
    }

         // Generate attestation data
     const attestationData = {
       attestationid,
       candidateName: `${candidate.prenom} ${candidate.nom}`,
       cin: candidate.cin,
       rapportTitre: formatStageType(candidate.typestage),
       dateValidation: candidate.datevalidation,
       dateDebut: candidate.datedebut,
       dateFin: candidate.datefin,
       ecole: candidate.ecole_nom,
       dateGeneration: new Date().toISOString()
     };

    // Generate PDF content (HTML for now, can be converted to PDF later)
    const pdfContent = generateAttestationPDF(attestationData);
    
    // Create filename
    const filename = `attestation_${attestationid}_${Date.now()}.html`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, filename);
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Write the file
    fs.writeFileSync(filePath, pdfContent);
    
    // File URL for database
    const fileUrl = `/uploads/${filename}`;

    // Insert attestation record with file URL
    await pool.query(
      `INSERT INTO attestations_stage (atsid, stagesid, url, dategeneration, cdtid) 
       VALUES ($1, $2, $3, NOW(), $4)`,
      [attestationid, candidate.stagesid, fileUrl, candidate.cdtid]
    );

    res.status(200).json({ 
      success: true, 
      message: "Attestation générée avec succès.",
      attestation: {
        ...attestationData,
        downloadUrl: fileUrl
      }
    });

  } catch (error) {
    console.error('Error generating attestation:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la génération de l'attestation." });
  }
} 