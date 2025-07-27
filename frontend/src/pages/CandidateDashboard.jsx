import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaGraduationCap, FaCalendar, FaFileAlt, FaSignOutAlt, FaClock, FaSignInAlt, FaSignOutAlt as FaSignOut, FaEdit } from "react-icons/fa";

export default function CandidateDashboard() {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [presence, setPresence] = useState(null);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [dailyReport, setDailyReport] = useState({
    taches_effectuees: '',
    documents_utilises: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/candidate/session", { 
          credentials: "include" 
        });
        if (!res.ok) {
          navigate('/candidate-login', { replace: true });
          return;
        }
        const data = await res.json();
        setCandidate(data.candidate);
        
        // Fetch presence data
        const presenceRes = await fetch("http://localhost:3000/api/candidate/get-attendance", {
          credentials: "include"
        });
        if (presenceRes.ok) {
          const presenceData = await presenceRes.json();
          setPresence(presenceData);
          if (presenceData.todayReport) {
            setDailyReport({
              taches_effectuees: presenceData.todayReport.taches_effectuees || '',
              documents_utilises: presenceData.todayReport.documents_utilises || ''
            });
          }
        }
      } catch {
        navigate('/candidate-login', { replace: true });
      }
      setLoading(false);
    };
    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/api/candidate/logout", { 
        credentials: "include" 
      });
      navigate('/candidate-login');
    } catch {
      navigate('/candidate-login');
    }
  };

  const handleClockIn = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/candidate/clock-in", {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        // Refresh presence data
        const presenceRes = await fetch("http://localhost:3000/api/candidate/get-attendance", {
          credentials: "include"
        });
        if (presenceRes.ok) {
          const presenceData = await presenceRes.json();
          setPresence(presenceData);
        }
        alert("Pointage d'entrée enregistré !");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Erreur lors du pointage");
    }
  };

  const handleClockOut = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/candidate/clock-out", {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        // Refresh presence data
        const presenceRes = await fetch("http://localhost:3000/api/candidate/get-attendance", {
          credentials: "include"
        });
        if (presenceRes.ok) {
          const presenceData = await presenceRes.json();
          setPresence(presenceData);
        }
        alert("Pointage de sortie enregistré !");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Erreur lors du pointage");
    }
  };

  const handleUpdateDailyReport = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/candidate/update-daily-report", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(dailyReport)
      });
      const data = await res.json();
      if (data.success) {
        alert("Rapport journalier mis à jour avec succès !");
        setShowDailyReport(false);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour du rapport");
    }
  };

  const getStatusBadge = (status) => {
    let color = "bg-gray-200 text-gray-700";
    if (status === "Accepté") color = "bg-green-100 text-green-700";
    else if (status === "Rejeté") color = "bg-red-100 text-red-700";
    else if (status === "En attente") color = "bg-yellow-100 text-yellow-700";
    return (
      <span className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${color}`}>
        {status}
      </span>
    );
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

  if (!candidate) {
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
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            {candidate.imageurl ? (
              <img
                src={`http://localhost:3000${candidate.imageurl}`}
                alt={`${candidate.prenom} ${candidate.nom}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-coke-red mr-4"
              />
            ) : (
              <div className="bg-coke-red w-16 h-16 rounded-full flex items-center justify-center mr-4">
                <FaUser className="text-2xl text-white" />
              </div>
            )}
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Bonjour, {candidate.prenom} {candidate.nom}
              </h2>
              <p className="text-gray-600">Identifiant: {candidate.cdtid}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center mb-3">
                <FaGraduationCap className="text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">Statut de candidature</h3>
              </div>
              {getStatusBadge(candidate.statut)}
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center mb-3">
                <FaCalendar className="text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">Type de stage</h3>
              </div>
              <p className="text-blue-700">{candidate.typestage || "Non spécifié"}</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center mb-3">
                <FaFileAlt className="text-purple-600 mr-2" />
                <h3 className="font-semibold text-purple-800">Durée</h3>
              </div>
              <p className="text-purple-700">{candidate.periode || "Non spécifiée"}</p>
            </div>
          </div>
        </div>

        {/* Clock In/Out Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <FaClock className="mr-2 text-coke-red" />
            Pointage - {new Date().toLocaleDateString('fr-FR')}
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {presence?.todayRecord?.heure_entree ? (() => {
                  try {
                    // If it's already a time string, format it without seconds
                    if (typeof presence.todayRecord.heure_entree === 'string' && presence.todayRecord.heure_entree.includes(':')) {
                      return presence.todayRecord.heure_entree.split(':').slice(0, 2).join(':');
                    }
                    // If it's a date object, format it without seconds
                    return new Date(presence.todayRecord.heure_entree).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  } catch (error) {
                    return presence.todayRecord.heure_entree || '--:--';
                  }
                })() : '--:--'}
              </div>
              <div className="text-sm text-gray-600">Heure d'entrée</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {presence?.todayRecord?.heure_sortie ? (() => {
                  try {
                    // If it's already a time string, format it without seconds
                    if (typeof presence.todayRecord.heure_sortie === 'string' && presence.todayRecord.heure_sortie.includes(':')) {
                      return presence.todayRecord.heure_sortie.split(':').slice(0, 2).join(':');
                    }
                    // If it's a date object, format it without seconds
                    return new Date(presence.todayRecord.heure_sortie).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  } catch (error) {
                    return presence.todayRecord.heure_sortie || '--:--';
                  }
                })() : '--:--'}
              </div>
              <div className="text-sm text-gray-600">Heure de sortie</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold mb-2">
                {presence?.currentStatus === 'Non pointé' && (
                  <span className="text-gray-500">Non pointé</span>
                )}
                {presence?.currentStatus === 'En cours' && (
                  <span className="text-green-600">En cours</span>
                )}
                {presence?.currentStatus === 'Terminé' && (
                  <span className="text-blue-600">Terminé</span>
                )}
              </div>
              <div className="text-sm text-gray-600">Statut</div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            {presence?.currentStatus === 'Non pointé' && (
              <button
                onClick={handleClockIn}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <FaSignInAlt className="mr-2" />
                Pointer l'entrée
              </button>
            )}
            
            {presence?.currentStatus === 'En cours' && (
              <>
                <button
                  onClick={() => setShowDailyReport(true)}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <FaEdit className="mr-2" />
                  Rapport journalier
                </button>
                <button
                  onClick={handleClockOut}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  <FaSignOut className="mr-2" />
                  Pointer la sortie
                </button>
              </>
            )}
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <FaUser className="mr-2 text-coke-red" />
              Informations personnelles
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Nom complet</label>
                <p className="text-gray-800 font-semibold">{candidate.prenom} {candidate.nom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-800">{candidate.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Identifiant candidat</label>
                <p className="text-gray-800 font-mono bg-gray-100 px-2 py-1 rounded">{candidate.cdtid}</p>
              </div>
            </div>
          </div>

          {/* Stage Information */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <FaGraduationCap className="mr-2 text-coke-red" />
              Informations du stage
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Statut</label>
                <div className="mt-1">{getStatusBadge(candidate.statut)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Type de stage</label>
                <p className="text-gray-800">{candidate.typestage || "Non spécifié"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Durée</label>
                <p className="text-gray-800">{candidate.periode || "Non spécifiée"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        {candidate.statut === "Accepté" && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              🎉 Félicitations ! Votre candidature a été acceptée
            </h3>
            <p className="text-green-700 mb-4">
              Vous allez recevoir prochainement toutes les informations nécessaires pour commencer votre stage chez SBGS.
            </p>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Prochaines étapes :</h4>
              <ul className="text-gray-700 space-y-1">
                <li>• Vous recevrez un email avec les détails de votre intégration</li>
                <li>• Un membre de l'équipe RH vous contactera pour planifier votre arrivée</li>
                <li>• Préparez les documents nécessaires pour votre premier jour</li>
              </ul>
            </div>
          </div>
        )}

        {candidate.statut === "En attente" && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">
              ⏳ Votre candidature est en cours d'examen
            </h3>
            <p className="text-yellow-700">
              Notre équipe RH examine actuellement votre candidature. Vous recevrez une notification par email dès qu'une décision sera prise.
            </p>
          </div>
        )}

        {/* Contact Information */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Besoin d'aide ?</h3>
          <p className="text-gray-600 mb-4">
            Si vous avez des questions concernant votre candidature ou votre stage, n'hésitez pas à nous contacter :
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Email</h4>
              <p className="text-coke-red">stage@sbgs.ma</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Téléphone</h4>
              <p className="text-coke-red">+212 5 28 82 00 00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Report Modal */}
      {showDailyReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Rapport Journalier d'Activités
              </h3>
              <button
                onClick={() => setShowDailyReport(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description des tâches effectuées
                </label>
                <textarea
                  value={dailyReport.taches_effectuees}
                  onChange={(e) => setDailyReport(prev => ({ ...prev, taches_effectuees: e.target.value }))}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent"
                  placeholder="Décrivez les tâches que vous avez effectuées aujourd'hui..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description des documents utilisés
                </label>
                <textarea
                  value={dailyReport.documents_utilises}
                  onChange={(e) => setDailyReport(prev => ({ ...prev, documents_utilises: e.target.value }))}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent"
                  placeholder="Listez les documents que vous avez utilisés aujourd'hui..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => setShowDailyReport(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateDailyReport}
                  className="px-6 py-2 bg-coke-red text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 