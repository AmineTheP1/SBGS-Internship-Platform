import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
// @ts-ignore
import pdf from "pdf-parse";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
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
    const { query, statusFilter } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: "Query is required" });
    }

    // Extract keywords from the query (simple approach)
    const keywords = extractKeywords(query);

    // Build the SQL query with optional status filter
    let sqlQuery = `
      SELECT 
        c.cdtid, c.nom, c.prenom, c.email, c.telephone,
        p.url as cvurl,
        d.dsgid, d.typestage, d.domaine, d.statut as status,
        e.nom as universityname
      FROM candidat c
      JOIN demandes_stage d ON c.cdtid = d.cdtid
      LEFT JOIN pieces_jointes p ON p.dsgid = d.dsgid AND p.typepiece = 'CV'
      LEFT JOIN ecole e ON c.ecoleid = e.ecoleid
      WHERE p.url IS NOT NULL
    `;

    const queryParams = [];
    
    // Add status filter if specified
    if (statusFilter && statusFilter !== 'all') {
      // Use ILIKE for case-insensitive matching and trim whitespace
      sqlQuery += ` AND TRIM(d.statut) ILIKE $1`;
      queryParams.push(statusFilter.trim());
    }

    const result = await pool.query(sqlQuery, queryParams);

    const candidates = [];
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    for (const row of result.rows) {
      if (!row.cvurl) continue;

      try {
        // Extract filename from URL
        const filename = row.cvurl.split('/').pop();
        if (!filename) continue;

        const filePath = path.join(uploadsDir, filename);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
          continue;
        }

        // Read and parse PDF with error handling
        let cvText = '';
        try {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdf(dataBuffer);
          cvText = pdfData.text.toLowerCase();
        } catch (pdfError) {
          // Skip this candidate if PDF parsing fails
          continue;
        }

        // Check if any keywords match - whole word matching only
        const matches: string[] = [];
        // Split CV text into words, handling punctuation and special characters
        const cvWords = cvText
          .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
          .split(/\s+/)
          .filter(word => word.length > 0); // Remove empty strings
        
        for (const keyword of keywords) {
          // Check for exact whole word matches (case insensitive)
          if (cvWords.some(word => word.toLowerCase() === keyword.toLowerCase())) {
            matches.push(keyword);
          }
        }

        // Only include candidates with meaningful matches (not just common words)
        const meaningfulKeywords = keywords.filter(keyword => 
          !['cherche', 'trouve', 'candidats', 'candidat', 'avec', 'qui', 'ont', 'experience', 'expérience', 'des', 'les', 'qui', 'ont', 'avec'].includes(keyword.toLowerCase())
        );

        if (matches.length > 0 && meaningfulKeywords.some(keyword => matches.includes(keyword))) {
          candidates.push({
            cdtid: row.cdtid,
            nom: row.nom,
            prenom: row.prenom,
            fullName: `${row.prenom || ''} ${row.nom || ''}`.trim(),
            email: row.email,
            telephone: row.telephone,
            cvurl: row.cvurl,
            cvfilename: row.cvurl.split('/').pop(), // Extract filename from URL
            typestage: row.typestage,
            domaine: row.domaine,
            status: row.status,
            universityname: row.universityname,
            matchingKeywords: matches.filter(keyword => 
              meaningfulKeywords.includes(keyword)
            ),
            matchScore: matches.filter(keyword => 
              meaningfulKeywords.includes(keyword)
            ).length / meaningfulKeywords.length // Score based on meaningful matches only
          });
        }
      } catch (error) {
        // Continue with other candidates
        continue;
      }
    }

    // Sort by match score (highest first)
    candidates.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      candidates,
      query,
      keywords,
      statusFilter: statusFilter || 'all',
      totalFound: candidates.length
    });

  } catch (error) {
    console.error("Error searching CVs:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Erreur lors de la recherche dans les CVs" 
    });
  }
}

