import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserTie, FaEye, FaEyeSlash, FaUsers, FaClock, FaFileAlt, FaCalendar } from "react-icons/fa";

export default function SupervisorLoginSection() {
  const [formData, setFormData] = useState({
    supervisorId: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/supervisor/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        navigate("/supervisor-dashboard");
      } else {
        setError(data.error || "Erreur de connexion");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Portail Responsable de Stage
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Accédez à notre plateforme pour superviser vos stagiaires et évaluer leurs rapports
          </p>
          <div className="w-20 h-1 bg-coke-red mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left Section: Login Form */}
          <div className="bg-gradient-to-br from-coke-red via-red-700 to-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-8">Connexion Responsable</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Identifiant Responsable
                </label>
                <input
                  type="text"
                  name="supervisorId"
                  value={formData.supervisorId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-coke-light bg-opacity-20 rounded-lg placeholder-white text-white"
                  placeholder="Entrez votre identifiant"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 bg-coke-light bg-opacity-20 rounded-lg placeholder-white text-white"
                    placeholder="Entrez votre mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-coke-red focus:ring-white border-white rounded"
                />
                <label className="ml-2 block text-sm text-white">
                  Se souvenir de moi
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-coke-red py-4 px-6 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? "Connexion..." : "Se connecter au Tableau de Bord"}
              </button>

              <div className="text-center">
                <a
                  href="/login"
                  className="text-white hover:text-gray-200 text-sm underline"
                >
                  Retour à la sélection
                </a>
              </div>
            </form>
          </div>

          {/* Right Section: Features */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Supervisez vos Stagiaires Efficacement
              </h3>
              <p className="text-gray-600 mb-6">
                Notre portail responsable de stage fournit des outils puissants pour gérer l'ensemble du processus de supervision :
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-coke-red w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FaUsers className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-gray-600">
                    Visualisez et gérez tous vos stagiaires assignés
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-coke-red w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FaClock className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-gray-600">
                    Suivez les présences et pointages en temps réel
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-coke-red w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FaFileAlt className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-gray-600">
                    Consultez et évaluez les rapports journaliers
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-coke-red w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FaCalendar className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-gray-600">
                    Notez les absences et justifications
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-coke-red w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FaUserTie className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-gray-600">
                    Révisiez et évaluez les rapports de stage finaux
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 