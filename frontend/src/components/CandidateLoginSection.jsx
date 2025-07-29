import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaGraduationCap } from "react-icons/fa";
import API_ENDPOINTS from "../config/api.js";

export default function CandidateLoginSection() {
  const [loginData, setLoginData] = useState({
    candidateId: "",
    password: "",
    rememberMe: false
  });

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");

    if (!loginData.candidateId || !loginData.password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.CANDIDATE_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        setStatus("Connexion réussie ! Redirection vers votre espace...");
        setTimeout(() => {
          window.location.replace("/candidate-dashboard");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Identifiants incorrects. Veuillez réessayer.");
      }
    } catch (err) {
      setError("Erreur réseau. Veuillez réessayer.");
    }
  };

  return (
    <section id="candidate" className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Espace Candidat</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Connectez-vous à votre espace personnel pour suivre votre candidature de stage
          </p>
          <div className="w-20 h-1 bg-coke-red mx-auto mt-4"></div>
        </div>
        
        <div className="mt-12 grid md:grid-cols-2 gap-10 items-center">
          <div className="rounded-xl shadow-xl text-white overflow-hidden bg-gradient-to-b from-coke-red to-gray-900">
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <FaGraduationCap className="text-4xl mr-3" />
                <h3 className="text-2xl font-bold">Connexion Candidat</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="block mb-2">Identifiant Candidat</label>
                  <input 
                    type="text" 
                    name="candidateId"
                    value={loginData.candidateId}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-coke-light bg-opacity-20 rounded-lg placeholder-white" 
                    placeholder="Entrez votre identifiant" 
                    required 
                  />
                </div>
                <div className="mb-5">
                  <label className="block mb-2">Mot de passe</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-coke-light bg-opacity-20 rounded-lg placeholder-white pr-10" 
                      placeholder="Entrez votre mot de passe" 
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center mb-5">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    name="rememberMe"
                    checked={loginData.rememberMe}
                    onChange={handleInputChange}
                    className="text-coke-light" 
                  />
                  <label htmlFor="remember" className="ml-2">Se souvenir de moi</label>
                </div>
                
                {error && <div className="mb-4 text-red-300 font-semibold text-center">{error}</div>}
                {status && <div className="mb-4 text-green-300 font-semibold text-center">{status}</div>}
                
                <button 
                  type="submit" 
                  className="w-full bg-white text-coke-red py-3 px-4 rounded-lg font-bold shadow-md hover:bg-gray-100 transition"
                >
                  Accéder à mon espace
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm opacity-80 mb-2">
                  Vous n'avez pas encore reçu vos identifiants ?
                </p>
                <p className="text-sm opacity-80">
                  Contactez-nous à stage@sbgs.ma
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Suivez votre candidature en temps réel
            </h3>
            <p className="text-gray-600 mb-6">
              Une fois connecté à votre espace candidat vous pourrez :
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-coke-light w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-eye text-coke-red"></i>
                </div>
                <span className="ml-3 text-gray-600">Consulter le statut de votre candidature</span>
              </li>
              <li className="flex items-start">
                <div className="bg-coke-light w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-file-alt text-coke-red"></i>
                </div>
                <span className="ml-3 text-gray-600">Accéder à vos documents et informations</span>
              </li>
              <li className="flex items-start">
                <div className="bg-coke-light w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-calendar text-coke-red"></i>
                </div>
                <span className="ml-3 text-gray-600">Recevoir les informations importantes sur votre stage</span>
              </li>
              <li className="flex items-start">
                <div className="bg-coke-light w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-bell text-coke-red"></i>
                </div>
                <span className="ml-3 text-gray-600">Être notifié des mises à jour importantes</span>
              </li>
            </ul>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Important</h4>
              <p className="text-blue-700 text-sm">
                Vos identifiants vous sont envoyés par email uniquement après acceptation de votre candidature. 
                Si vous n'avez pas encore reçu vos identifiants, cela signifie que votre candidature est encore en cours d'examen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 