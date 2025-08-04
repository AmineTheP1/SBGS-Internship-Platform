import React, { useState, useEffect } from "react";
import API_ENDPOINTS from "../config/api.js";

export default function EnhancedChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis votre Assistant RH SBGS. Je peux vous aider à rechercher des candidats selon leurs compétences et expériences.\n\n💡 Exemples de recherches:\n• 'Trouve des candidats avec Angular'\n• 'Cherche des développeurs React'\n• 'Candidats qui parlent anglais'\n• 'Find candidates with marketing experience'\n• 'Candidats avec Excel'\n• 'Cherche des designers Photoshop'\n• 'Candidats en génie mécanique'\n\n🔍 Je recherche dans les CVs pour toutes sortes de compétences : techniques, langues, logiciels, formations, etc.",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const botResponses = [
    "Merci pour votre message. Pour le statut de votre candidature de stage, veuillez permettre 2-3 semaines à notre équipe RH pour examiner les candidatures.",
    "Notre équipe RH travaille du lundi au vendredi de 8h30 à 18h00. Ils seront ravis de vous aider.",
    "Vous pouvez envoyer un email à stage@sbgs.ma pour toute question urgente concernant notre programme de stage.",
    "Les postes de stage durent généralement entre 1 et 6 mois selon le département.",
    "Les étudiants de toutes les universités accréditées au Maroc sont les bienvenus pour postuler à notre programme de stage."
  ];

  // Function to detect if the message is a CV search query
  const isCVSearchQuery = (message) => {
    const searchKeywords = [
      'trouve', 'cherche', 'recherche', 'candidats', 'candidat', 'qui', 'ont', 'experience', 'expérience', 'avec',
      'find', 'search', 'candidates', 'candidate', 'who', 'have', 'experience', 'with'
    ];
    
    const lowerMessage = message.toLowerCase();
    return searchKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  // Function to search CVs
  const searchCVs = async (query) => {
    setIsSearching(true);
    try {
      const response = await fetch(API_ENDPOINTS.HR_SEARCH_CVS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.candidates.length === 0) {
          return `Je n'ai trouvé aucun candidat avec les compétences "${data.keywords.join(', ')}" dans votre recherche "${query}".\n\n💡 Suggestions:\n• Essayez d'autres compétences (ex: Excel, Photoshop, anglais)\n• Utilisez des termes plus génériques (ex: "marketing" au lieu de "digital marketing")\n• Vérifiez l'orthographe des compétences recherchées\n• Essayez des synonymes (ex: "vente" au lieu de "sales")`;
        }

        let responseText = `J'ai trouvé ${data.candidates.length} candidat(s) correspondant à votre recherche "${query}":\n\n`;
        
        data.candidates.slice(0, 5).forEach((candidate, index) => {
          responseText += `${index + 1}. **${candidate.fullName}**\n`;
          responseText += `   📧 ${candidate.email}\n`;
          responseText += `   📱 ${candidate.telephone || 'Non disponible'}\n`;
          responseText += `   🎯 Compétences trouvées: ${candidate.matchingKeywords.join(', ')}\n`;
          responseText += `   📄 CV: [Télécharger](${API_ENDPOINTS.HR_GET_CV}?filename=${encodeURIComponent(candidate.cvfilename)})\n\n`;
        });

        if (data.candidates.length > 5) {
          responseText += `... et ${data.candidates.length - 5} autre(s) candidat(s).`;
        }

        return responseText;
      } else {
        return "Désolé, j'ai rencontré une erreur lors de la recherche. Veuillez réessayer.";
      }
    } catch (error) {
      console.error("Error searching CVs:", error);
      return "Désolé, j'ai rencontré une erreur réseau. Veuillez réessayer.";
    } finally {
      setIsSearching(false);
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim() === "" || isSearching) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputMessage;
    setInputMessage("");

    // Check if this is a CV search query
    if (isCVSearchQuery(currentQuery)) {
      // Show searching message
      const searchingMessage = {
        id: Date.now() + 1,
        text: "🔍 Je recherche dans les CVs des candidats...",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, searchingMessage]);

      // Perform the search
      const searchResult = await searchCVs(currentQuery);
      
      // Replace searching message with results
      setMessages(prev => prev.map(msg => 
        msg.id === searchingMessage.id 
          ? { ...msg, text: searchResult }
          : msg
      ));
    } else {
      // Regular bot response
      setTimeout(() => {
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
        const botMessage = {
          id: Date.now() + 1,
          text: randomResponse,
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Function to render message text with markdown-like formatting
  const renderMessageText = (text) => {
    // Convert **text** to bold
    const boldText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert [text](url) to clickable links
    const linkText = boldText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
    
    // Convert \n to <br>
    const finalText = linkText.replace(/\n/g, '<br>');
    
    return <span dangerouslySetInnerHTML={{ __html: finalText }} />;
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Chat Window */}
      <div className={`${isOpen ? 'block' : 'hidden'} bg-white rounded-xl shadow-xl w-96 h-[500px] scale-in`}>
        <div className="coke-gradient rounded-t-xl px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center">
              <i className="fas fa-robot text-coke-red"></i>
            </div>
            <span className="ml-2 text-white font-medium">Assistant RH SBGS</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white focus:outline-none"
          >
            <i className="fas fa-minus"></i>
          </button>
        </div>
        
        <div className="p-4 h-80 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`mb-3 ${message.isBot ? '' : 'text-right'}`}>
              <div className={`rounded-lg p-3 ${
                message.isBot 
                  ? 'bg-gray-200' 
                  : 'bg-coke-light bg-opacity-20 inline-block'
              }`}>
                <div className="text-sm leading-relaxed">
                  {renderMessageText(message.text)}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {message.isBot ? 'Aujourd\'hui à' : 'À l\'instant'} {formatTime(message.timestamp)}
              </p>
            </div>
          ))}
          {isSearching && (
            <div className="mb-3">
              <div className="bg-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-coke-red"></div>
                  <span className="text-sm">Recherche en cours...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex">
            <textarea 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow border border-gray-300 rounded-l-lg px-4 py-2 focus:ring-coke-red focus:border-coke-red resize-none"
              placeholder="Tapez votre message..." 
              rows="2"
              disabled={isSearching}
            />
            <button 
              onClick={sendMessage}
              disabled={isSearching || !inputMessage.trim()}
              className="coke-gradient text-white px-4 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Chat Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="coke-gradient w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:animate-bounce"
      >
        <i className="fas fa-comments text-white text-xl"></i>
      </button>
    </div>
  );
} 