import React from "react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <header className="coke-gradient py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Construisez Votre Avenir <br /> Avec SBGS
            </h1>
            <p className="mt-4 text-xl md:text-2xl max-w-xl">
              Opportunités de Stage dans la Principale Société d'Embouteillage Coca-Cola du Maroc
            </p>
            <p className="mt-6 max-w-lg">
              Rejoignez la Société des Boissons Gazeuses du Souss et acquérez une expérience professionnelle précieuse avec une marque mondialement reconnue.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link 
                to="/apply" 
                className="bg-white text-coke-red px-6 py-3 rounded-full font-medium shadow-lg hover:bg-gray-100 transition transform hover:-translate-y-1"
              >
                Postuler Maintenant
              </Link>
              <Link 
                to="/about" 
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full font-medium hover:bg-white hover:text-coke-red transition"
              >
                En Savoir Plus
              </Link>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="relative">
              <img 
                src="https://companieslogo.com/img/orig/KO-b23a2a5e.png?t=1720244492" 
                className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-full border-8 border-white shadow-xl" 
                alt="Bouteilles Coca-Cola" 
              />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-4 shadow-lg">
                <div className="bg-coke-red rounded-full w-16 h-16 flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-white text-2xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 