// Enhanced keyword extraction function
// TODO: Future upgrade - Replace with AI embeddings for better semantic search
// This would allow for more intelligent matching like "React" matching "React.js", "React Native", etc.
function extractKeywords(query: string): string[] {
  // Convert to lowercase and remove common words
  const commonWords = [
    'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'avec', 'sans',
    'pour', 'dans', 'sur', 'sous', 'entre', 'par', 'de', 'du', 'des', 'à', 'au',
    'aux', 'en', 'y', 'ce', 'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes',
    'son', 'sa', 'ses', 'notre', 'votre', 'leur', 'leurs', 'qui', 'que', 'quoi',
    'où', 'quand', 'comment', 'pourquoi', 'combien', 'trouver', 'chercher',
    'candidats', 'candidat', 'qui', 'ont', 'experience', 'expérience', 'avec',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'find', 'me', 'candidates', 'candidate', 'who', 'have', 'experience',
    'développeurs', 'développeur', 'developers', 'developer', 'connaissent', 'connaît',
    'veloppeurs', 'veloppeur' // Handle partial matches
  ];

  // Extract words and filter out common words - more inclusive approach
  const words = query.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .filter(word => {
      // Keep any word that could be a skill, experience, or qualification
      // This includes languages, software, tools, methodologies, etc.
      const skillKeywords = [
        // Programming & Development
        'angular', 'react', 'vue', 'node', 'python', 'java', 'javascript', 'typescript',
        'php', 'sql', 'mongodb', 'docker', 'kubernetes', 'aws', 'azure', 'git',
        'html', 'css', 'bootstrap', 'tailwind', 'jquery', 'express', 'django',
        'flask', 'spring', 'laravel', 'symfony', 'csharp', 'dotnet', 'ruby',
        'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'c', 'cpp',
        'mysql', 'postgresql', 'sqlite', 'redis', 'elasticsearch', 'kafka',
        'jenkins', 'travis', 'circleci', 'github', 'gitlab', 'bitbucket',
        
        // Languages
        'français', 'francais', 'anglais', 'arabe', 'espagnol', 'allemand', 'italien',
        'french', 'english', 'arabic', 'spanish', 'german', 'italian', 'portuguese',
        
        // Business & Management
        'marketing', 'vente', 'sales', 'finance', 'comptabilité', 'comptabilite', 'accounting',
        'rh', 'hr', 'ressources humaines', 'management', 'gestion', 'leadership',
        'projet', 'project', 'agile', 'scrum', 'kanban', 'lean', 'six sigma',
        
        // Design & Creative
        'design', 'photoshop', 'illustrator', 'figma', 'sketch', 'invision',
        'ui', 'ux', 'user interface', 'user experience', 'graphic', 'graphique',
        'web design', 'print design', 'branding', 'logo', 'typography',
        
        // Office & Tools
        'excel', 'word', 'powerpoint', 'outlook', 'office', 'google', 'suite',
        'adobe', 'autocad', 'solidworks', 'sketchup', 'blender', 'maya',
        
        // Industry Specific
        'mécanique', 'mecanique', 'electrique', 'électrique', 'electronique', 'électronique',
        'chimie', 'chemistry', 'biologie', 'biology', 'medecine', 'médecine',
        'architecture', 'construction', 'civil', 'genie', 'génie', 'engineering',
        
        // Soft Skills
        'communication', 'teamwork', 'collaboration', 'problem solving', 'résolution',
        'creativity', 'créativité', 'innovation', 'adaptability', 'adaptabilité',
        'organization', 'organisation', 'planning', 'planification',
        
        // Education & Certifications
        'bac', 'licence', 'master', 'doctorat', 'phd', 'diplome', 'diplôme',
        'certification', 'formation', 'training', 'workshop', 'seminar',
        
        // Experience Levels
        'junior', 'senior', 'expert', 'specialist', 'spécialiste', 'consultant',
        'debutant', 'débutant', 'beginner', 'intermediate', 'avance', 'avancé'
      ];
      
      return skillKeywords.some(skill => 
        word.includes(skill) || skill.includes(word)
      ) || word.length > 3; // Keep longer words that might be skills
    });

  // Add common skill variations
  const skillVariations: { [key: string]: string[] } = {
    // Programming & Development
    'angular': ['angular', 'angularjs', 'angular.js'],
    'react': ['react', 'reactjs', 'react.js', 'reactjs'],
    'vue': ['vue', 'vuejs', 'vue.js'],
    'node': ['node', 'nodejs', 'node.js'],
    'python': ['python', 'python3', 'python2'],
    'java': ['java', 'javase', 'javaee'],
    'javascript': ['javascript', 'js', 'ecmascript'],
    'typescript': ['typescript', 'ts'],
    'php': ['php', 'php7', 'php8'],
    'sql': ['sql', 'mysql', 'postgresql', 'sqlite'],
    'mongodb': ['mongodb', 'mongo'],
    'docker': ['docker', 'dockerfile'],
    'kubernetes': ['kubernetes', 'k8s'],
    'aws': ['aws', 'amazon', 'amazon web services'],
    'azure': ['azure', 'microsoft azure'],
    'git': ['git', 'github', 'gitlab'],
    'html': ['html', 'html5'],
    'css': ['css', 'css3', 'scss', 'sass'],
    'bootstrap': ['bootstrap', 'bootstrap4', 'bootstrap5'],
    'tailwind': ['tailwind', 'tailwindcss'],
    'jquery': ['jquery', 'jq'],
    'express': ['express', 'expressjs'],
    'django': ['django', 'djangorest'],
    'flask': ['flask', 'flask-restful'],
    'spring': ['spring', 'springboot', 'spring boot'],
    'laravel': ['laravel', 'laravel8', 'laravel9'],
    'symfony': ['symfony', 'symfony4', 'symfony5'],
    
    // Languages
    'français': ['français', 'francais', 'french'],
    'anglais': ['anglais', 'english'],
    'arabe': ['arabe', 'arabic'],
    'espagnol': ['espagnol', 'spanish'],
    'allemand': ['allemand', 'german'],
    
    // Business & Management
    'marketing': ['marketing', 'digital marketing', 'social media'],
    'vente': ['vente', 'sales', 'commercial'],
    'finance': ['finance', 'financial', 'financier'],
    'comptabilité': ['comptabilité', 'comptabilite', 'accounting'],
    'rh': ['rh', 'hr', 'ressources humaines', 'human resources'],
    'management': ['management', 'gestion', 'leadership'],
    'projet': ['projet', 'project', 'project management'],
    'agile': ['agile', 'scrum', 'kanban'],
    
    // Design & Creative
    'design': ['design', 'graphic design', 'web design'],
    'photoshop': ['photoshop', 'adobe photoshop', 'ps'],
    'illustrator': ['illustrator', 'adobe illustrator', 'ai'],
    'figma': ['figma', 'ui design', 'ux design'],
    'ui': ['ui', 'user interface', 'interface'],
    'ux': ['ux', 'user experience', 'experience'],
    
    // Office & Tools
    'excel': ['excel', 'microsoft excel', 'spreadsheet'],
    'word': ['word', 'microsoft word', 'document'],
    'powerpoint': ['powerpoint', 'microsoft powerpoint', 'presentation'],
    'office': ['office', 'microsoft office', 'ms office'],
    
    // Industry Specific
    'mécanique': ['mécanique', 'mecanique', 'mechanical'],
    'électrique': ['électrique', 'electrique', 'electrical'],
    'électronique': ['électronique', 'electronique', 'electronics'],
    'chimie': ['chimie', 'chemistry', 'chemical'],
    'biologie': ['biologie', 'biology', 'biological'],
    'architecture': ['architecture', 'architectural'],
    'construction': ['construction', 'building'],
    'génie': ['génie', 'genie', 'engineering'],
    
    // Soft Skills
    'communication': ['communication', 'communicative'],
    'teamwork': ['teamwork', 'team work', 'collaboration'],
    'problem solving': ['problem solving', 'résolution', 'resolution'],
    'creativity': ['creativity', 'créativité', 'creative'],
    'organization': ['organization', 'organisation', 'organizational'],
    
    // Education & Certifications
    'licence': ['licence', 'bachelor', 'bac+3'],
    'master': ['master', 'masters', 'bac+5'],
    'doctorat': ['doctorat', 'phd', 'doctorate'],
    'certification': ['certification', 'certified', 'cert'],
    
    // Experience Levels
    'junior': ['junior', 'débutant', 'debutant', 'beginner'],
    'senior': ['senior', 'avancé', 'avance', 'expert'],
    'specialist': ['specialist', 'spécialiste', 'specialist']
  };

  // Find skill matches and add variations
  const enhancedWords = [...words];
  for (const word of words) {
    for (const [skill, variations] of Object.entries(skillVariations)) {
      if (variations.some(v => word.includes(v) || v.includes(word))) {
        enhancedWords.push(skill);
        // Add other variations for better matching
        variations.forEach(v => {
          if (!enhancedWords.includes(v)) {
            enhancedWords.push(v);
          }
        });
      }
    }
  }

  // Remove duplicates and return
  return [...new Set(enhancedWords)];
} 