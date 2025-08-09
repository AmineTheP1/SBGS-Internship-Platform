import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { API_ENDPOINTS } from "../config/api.js";

export default function HRLoginSection() {
  const [loginData, setLoginData] = useState({
    employeeId: "",
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

    if (!loginData.employeeId || !loginData.password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.HR_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        setStatus("Connexion réussie ! Redirection vers le tableau de bord...");
        setTimeout(() => {
          window.location.replace("/admin");
        }, 2000);
      } else {
        setError("Identifiants incorrects. Veuillez réessayer.");
      }
    } catch (err) {
      setError("Erreur réseau. Veuillez réessayer.");
    }
  };

  return (
    <section id="hr" className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Portail RH</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Accédez à notre plateforme interne pour gérer les candidatures de stage
          </p>
          <div className="w-20 h-1 bg-coke-red mx-auto mt-4"></div>
        </div>
        
        <div className="mt-12 grid md:grid-cols-2 gap-10 items-center">
          <div className="rounded-xl shadow-xl text-white overflow-hidden bg-gradient-to-b from-coke-red to-gray-900">
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-6">Connexion RH</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="block mb-2">Identifiant Employé RH</label>
                  <input 
                    type="text" 
                    name="employeeId"
                    value={loginData.employeeId}
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
                  Se connecter au Tableau de Bord
                </button>
              </form>
              <div className="mt-6 text-center">
                <a href="#" className="text-sm opacity-80 hover:opacity-100 transition">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Gérez les Candidatures de Stage Efficacement
            </h3>
            <p className="text-gray-600 mb-6">
              Notre portail RH fournit des outils puissants pour rationaliser l'ensemble du processus de stage :
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-coke-light w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-list text-coke-red"></i>
                </div>
                <span className="ml-3 text-gray-600">Visualisez et filtrez toutes les candidatures en un seul endroit</span>
              </li>
              <li className="flex items-start">
                <div className="bg-coke-light w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-search text-coke-red"></i>
                </div>
                <span className="ml-3 text-gray-600">Recherchez par compétences, formation ou expérience</span>
              </li>
              <li className="flex items-start">
                <div className="bg-coke-light w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-comments text-coke-red"></i>
                </div>
                <span className="ml-3 text-gray-600">Communiquez directement avec les candidats</span>
              </li>
              <li className="flex items-start">
                <div className="bg-coke-light w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-calendar-alt text-coke-red"></i>
                </div>
                <span className="ml-3 text-gray-600">Planifiez des entretiens et suivez les progrès</span>
              </li>
              <li className="flex items-start">
                <div className="bg-coke-light w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-file-pdf text-coke-red"></i>
                </div>
                <span className="ml-3 text-gray-600">Générez des rapports pour la direction</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}