import React from "react";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            À Propos du Programme de Stage SBGS
          </h2>
          <div className="w-20 h-1 bg-coke-red mx-auto mt-4"></div>
        </div>
        
        <div className="mt-12 grid md:grid-cols-2 gap-10 items-center">
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="bg-coke-light w-14 h-14 rounded-full flex items-center justify-center">
              <i className="fas fa-building text-coke-red text-xl"></i>
            </div>
            <h3 className="text-xl font-semibold mt-4">Notre Entreprise</h3>
            <p className="mt-3 text-gray-600">
              SBGS - Société des Boissons Gazeuses du Souss est l'embouteilleur agréé de Coca-Cola qui dessert la région dynamique d'Agadir, au Maroc. Nous sommes fiers de représenter une marque mondiale tout en maintenant des racines profondes dans notre communauté locale.
            </p>
            
            <div className="mt-6 bg-coke-light w-14 h-14 rounded-full flex items-center justify-center">
              <i className="fas fa-users text-coke-red text-xl"></i>
            </div>
            <h3 className="text-xl font-semibold mt-4">Notre Mission</h3>
            <p className="mt-3 text-gray-600">
              Nous visons à développer les jeunes talents marocains à travers des expériences d'apprentissage pratiques. Notre programme de stage donne aux étudiants une exposition réelle à la fabrication de boissons, à la gestion de la chaîne d'approvisionnement, au marketing et aux opérations commerciales.
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
            <div className="aspect-w-16 aspect-h-9">
              <div className="bg-gradient-to-r from-coke-red to-gray-800 h-full w-full flex items-center justify-center">
                <div className="text-white text-center p-8">
                  <h3 className="text-2xl font-bold">Pourquoi Faire un Stage chez SBGS ?</h3>
                  <ul className="mt-6 space-y-3 text-left">
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-coke-light mt-1 mr-3"></i>
                      <span>Expérience pratique avec une marque mondialement reconnue</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-coke-light mt-1 mr-3"></i>
                      <span>Opportunité de travailler sur des projets impactants</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-coke-light mt-1 mr-3"></i>
                      <span>Mentorat de professionnels de l'industrie</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-coke-light mt-1 mr-3"></i>
                      <span>Voie vers de futures opportunités de carrière</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-coke-light mt-1 mr-3"></i>
                      <span>Réseautage au sein de l'écosystème Coca-Cola</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 