import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserTie, FaUsers, FaClock, FaFileAlt, FaCalendar, FaSignOutAlt, FaEye, FaPlus } from "react-icons/fa";

export default function SupervisorDashboard() {
  const [supervisor, setSupervisor] = useState(null);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [showInternDetails, setShowInternDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/supervisor/session", { 
          credentials: "include" 
        });
        if (!res.ok) {
          navigate('/supervisor-login', { replace: true });
          return;
        }
        const data = await res.json();
        setSupervisor(data.supervisor);
        
        // Fetch assigned interns
        const internsRes = await fetch("http://localhost:3000/api/supervisor/get-assigned-interns", {
          credentials: "include"
        });
        if (internsRes.ok) {
          const internsData = await internsRes.json();
          setInterns(internsData.interns);
        }
      } catch {
        navigate('/supervisor-login', { replace: true });
      }
      setLoading(false);
    };
    checkSession();
  }, [navigate]);



  const handleViewInternDetails = async (cdtid) => {
    try {
      const res = await fetch(`http://localhost:3000/api/supervisor/get-intern-details?cdtid=${cdtid}`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedIntern(data);
        setShowInternDetails(true);
      }
    } catch (error) {
      console.error("Error fetching intern details:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coke-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!supervisor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erreur de chargement des données</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaUsers className="text-2xl text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stagiaires assignés</p>
                <p className="text-2xl font-bold text-gray-800">{interns.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaClock className="text-2xl text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Présents aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-800">
                  {interns.filter(intern => intern.statut_candidature === 'Accepté').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FaFileAlt className="text-2xl text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rapports à réviser</p>
                <p className="text-2xl font-bold text-gray-800">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaCalendar className="text-2xl text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absences ce mois</p>
                <p className="text-2xl font-bold text-gray-800">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interns List */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Mes Stagiaires</h2>
            <div className="text-sm text-gray-600">
              {interns.length} stagiaire(s) assigné(s)
            </div>
          </div>

          {interns.length === 0 ? (
            <div className="text-center py-12">
              <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun stagiaire assigné pour le moment</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interns.map((intern) => (
                <div key={intern.cdtid} className="bg-gray-50 rounded-lg p-6 border">
                  <div className="flex items-center mb-4">
                    {intern.imageurl ? (
                      <img
                        src={`http://localhost:3000${intern.imageurl}`}
                        alt={`${intern.prenom} ${intern.nom}`}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-coke-red flex items-center justify-center mr-4">
                        <FaUsers className="text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {intern.prenom} {intern.nom}
                      </h3>
                      <p className="text-sm text-gray-600">ID: {intern.cdtid}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Statut:</span>
                      <span className={`font-medium ${
                        intern.statut_candidature === 'Accepté' ? 'text-green-600' : 
                        intern.statut_candidature === 'En attente' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {intern.statut_candidature}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{intern.typestage || 'Non spécifié'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Durée:</span>
                      <span className="font-medium">{intern.periode || 'Non spécifiée'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewInternDetails(intern.cdtid)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-coke-red text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FaEye className="mr-2" />
                    Voir détails
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Intern Details Modal */}
      {showInternDetails && selectedIntern && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Détails du stagiaire - {selectedIntern.intern.prenom} {selectedIntern.intern.nom}
              </h3>
              <button
                onClick={() => setShowInternDetails(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Intern Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Informations</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-800">{selectedIntern.intern.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Statut</label>
                    <p className="text-gray-800">{selectedIntern.intern.statut_candidature}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Type de stage</label>
                    <p className="text-gray-800">{selectedIntern.intern.typestage || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Durée</label>
                    <p className="text-gray-800">{selectedIntern.intern.periode || 'Non spécifiée'}</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Activité récente</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Dernier pointage</label>
                    <p className="text-gray-800">
                      {selectedIntern.attendance.length > 0 
                        ? `${selectedIntern.attendance[0].date} - ${selectedIntern.attendance[0].heure_entree || 'Non pointé'}`
                        : 'Aucun pointage'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Rapports journaliers</label>
                    <p className="text-gray-800">{selectedIntern.dailyReports.length} rapport(s)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Absences</label>
                    <p className="text-gray-800">{selectedIntern.absences.length} absence(s)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setShowInternDetails(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 