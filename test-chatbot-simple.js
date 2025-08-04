// Simple test script for the chatbot API using built-in modules
// Run with: node test-chatbot-simple.js

const https = require('https');
const http = require('http');

async function testChatbotAPI() {
  const testQueries = [
    "Trouve des candidats avec Angular",
    "Cherche des développeurs React",
    "Candidats qui connaissent Python"
  ];

  console.log('🧪 Testing Enhanced Chatbot API...\n');

  for (const query of testQueries) {
    try {
      console.log(`📝 Testing query: "${query}"`);
      
      const postData = JSON.stringify({ query });
      
      const options = {
        hostname: 'localhost',
        port: 80, // Using nginx proxy
        path: '/api/hr/search-cvs',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const responseData = JSON.parse(data);
            
            if (responseData.success) {
              console.log(`✅ Success! Found ${responseData.candidates.length} candidates`);
              console.log(`🔍 Keywords extracted: ${responseData.keywords.join(', ')}`);
              
              if (responseData.candidates.length > 0) {
                console.log('📋 Sample results:');
                responseData.candidates.slice(0, 2).forEach((candidate, index) => {
                  console.log(`   ${index + 1}. ${candidate.fullName} - ${candidate.email}`);
                  console.log(`      Skills: ${candidate.matchingKeywords.join(', ')}`);
                });
              }
            } else {
              console.log(`❌ Error: ${responseData.error}`);
            }
          } catch (parseError) {
            console.log(`❌ Parse error: ${parseError.message}`);
            console.log(`Raw response: ${data}`);
          }
          
          console.log('---\n');
        });
      });

      req.on('error', (error) => {
        console.log(`❌ Network error: ${error.message}\n`);
      });

      req.write(postData);
      req.end();
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
}

// Run the test
testChatbotAPI().catch(console.error); 