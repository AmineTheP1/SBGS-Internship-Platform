import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaGraduationCap, FaSignOutAlt } from "react-icons/fa";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'hr' or 'candidate'
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkSessions = async () => {
      try {
        // Check HR session first
        const hrRes = await fetch("http://localhost:3000/api/hr/session", { credentials: "include" });
        if (hrRes.ok) {
          const hrData = await hrRes.json();
          setIsLoggedIn(true);
          setUserType('hr');
          setUserData(hrData.user);
          return;
        }

        // Check candidate session
        const candidateRes = await fetch("http://localhost:3000/api/candidate/session", { credentials: "include" });
        if (candidateRes.ok) {
          const candidateData = await candidateRes.json();
          setIsLoggedIn(true);
          setUserType('candidate');
          setUserData(candidateData.candidate);
          return;
        }

        // No session found
        setIsLoggedIn(false);
        setUserType(null);
        setUserData(null);
      } catch {
        setIsLoggedIn(false);
        setUserType(null);
        setUserData(null);
      }
    };
    checkSessions();
  }, [location]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Helper to determine if a path is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg rounded-b-2xl sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center h-20">
          <div className="absolute left-0 flex items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md focus:outline-none" aria-label="Aller à la page d'accueil">
                <img 
                  src="https://companieslogo.com/img/orig/KO-b23a2a5e.png?t=1720244492" 
                  alt="Coca-Cola Logo" 
                  className="w-10 h-10 object-contain"
                />
              </Link>
              <div className="ml-4">
                <span className="font-bold text-2xl text-coke-red tracking-wide">SBGS</span>
                <span className="text-xs text-gray-600 block mt-1">Embouteillage Coca-Cola</span>
              </div>
            </div>
          </div>
          <div className="mx-auto flex space-x-4 items-center">
            {/* Links */}
            <Link to="/" className={`${isActive("/") ? "text-coke-red font-semibold bg-gray-50 shadow-sm border-b-2 border-coke-red" : "text-gray-600 font-medium"} px-4 py-2 rounded-lg transition-all duration-200 hover:bg-coke-red hover:text-white`}>Accueil</Link>
            <Link to="/apply" className={`${isActive("/apply") ? "text-coke-red font-semibold bg-gray-50 shadow-sm border-b-2 border-coke-red" : "text-gray-600 font-medium"} px-4 py-2 rounded-lg transition-all duration-200 hover:bg-coke-red hover:text-white`}>Postuler</Link>
            <Link to="/contact" className={`${isActive("/contact") ? "text-coke-red font-semibold bg-gray-50 shadow-sm border-b-2 border-coke-red" : "text-gray-600 font-medium"} px-4 py-2 rounded-lg transition-all duration-200 hover:bg-coke-red hover:text-white`}>Contact</Link>
            {isLoggedIn && userType === 'hr' && (
              <Link
                to="/admin"
                className={`${isActive("/admin") ? "text-coke-red font-semibold bg-gray-50 shadow-sm border-b-2 border-coke-red" : "text-gray-600 font-medium"} px-4 py-2 rounded-lg transition-all duration-200 hover:bg-coke-red hover:text-white`}
              >
                Tableau de Bord RH
              </Link>
            )}
            {isLoggedIn && userType === 'candidate' && (
              <Link
                to="/candidate-dashboard"
                className={`${isActive("/candidate-dashboard") ? "text-coke-red font-semibold bg-gray-50 shadow-sm border-b-2 border-coke-red" : "text-gray-600 font-medium"} px-4 py-2 rounded-lg transition-all duration-200 hover:bg-coke-red hover:text-white`}
              >
                Mon Espace
              </Link>
            )}
          </div>
          <div className="absolute right-0 flex items-center">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">
                    {userType === 'hr' ? (
                      <>
                        <FaGraduationCap className="inline mr-1 text-coke-red" />
                        {userData?.prenom} {userData?.nom}
                      </>
                    ) : (
                      <>
                        <FaGraduationCap className="inline mr-1 text-coke-red" />
                        {userData?.prenom} {userData?.nom}
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {userType === 'hr' ? 'RH' : 'Candidat'} • {userData?.cdtid || userData?.rhId}
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  className="flex items-center px-4 py-2 rounded-lg bg-coke-red text-white font-semibold transition-all duration-200 hover:bg-red-700"
                  onClick={async () => {
                    if (userType === 'hr') {
                      await fetch("http://localhost:3000/api/hr/logout", { credentials: "include" });
                      navigate('/hr-login');
                    } else {
                      await fetch("http://localhost:3000/api/candidate/logout", { credentials: "include" });
                      navigate('/candidate-login');
                    }
                    setIsLoggedIn(false);
                    setUserType(null);
                    setUserData(null);
                  }}
                >
                  
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link to="/login" className="ml-4 px-4 py-2 rounded-lg bg-coke-red text-white font-semibold transition-all duration-200 hover:bg-red-700">Se connecter</Link>
            )}
          </div>
          {/* Mobile menu button */}
          {/*<div className="flex md:hidden items-center">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-coke-red p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red transition-all duration-200"
              aria-label="Ouvrir le menu"
            >
              <FaBars className="text-2xl" />
            </button>
          </div>*/}
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white rounded-b-2xl shadow-lg fixed top-20 left-0 w-full z-[9999]">
          <Link to="/" className={`block px-6 py-3 rounded-lg mt-2 transition-all duration-200 border-l-4 ${isActive("/") ? "text-coke-red font-semibold bg-gray-50 border-coke-red" : "text-gray-600 font-medium border-transparent"} hover:bg-coke-red hover:text-white`} onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
          <Link to="/apply" className={`block px-6 py-3 rounded-lg mt-2 transition-all duration-200 border-l-4 ${isActive("/apply") ? "text-coke-red font-semibold bg-gray-50 border-coke-red" : "text-gray-600 font-medium border-transparent"} hover:bg-coke-red hover:text-white`} onClick={() => setMobileMenuOpen(false)}>Postuler</Link>
          <Link to="/contact" className={`block px-6 py-3 rounded-lg mt-2 transition-all duration-200 border-l-4 ${isActive("/contact") ? "text-coke-red font-semibold bg-gray-50 border-coke-red" : "text-gray-600 font-medium border-transparent"} hover:bg-coke-red hover:text-white`} onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          {isLoggedIn && userType === 'hr' && (
            <Link to="/admin" className={`block px-6 py-3 rounded-lg mt-2 transition-all duration-200 border-l-4 ${isActive("/admin") ? "text-coke-red font-semibold bg-gray-50 border-coke-red" : "text-gray-600 font-medium border-transparent"} hover:bg-coke-red hover:text-white`} onClick={() => setMobileMenuOpen(false)}>Tableau de Bord RH</Link>
          )}
          {isLoggedIn && userType === 'candidate' && (
            <Link to="/candidate-dashboard" className={`block px-6 py-3 rounded-lg mt-2 transition-all duration-200 border-l-4 ${isActive("/candidate-dashboard") ? "text-coke-red font-semibold bg-gray-50 border-coke-red" : "text-gray-600 font-medium border-transparent"} hover:bg-coke-red hover:text-white`} onClick={() => setMobileMenuOpen(false)}>Mon Espace</Link>
          )}
        </div>
      )}
    </nav>
  );
} 