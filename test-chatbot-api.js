// Simple test script for the chatbot API
// Run with: node test-chatbot-api.js

const fetch = require('node-fetch');

async function testChatbotAPI() {
  const testQueries = [
    "Trouve des candidats avec Angular",
    "Cherche des développeurs React",
    "Candidats qui connaissent Python",
    "Find candidates with Java experience"
  ];

  console.log('🧪 Testing Enhanced Chatbot API...\n');

  for (const query of testQueries) {
    try {
      console.log(`📝 Testing query: "${query}"`);
      
      const response = await fetch('http://localhost:3000/api/hr/search-cvs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Success! Found ${data.candidates.length} candidates`);
        console.log(`🔍 Keywords extracted: ${data.keywords.join(', ')}`);
        
        if (data.candidates.length > 0) {
          console.log('📋 Sample results:');
          data.candidates.slice(0, 2).forEach((candidate, index) => {
            console.log(`   ${index + 1}. ${candidate.fullName} - ${candidate.email}`);
            console.log(`      Skills: ${candidate.matchingKeywords.join(', ')}`);
          });
        }
      } else {
        console.log(`❌ Error: ${data.error}`);
      }
      
      console.log('---\n');
      
    } catch (error) {
      console.log(`❌ Network error: ${error.message}\n`);
    }
  }
}

// Run the test
testChatbotAPI().catch(console.error); 