# Enhanced Chatbot Feature for HR Dashboard

## Overview

The enhanced chatbot feature allows HR personnel to search through candidate CVs using natural language queries. This feature is only available on the HR dashboard (`/admin` route).

## Features

### CV Search Capabilities
- **Natural Language Queries**: HR can ask questions like:
  - "Trouve-moi des candidats qui ont de l'expérience avec Angular"
  - "Cherche des candidats avec des compétences en React"
  - "Find me candidates who have experience with Python"
  - "Search for candidates with Java skills"

### Search Results
The chatbot returns:
- Candidate name and contact information (email, phone)
- Matching skills/keywords found in their CV
- Direct download link to the candidate's CV
- Relevance score based on keyword matches

### Technical Implementation

#### Backend (`/api/hr/search-cvs`)
- **PDF Parsing**: Uses `pdf-parse` library to extract text from uploaded CVs
- **Keyword Extraction**: Simple keyword-based search (removes common words)
- **Database Query**: Searches through `pieces_jointes` table for CV files
- **Error Handling**: Graceful handling of missing files or parsing errors

#### Frontend (`EnhancedChatbot.jsx`)
- **Query Detection**: Automatically detects CV search queries vs regular questions
- **Real-time Search**: Shows loading indicator during search
- **Rich Results**: Displays formatted results with clickable CV links
- **Responsive UI**: Larger chat window for better readability

## Usage Examples

### Example Queries
```
✅ "Trouve des candidats avec Angular"
✅ "Cherche des développeurs React"
✅ "Candidats qui connaissent Python"
✅ "Find candidates with Java experience"
✅ "Search for Node.js developers"

❌ "Comment ça va?" (regular question)
❌ "Quel est le statut de ma candidature?" (regular question)
```

### Example Response
```
J'ai trouvé 3 candidat(s) correspondant à votre recherche "Angular":

1. **Ahmed Benali**
   📧 ahmed.benali@email.com
   📱 +212 6 12 34 56 78
   🎯 Compétences trouvées: angular, typescript, javascript
   📄 CV: [Télécharger]

2. **Fatima Zahra**
   📧 fatima.zahra@email.com
   📱 +212 6 98 76 54 32
   🎯 Compétences trouvées: angular, html, css
   📄 CV: [Télécharger]
```

## Technical Details

### Database Schema
- `candidat` table: Candidate information
- `demandes_stage` table: Internship applications
- `pieces_jointes` table: Attached files (CVs stored here)

### File Storage
- CVs are stored in `backend/public/uploads/`
- Files are named with timestamp prefix for uniqueness
- Accessible via `/api/hr/get-cv?filename=...`

### Future Enhancements
- **AI Embeddings**: Replace keyword search with semantic search
- **Advanced Matching**: Support for synonyms and related terms
- **Search Filters**: Add filters for experience level, location, etc.
- **Search History**: Save and reuse previous searches

## Installation

1. Install the required package:
   ```bash
   cd backend
   npm install pdf-parse
   ```

2. The feature is automatically available on the HR dashboard
3. No additional configuration required

## Security Notes

- Only accessible to authenticated HR users
- CV files are protected and only accessible via the API
- Search queries are logged for debugging purposes
- No sensitive data is exposed in search results

## Troubleshooting

### Common Issues
1. **No results found**: Check if CVs are properly uploaded and accessible
2. **PDF parsing errors**: Ensure CVs are valid PDF files
3. **Permission errors**: Verify HR authentication is working

### Debug Information
- Check browser console for frontend errors
- Check backend logs for PDF parsing or database errors
- Verify file paths in `backend/public/uploads/` 