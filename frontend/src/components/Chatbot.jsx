import React, { useState, useEffect } from "react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis votre Assistant RH SBGS. Comment puis-je vous aider avec les candidatures de stage ou les questions RH ?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const botResponses = [
    "Merci pour votre message. Pour le statut de votre candidature de stage, veuillez permettre 2-3 semaines à notre équipe RH pour examiner les candidatures.",
    "Notre équipe RH travaille du lundi au vendredi de 8h30 à 18h00. Ils seront ravis de vous aider.",
    "Vous pouvez envoyer un email à stage@sbgs.ma pour toute question urgente concernant notre programme de stage.",
    "Les postes de stage durent généralement entre 1 et 6 mois selon le département.",
    "Les étudiants de toutes les universités accréditées au Maroc sont les bienvenus pour postuler à notre programme de stage."
  ];

  const sendMessage = () => {
    if (inputMessage.trim() === "") return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Simulate bot response
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
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Chat Window */}
      <div className={`${isOpen ? 'block' : 'hidden'} bg-white rounded-xl shadow-xl w-80 h-96 scale-in`}>
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
        
        <div className="p-4 h-64 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`mb-3 ${message.isBot ? '' : 'text-right'}`}>
              <div className={`rounded-lg p-3 ${
                message.isBot 
                  ? 'bg-gray-200' 
                  : 'bg-coke-light bg-opacity-20 inline-block'
              }`}>
                <p>{message.text}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {message.isBot ? 'Aujourd\'hui à' : 'À l\'instant'} {formatTime(message.timestamp)}
              </p>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow border border-gray-300 rounded-l-lg px-4 py-2 focus:ring-coke-red focus:border-coke-red" 
              placeholder="Tapez votre message..." 
            />
            <button 
              onClick={sendMessage}
              className="coke-gradient text-white px-4 rounded-r-lg"
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