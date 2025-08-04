import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
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
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: "Query is required" });
    }

    console.log("Searching CVs for query:", query);

    // Extract keywords from the query (simple approach)
    const keywords = extractKeywords(query);
    console.log("Extracted keywords:", keywords);

    // Get all CV files from the database
    const result = await pool.query(`
      SELECT 
        c.cdtid, c.nom, c.prenom, c.email, c.telephone,
        p.url as cvurl,
        d.dsgid, d.typestage, d.domaine, d.statut as status
      FROM candidat c
      JOIN demandes_stage d ON c.cdtid = d.cdtid
      LEFT JOIN pieces_jointes p ON p.dsgid = d.dsgid AND p.typepiece = 'CV'
      WHERE p.url IS NOT NULL
    `);

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
          console.log(`CV file not found: ${filePath}`);
          continue;
        }

        // Read and parse PDF with error handling
        let cvText = '';
        try {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdf(dataBuffer);
          cvText = pdfData.text.toLowerCase();
        } catch (pdfError) {
          console.error(`Error parsing PDF for candidate ${row.cdtid}:`, pdfError);
          continue; // Skip this candidate if PDF parsing fails
        }

        // Check if any keywords match - improved logic
        const matches = [];
        const cvWords = cvText.split(/\s+/);
        
        for (const keyword of keywords) {
          // Check for exact word matches (case insensitive)
          if (cvWords.some(word => word.toLowerCase() === keyword.toLowerCase())) {
            matches.push(keyword);
          }
          // Also check for partial matches in longer words (e.g., "react" in "reactjs")
          else if (cvWords.some(word => word.toLowerCase().includes(keyword.toLowerCase()))) {
            matches.push(keyword);
          }
        }

        // Only include candidates with meaningful matches (not just common words)
        const meaningfulKeywords = keywords.filter(keyword => 
          !['cherche', 'trouve', 'candidats', 'candidat', 'avec', 'qui', 'ont', 'experience', 'expérience'].includes(keyword.toLowerCase())
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
            matchingKeywords: matches.filter(keyword => 
              meaningfulKeywords.includes(keyword)
            ),
            matchScore: matches.filter(keyword => 
              meaningfulKeywords.includes(keyword)
            ).length / meaningfulKeywords.length // Score based on meaningful matches only
          });
        }
      } catch (error) {
        console.error(`Error processing CV for candidate ${row.cdtid}:`, error);
        // Continue with other candidates
      }
    }

    // Sort by match score (highest first)
    candidates.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`Found ${candidates.length} matching candidates`);

    return res.status(200).json({
      success: true,
      candidates,
      query,
      keywords,
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

  // Extract words and filter out common words
  const words = query.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .filter(word => {
      // Only keep words that are likely to be skills/technologies
      const techKeywords = [
        'angular', 'react', 'vue', 'node', 'python', 'java', 'javascript', 'typescript',
        'php', 'sql', 'mongodb', 'docker', 'kubernetes', 'aws', 'azure', 'git',
        'html', 'css', 'bootstrap', 'tailwind', 'jquery', 'express', 'django',
        'flask', 'spring', 'laravel', 'symfony', 'csharp', 'dotnet', 'ruby',
        'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'c', 'cpp',
        'mysql', 'postgresql', 'sqlite', 'redis', 'elasticsearch', 'kafka',
        'jenkins', 'travis', 'circleci', 'github', 'gitlab', 'bitbucket'
      ];
      
      return techKeywords.some(tech => 
        word.includes(tech) || tech.includes(word)
      ) || word.length > 4; // Keep longer words that might be skills
    });

  // Add common technology variations
  const techVariations: { [key: string]: string[] } = {
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
    'symfony': ['symfony', 'symfony4', 'symfony5']
  };

  // Find technology matches and add variations
  const enhancedWords = [...words];
  for (const word of words) {
    for (const [tech, variations] of Object.entries(techVariations)) {
      if (variations.some(v => word.includes(v) || v.includes(word))) {
        enhancedWords.push(tech);
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