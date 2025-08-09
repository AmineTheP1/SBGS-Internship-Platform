import React, { useState, useRef, useEffect } from "react";
import { API_ENDPOINTS } from "../config/api.js";
import BestCandidatesList from "./BestCandidatesList";
import axios from "axios";

export default function EnhancedChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [chatSize, setChatSize] = useState({ width: 384, height: 500 }); // Default size (w-96 = 384px)
  const chatRef = useRef(null);
  const resizeRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis votre Assistant RH SBGS. Je peux vous aider à rechercher des candidats selon leurs compétences et expériences.\n\n💡 Exemples de recherches:\n• 'Trouve des candidats avec Angular'\n• 'Cherche des développeurs React'\n• 'Candidats qui parlent anglais'\n• 'Find candidates with marketing experience'\n• 'Candidats avec Excel'\n• 'Cherche des designers Photoshop'\n• 'Candidats en génie mécanique'\n\n🔍 Je recherche dans les CVs pour toutes sortes de compétences : techniques, langues, logiciels, formations, etc.\n\n💼 Vous pouvez également me demander de vous montrer les meilleurs anciens stagiaires pour un recrutement potentiel en tapant:\n• 'Montre-moi les meilleurs anciens stagiaires'\n• 'Trouve les stagiaires les mieux évalués'\n• 'Qui sont les meilleurs candidats pour un emploi?'",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [paginationState, setPaginationState] = useState({});

  // Handle resize functionality
  useEffect(() => {
    const handleMouseDown = (e) => {
      setIsResizing(true);
      // Prevent text selection during resize
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      // Calculate new width and height based on mouse position
      const chatRect = chatRef.current.getBoundingClientRect();
      const newWidth = Math.max(384, e.clientX - chatRect.left); // Minimum width 384px
      const newHeight = Math.max(500, e.clientY - chatRect.top); // Minimum height 500px
      
      setChatSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // Restore text selection
      document.body.style.userSelect = '';
    };

    // Add event listeners
    const resizeHandle = resizeRef.current;
    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', handleMouseDown);
    }
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    // Clean up event listeners
    return () => {
      if (resizeHandle) {
        resizeHandle.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const botResponses = [
    "Merci pour votre message. Pour le statut de votre candidature de stage, veuillez permettre 2-3 semaines à notre équipe RH pour examiner les candidatures.",
    "Notre équipe RH travaille du lundi au vendredi de 8h30 à 18h00. Ils seront ravis de vous aider.",
    "Vous pouvez envoyer un email à stage@sbgs.ma pour toute question urgente concernant notre programme de stage.",
    "Les postes de stage durent généralement entre 1 et 6 mois selon le département.",
    "Les étudiants de toutes les universités accréditées au Maroc sont les bienvenus pour postuler à notre programme de stage."
  ];

  // Function to detect if the message is a request for best candidates
  const isBestCandidatesQuery = (message) => {
    const bestCandidatesKeywords = [
      'meilleurs', 'meilleur', 'meilleures', 'meilleure', 'top', 'mieux', 'évalués', 'évalué', 'notés', 'noté', 
      'anciens stagiaires', 'ancien stagiaire', 'stagiaires', 'stagiaire',
      'best', 'top-rated', 'highest rated', 'former interns', 'former intern', 'previous interns', 'previous intern',
      'emploi', 'recrutement', 'embauche', 'employment', 'hire', 'hiring'
    ];
    
    const lowerMessage = message.toLowerCase();
    const isMatch = bestCandidatesKeywords.some(keyword => lowerMessage.includes(keyword));
    return isMatch;
  };

  // Function to detect if the message is a CV search query
  const isCVSearchQuery = (message) => {
    const searchKeywords = [
      'trouve', 'cherche', 'recherche', 'candidats', 'candidat', 'qui', 'ont', 'experience', 'expérience', 'avec',
      'find', 'search', 'candidates', 'candidate', 'who', 'have', 'experience', 'with'
    ];
    
    const lowerMessage = message.toLowerCase();
    
    // If it's already identified as a best candidates query, don't treat it as CV search
    if (isBestCandidatesQuery(message)) {
      return false;
    }
    
    return searchKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  // Function to get best candidates
  const getBestCandidates = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.HR_GET_BEST_CANDIDATES, {
        withCredentials: true
      });

      if (response.data.success) {
        if (response.data.candidates.length === 0) {
          return response.data.message || "Je n'ai trouvé aucun ancien stagiaire avec des évaluations dans notre base de données. Les évaluations sont créées par les superviseurs après approbation des rapports de stage.";
        }

        let responseText = `J'ai trouvé ${response.data.candidates.length} ancien(s) stagiaire(s) avec les meilleures évaluations:`;

        return {
          text: responseText,
          bestCandidates: response.data.candidates
        };
      } else {
        console.error("API returned success: false", response.data.error);
        return "Désolé, j'ai rencontré une erreur lors de la recherche. Veuillez réessayer.";
      }
    } catch (error) {
      if (error.response?.status === 401) {
        return "Vous devez être connecté pour accéder à cette fonctionnalité. Veuillez vous connecter via le portail RH.";
      }
      if (error.response?.status === 403) {
        return "Cette fonctionnalité est réservée au personnel RH. Veuillez vous connecter avec un compte RH pour voir les évaluations des anciens stagiaires.";
      }
      // Only log unexpected errors (not auth errors)
      console.error("Unexpected error getting best candidates:", error);
      return `Désolé, j'ai rencontré une erreur lors de la recherche (${error.response?.status || 'réseau'}). Veuillez réessayer.`;
    }
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

        let responseText = `J'ai trouvé ${data.candidates.length} candidat(s) correspondant à votre recherche "${query}":`;

        return {
          text: responseText,
          candidates: data.candidates,
          query: query
        };
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

    // Check if this is a best candidates query FIRST (higher priority)
    if (isBestCandidatesQuery(currentQuery)) {
      // Show searching message
      const searchingMessage = {
        id: Date.now() + 1,
        text: "🔍 Je recherche les meilleurs anciens stagiaires...",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, searchingMessage]);

      // Get best candidates
      const bestCandidatesResult = await getBestCandidates();
      
      // Replace searching message with results
      setMessages(prev => prev.map(msg => 
        msg.id === searchingMessage.id 
          ? { 
              ...msg, 
              text: typeof bestCandidatesResult === 'string' ? bestCandidatesResult : bestCandidatesResult.text,
              bestCandidates: typeof bestCandidatesResult === 'object' ? bestCandidatesResult.bestCandidates : null
            }
          : msg
      ));
    }
    // Check if this is a CV search query (lower priority)
    else if (isCVSearchQuery(currentQuery)) {
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
          ? { 
              ...msg, 
              text: typeof searchResult === 'string' ? searchResult : searchResult.text,
              candidates: typeof searchResult === 'object' ? searchResult.candidates : null,
              query: typeof searchResult === 'object' ? searchResult.query : null
            }
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
  const renderMessageText = (text, message) => {
    // Convert **text** to bold
    const boldText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert [text](url) to clickable links
    const linkText = boldText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
    
    // Convert \n to <br>
    const finalText = linkText.replace(/\n/g, '<br>');
    
    return <span dangerouslySetInnerHTML={{ __html: finalText }} />;
  };

  // Function to render best candidates list
  const renderBestCandidatesList = (message) => {
    if (!message.bestCandidates || !Array.isArray(message.bestCandidates)) {
      return null;
    }
    
    return <BestCandidatesList candidates={message.bestCandidates} />;
  };
  
  // Function to toggle expanded view
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Function to toggle expanded view for a message
  const toggleMessageExpanded = (messageId) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Function to handle pagination for a message
  const handlePagination = (messageId, direction) => {
    setPaginationState(prev => {
      const currentPage = prev[messageId] || 0;
      const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
      return { ...prev, [messageId]: Math.max(0, newPage) };
    });
  };

  // Function to render candidate list with pagination
  const renderCandidateList = (message) => {
    if (!message.candidates) return null;
    
    const isExpanded = expandedMessages.has(message.id);
    const currentPage = paginationState[message.id] || 0;
    const candidatesPerPage = 3; // Show 3 candidates per page
    
    let candidatesToShow;
    if (isExpanded) {
      // When expanded, show all with pagination
      const startIndex = currentPage * candidatesPerPage;
      candidatesToShow = message.candidates.slice(startIndex, startIndex + candidatesPerPage);
    } else {
      // When not expanded, just show first 3
      candidatesToShow = message.candidates.slice(0, candidatesPerPage);
    }
    
    const totalPages = Math.ceil(message.candidates.length / candidatesPerPage);
    
    return (
      <div className="mt-2">
        {candidatesToShow.map((candidate) => (
          <div key={candidate.cdtid} className="mb-3 p-2 bg-gray-50 rounded border-l-4 border-coke-red">
            <div className="font-semibold text-sm">{candidate.fullName}</div>
            <div className="text-xs text-gray-600">📧 {candidate.email}</div>
            <div className="text-xs text-gray-600">📱 {candidate.telephone || 'Non disponible'}</div>
            <div className="text-xs text-gray-600">🎯 Compétences: {candidate.matchingKeywords.join(', ')}</div>
            <div className="text-xs">
              📄 <a 
                href={`${API_ENDPOINTS.HR_GET_CV}?filename=${encodeURIComponent(candidate.cvfilename)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Télécharger CV
              </a>
            </div>
          </div>
        ))}
        
        <div className="flex justify-between items-center mt-2">
          {isExpanded && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePagination(message.id, 'prev')}
                disabled={currentPage === 0}
                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 text-xs"
              >
                &lt; Précédent
              </button>
              
              <span className="text-xs">
                Page {currentPage + 1} / {totalPages}
              </span>
              
              <button
                onClick={() => handlePagination(message.id, 'next')}
                disabled={currentPage >= totalPages - 1}
                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 text-xs"
              >
                Suivant &gt;
              </button>
            </div>
          )}
          
          {message.candidates.length > candidatesPerPage && (
            <button
              onClick={() => {
                toggleMessageExpanded(message.id);
                // Reset pagination when toggling expanded state
                if (!expandedMessages.has(message.id)) {
                  setPaginationState(prev => ({ ...prev, [message.id]: 0 }));
                }
              }}
              className="text-blue-600 hover:text-blue-800 underline text-sm ml-auto"
            >
              {isExpanded ? 'Voir moins' : `Voir tous les candidats (${message.candidates.length - candidatesPerPage} de plus)`}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Chat Window - Only render when open */}
      {isOpen && (
        <div 
          ref={chatRef}
          className={`bg-white rounded-xl shadow-xl transition-all duration-300 scale-in relative ${isResizing ? 'cursor-nwse-resize' : ''}`}
          style={{ 
            width: isResizing ? `${chatSize.width}px` : (isExpanded ? '800px' : '384px'),
            height: isResizing ? `${chatSize.height}px` : (isExpanded ? '700px' : '500px')
          }}
        >
          <div className="coke-gradient rounded-t-xl px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-coke-red"></i>
              </div>
              <span className="ml-2 text-white font-medium">Assistant RH SBGS</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white focus:outline-none mr-2 relative group"
                title={isExpanded ? "Réduire" : "Agrandir"}
              >
                <i className={`fas ${isExpanded ? 'fa-compress-alt' : 'fa-expand-alt'}`}></i>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {isExpanded ? "Réduire" : "Agrandir"}
                </span>
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white focus:outline-none relative group"
                title="Fermer"
              >
                <i className="fas fa-times"></i>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Fermer
                </span>
              </button>
            </div>
          </div>
          
          
          <div className="p-4 overflow-y-auto" style={{ 
            height: isResizing 
              ? `${chatSize.height - 130}px` 
              : (isExpanded ? '570px' : '370px')
          }}>
            {messages.map((message) => (
              <div key={message.id} className={`mb-3 ${message.isBot ? '' : 'text-right'}`}>
                <div className={`rounded-lg p-3 ${
                   message.isBot 
                     ? 'bg-gray-200' 
                     : 'bg-coke-light bg-opacity-20 inline-block'
                 }`}>
                   <div className="text-sm leading-relaxed">
                     {renderMessageText(message.text, message)}
                   </div>
                   {message.candidates && renderCandidateList(message)}
                   {message.bestCandidates && renderBestCandidatesList(message)}
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
          
          <div className="p-4 border-t bg-white rounded-b-xl">
            <div className="flex items-end space-x-2">
              <textarea 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none outline-none min-h-[40px] max-h-[100px]"
                placeholder="Tapez votre message..." 
                rows="1"
                disabled={isSearching}
                style={{ lineHeight: '1.5' }}
              />
              <button 
                onClick={sendMessage}
                disabled={isSearching || !inputMessage.trim()}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[48px] h-[40px] hover:from-red-700 hover:to-red-800 transition-colors"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}
      
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