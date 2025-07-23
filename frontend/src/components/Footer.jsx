import React from "react";
import { Link } from "react-router-dom";

import { FaPaperPlane } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-12 gap-x-12 items-start w-full">
          <div className="text-left mb-8 md:mb-0">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <img 
                  src="https://companieslogo.com/img/orig/KO-b23a2a5e.png?t=1720244492" 
                  alt="Coca-Cola Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="ml-3">
                <span className="font-bold text-xl">SBGS</span>
                <p className="text-sm opacity-70">Embouteillage Coca-Cola</p>
              </div>
            </div>
            <p className="text-gray-400">
            La Société des Boissons Gazeuses du Souss est l'embouteilleur agréé de Coca-Cola qui dessert la région d'Agadir avec des boissons de classe mondiale.
            </p>
          </div>
          <div className="text-left mb-8 md:mb-0 flex-1">
            <h4 className="text-lg font-medium mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition">Accueil</Link></li>
              <li><Link to="/apply" className="text-gray-400 hover:text-white transition">Postuler pour un Stage</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Nous Contacter</Link></li>
            </ul>
          </div>
          
          <div className="text-left">
            <h4 className="text-lg font-medium mb-4">Connectez-vous avec Nous</h4>
            <div className="flex space-x-4 mb-6">
              <a href="https://www.facebook.com/sbgs.ma/" className="bg-gray-800 hover:bg-coke-red transition w-10 h-10 rounded-full flex items-center justify-center">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.linkedin.com/company/sbgs-limited/" className="bg-gray-800 hover:bg-coke-red transition w-10 h-10 rounded-full flex items-center justify-center">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
            <h5 className="font-medium mb-2">Abonnez-vous à notre newsletter</h5>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="bg-gray-800 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-coke-red" 
              />
              <button className="bg-coke-red rounded-r-lg px-4 text-white flex items-center justify-center" aria-label="Envoyer">
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500">© 2025 Société des Boissons Gazeuses du Souss. Tous droits réservés.</p>
            <div className="mt-2 md:mt-0 flex items-center gap-2">
              <img 
                src="https://companieslogo.com/img/orig/KO-b23a2a5e.png?t=1720244492" 
                alt="Coca-Cola Logo" 
                className="h-8"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 