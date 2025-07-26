import React from "react";
import { Link } from "react-router-dom";
import { FaUserTie, FaGraduationCap } from "react-icons/fa";

export default function UserTypeSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coke-red to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Plateforme SBGS
          </h1>
          <p className="text-xl text-white opacity-90">
            Choisissez votre type de compte pour vous connecter
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* RH Login Card */}
          <Link 
            to="/hr-login"
            className="group bg-white rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-3xl"
          >
            <div className="bg-coke-red w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-700 transition-colors">
              <FaUserTie className="text-3xl text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Espace RH
            </h3>
            <p className="text-gray-600 mb-6">
              Accédez au tableau de bord pour gérer les candidatures de stage
            </p>
            <div className="bg-coke-red text-white py-3 px-6 rounded-lg font-semibold group-hover:bg-red-700 transition-colors">
              Se connecter
            </div>
          </Link>

          {/* Candidate Login Card */}
          <Link 
            to="/candidate-login"
            className="group bg-white rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-3xl"
          >
            <div className="bg-coke-red w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-700 transition-colors">
              <FaGraduationCap className="text-3xl text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Espace Candidat
            </h3>
            <p className="text-gray-600 mb-6">
              Accédez à votre espace personnel pour suivre votre candidature
            </p>
            <div className="bg-coke-red text-white py-3 px-6 rounded-lg font-semibold group-hover:bg-red-700 transition-colors">
              Se connecter
            </div>
          </Link>
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/"
            className="text-white opacity-80 hover:opacity-100 transition-opacity underline"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
} 