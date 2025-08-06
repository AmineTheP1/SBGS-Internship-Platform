import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaGraduationCap, FaCalendar, FaFileAlt, FaSignOutAlt, FaClock, FaSignInAlt, FaSignOutAlt as FaSignOut, FaEdit, FaTimes, FaCertificate, FaHeart, FaCheckCircle } from "react-icons/fa";
import API_ENDPOINTS, { API_BASE_URL } from "../config/api.js";

export default function CandidateDashboard() {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [presence, setPresence] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [dailyReport, setDailyReport] = useState({
    taches_effectuees: '',
    documents_utilises: ''
  });
  const [reports, setReports] = useState([]);
  const [showReportUpload, setShowReportUpload] = useState(false);
  const [reportForm, setReportForm] = useState({
    reportTitle: '',
    reportDescription: '',
    reportFile: null
  });
  const [uploadStatus, setUploadStatus] = useState('');
  const [hasAttestation, setHasAttestation] = useState(false);
  const [attestationData, setAttestationData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.CANDIDATE_SESSION, { 
          credentials: "include" 
        });
        if (!res.ok) {
          navigate('/candidate-login', { replace: true });
          return;
        }
        const data = await res.json();
        setCandidate(data.candidate);
        
        // Fetch presence data
        const presenceRes = await fetch(API_ENDPOINTS.CANDIDATE_DAILY_REPORT, {
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

        // Fetch assignment information
        const assignmentRes = await fetch(API_ENDPOINTS.CANDIDATE_GET_ASSIGNMENT, {
          credentials: "include"
        });
        if (assignmentRes.ok) {
          const assignmentData = await assignmentRes.json();
          setAssignment(assignmentData.assignment);
        }

        // Fetch reports
        const reportsRes = await fetch(`${API_ENDPOINTS.CANDIDATE_GET_REPORTS}?cdtid=${data.candidate.cdtid}`, {
          credentials: "include"
        });
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setReports(reportsData.reports || []);
        }

        // Check if candidate has received attestation
        const attestationRes = await fetch(`${API_ENDPOINTS.CANDIDATE_CHECK_ATTESTATION}?cdtid=${data.candidate.cdtid}`, {
          credentials: "include"
        });
        if (attestationRes.ok) {
          const attestationData = await attestationRes.json();
          setHasAttestation(attestationData.hasAttestation);
          if (attestationData.hasAttestation) {
            setAttestationData(attestationData.attestation);
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
      await fetch(API_ENDPOINTS.CANDIDATE_LOGOUT, { 
        credentials: "include" 
      });
      navigate('/candidate-login');
    } catch {
      navigate('/candidate-login');
    }
  };

  const handleClockIn = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.CANDIDATE_CLOCK_IN, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        // Refresh presence data
        const presenceRes = await fetch(API_ENDPOINTS.CANDIDATE_DAILY_REPORT, {
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
    // Show confirmation dialog
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir pointer votre sortie ?\n\n" +
      "Cette action ne peut pas être annulée et marquera la fin de votre journée de travail."
    );
    
    if (!confirmed) {
      return; // User cancelled
    }
    
    try {
      const res = await fetch(API_ENDPOINTS.CANDIDATE_CLOCK_OUT, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        // Refresh presence data
        const presenceRes = await fetch(API_ENDPOINTS.CANDIDATE_DAILY_REPORT, {
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
      const res = await fetch(API_ENDPOINTS.CANDIDATE_UPDATE_DAILY_REPORT, {
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

  const handleReportUpload = async (e) => {
    e.preventDefault();
    console.log('Form data:', reportForm);
    console.log('Title:', reportForm.reportTitle);
    console.log('File:', reportForm.reportFile);
    if (!reportForm.reportTitle || !reportForm.reportFile) {
      setUploadStatus("Veuillez remplir tous les champs requis.");
      return;
    }

    const formData = new FormData();
    console.log('Sending candidate ID:', candidate.cdtid);
    formData.append('cdtid', candidate.cdtid);
    formData.append('reportTitle', reportForm.reportTitle);
    formData.append('reportDescription', reportForm.reportDescription);
    formData.append('report', reportForm.reportFile);

    try {
      setUploadStatus("Envoi en cours...");
      console.log('Environment VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('API URL being used:', API_ENDPOINTS.CANDIDATE_UPLOAD_REPORT);
      const res = await fetch(API_ENDPOINTS.CANDIDATE_UPLOAD_REPORT, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadStatus("Rapport soumis avec succès !");
        setReportForm({
          reportTitle: '',
          reportDescription: '',
          reportFile: null
        });
        setShowReportUpload(false);
        // Refresh reports
        const reportsRes = await fetch(`${API_ENDPOINTS.CANDIDATE_GET_REPORTS}?cdtid=${candidate.cdtid}`, {
          credentials: "include"
        });
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setReports(reportsData.reports || []);
        }
      } else {
        setUploadStatus(data.error);
      }
    } catch (error) {
      setUploadStatus("Erreur lors de l'envoi du rapport");
    }
  };

  const getReportStatusColor = (status) => {
    switch (status) {
      case "En attente": return "bg-yellow-100 text-yellow-800";
      case "Approuvé": return "bg-green-100 text-green-800";
      case "Rejeté": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
                src={`${API_BASE_URL}${candidate.imageurl}`}
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <div className="flex items-center mb-3">
                <FaFileAlt className="text-orange-600 mr-2" />
                <h3 className="font-semibold text-orange-800">Thème de stage</h3>
              </div>
              <p className="text-orange-700">{assignment?.theme_stage || "Non défini"}</p>
            </div>
          </div>
        </div>

        {/* Thankful Message for Candidates with Attestation */}
        {hasAttestation && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-8 mb-8 border-2 border-green-200">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <FaCertificate className="text-6xl text-green-600" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-green-800 mb-4">
                Félicitations ! 🎉
              </h2>
              
              <p className="text-xl text-green-700 mb-6">
                Votre attestation de stage a été générée avec succès !
              </p>
              
              <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rapport de stage</p>
                    <p className="font-semibold text-gray-800">{attestationData?.rapportTitre || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date de génération</p>
                    <p className="font-semibold text-gray-800">
                      {attestationData?.dateGenerated ? new Date(attestationData.dateGenerated).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Période de stage</p>
                    <p className="font-semibold text-gray-800">
                      {attestationData?.dateDebut && attestationData?.dateFin 
                        ? `Du ${new Date(attestationData.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(attestationData.dateFin).toLocaleDateString('fr-FR')}`
                        : 'Non spécifiée'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Statut</p>
                    <div className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      <span className="font-semibold text-green-600">Attestation disponible</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-100 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-3">
                  <FaHeart className="text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-green-800">Message de remerciement</h3>
                </div>
                <p className="text-green-700 leading-relaxed">
                  Nous tenons à vous remercier pour votre excellent travail et votre dévouement tout au long de votre stage chez SBGS. 
                  Votre contribution a été précieuse et nous vous souhaitons le plus grand succès dans vos futures entreprises professionnelles.
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-green-600 mb-2">
                  Votre attestation peut être récupérée auprès du service RH.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Regular Internship Tracking Sections - Only show if no attestation */}
        {!hasAttestation && (
          <>
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


        {/* Reports Section */}
        {candidate.statut === "Accepté" && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <FaFileAlt className="mr-2 text-coke-red" />
                Rapports de stage
              </h3>
              <button
                onClick={() => setShowReportUpload(true)}
                className="bg-coke-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Soumettre un rapport
              </button>
            </div>

            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.rapportid} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                                             <div className="flex-1">
                         <h4 className="font-semibold text-gray-800">{report.titre}</h4>
                         {report.description && (
                          <p className="text-sm text-gray-700 mb-2">{report.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Soumis le {new Date(report.date_soumission).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReportStatusColor(report.statut)}`}>
                          {report.statut}
                        </span>
                        {report.commentaires_superviseur && report.commentaires_superviseur.trim() && (
                          <div className="text-xs text-gray-600 max-w-xs">
                            <strong>Commentaire :</strong> {report.commentaires_superviseur}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Aucun rapport soumis pour le moment.
              </p>
            )}
          </div>
        )}


          </>
        )}

        {/* Contact Information - Always show */}
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

      {/* Report Upload Modal */}
      {showReportUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Soumettre un rapport de stage
              </h3>
              <button
                onClick={() => setShowReportUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleReportUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du rapport *
                </label>
                <input
                  type="text"
                  value={reportForm.reportTitle}
                  onChange={(e) => setReportForm({...reportForm, reportTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red"
                  placeholder="Ex: Analyse des processus de production"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={reportForm.reportDescription}
                  onChange={(e) => setReportForm({...reportForm, reportDescription: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red"
                  rows="3"
                  placeholder="Description détaillée du rapport..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier du rapport *
                </label>
                <input
                  type="file"
                  onChange={(e) => setReportForm({...reportForm, reportFile: e.target.files[0]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red"
                  accept=".pdf,.doc,.docx"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formats acceptés : PDF, DOC, DOCX (max 10MB)
                </p>
              </div>

              {uploadStatus && (
                <div className={`p-3 rounded-lg ${
                  uploadStatus.includes('succès') 
                    ? 'bg-green-100 text-green-700' 
                    : uploadStatus.includes('Erreur') 
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {uploadStatus}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReportUpload(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-coke-red text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Soumettre le rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 