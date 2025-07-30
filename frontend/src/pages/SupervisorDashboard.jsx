import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserTie, FaUsers, FaClock, FaFileAlt, FaCalendar, FaSignOutAlt, FaEye, FaPlus } from "react-icons/fa";
import API_ENDPOINTS, { API_BASE_URL } from "../config/api.js";

export default function SupervisorDashboard() {
  const [supervisor, setSupervisor] = useState(null);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [showInternDetails, setShowInternDetails] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [absenceReason, setAbsenceReason] = useState("");
  const [absenceStatus, setAbsenceStatus] = useState("");
  const [monthlyAbsences, setMonthlyAbsences] = useState(0);
  const [absenceType, setAbsenceType] = useState("justified"); // "justified" or "unjustified"
  const [confirmationStatus, setConfirmationStatus] = useState("");
  const [pendingConfirmations, setPendingConfirmations] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.SUPERVISOR_SESSION, { 
          credentials: "include" 
        });
        if (!res.ok) {
          navigate('/supervisor-login', { replace: true });
          return;
        }
        const data = await res.json();
        setSupervisor(data.supervisor);
        
        // Fetch assigned interns
        const internsRes = await fetch(API_ENDPOINTS.SUPERVISOR_ASSIGNED_INTERNS, {
          credentials: "include"
        });
        if (internsRes.ok) {
          const internsData = await internsRes.json();
          setInterns(internsData.interns || []);
        } else {
          console.error("Failed to fetch assigned interns:", internsRes.status);
          setInterns([]);
        }

        // Fetch monthly absences
        const absencesRes = await fetch(API_ENDPOINTS.SUPERVISOR_MONTHLY_ABSENCES, {
          credentials: "include"
        });
        if (absencesRes.ok) {
          const absencesData = await absencesRes.json();
          setMonthlyAbsences(absencesData.count || 0);
        }

        setPendingConfirmations(0); // We'll calculate this later when needed
      } catch {
        navigate('/supervisor-login', { replace: true });
      }
      setLoading(false);
    };
    checkSession();
  }, [navigate]);



  const handleViewInternDetails = async (cdtid) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.SUPERVISOR_INTERN_DETAILS}?cdtid=${cdtid}`, {
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

  const handleMarkAbsence = (cdtid) => {
    setSelectedIntern(prev => ({ ...prev, intern: { ...prev.intern, cdtid } }));
    setShowAbsenceModal(true);
    setAbsenceReason("");
    setAbsenceStatus("");
    setAbsenceType("justified"); // Default to justified
  };

  const handleSubmitAbsence = async () => {
    if (absenceType === "justified" && !absenceReason.trim()) {
      setAbsenceStatus("Veuillez spécifier un motif d'absence");
      return;
    }

    try {
      const endpoint = absenceType === "justified" 
        ? API_ENDPOINTS.SUPERVISOR_MARK_ABSENCE
        : API_ENDPOINTS.SUPERVISOR_MARK_UNJUSTIFIED_ABSENCE;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          cdtid: selectedIntern.intern.cdtid,
          motif: absenceReason,
          date_absence: new Date().toISOString().split('T')[0] // Today's date
        }),
      });

      const data = await response.json();
      if (data.success) {
        const message = absenceType === "justified" 
          ? "Absence justifiée marquée avec succès!"
          : "Absence non justifiée marquée avec succès!";
        
        setAbsenceStatus(message);
        setShowAbsenceModal(false);
        setAbsenceReason("");
        
        // Refresh intern details
        handleViewInternDetails(selectedIntern.intern.cdtid);
        
        // Refresh monthly absences count
        const absencesRes = await fetch(API_ENDPOINTS.SUPERVISOR_MONTHLY_ABSENCES, {
          credentials: "include"
        });
        if (absencesRes.ok) {
          const absencesData = await absencesRes.json();
          setMonthlyAbsences(absencesData.count || 0);
        }
        
        setTimeout(() => setAbsenceStatus(""), 3000);
      } else {
        setAbsenceStatus(data.error || "Erreur lors du marquage de l'absence");
      }
    } catch (error) {
      setAbsenceStatus("Erreur réseau lors du marquage de l'absence");
    }
  };

  const handleConfirmPresence = async (cdtid, date, confirmed) => {
    try {
      const response = await fetch(API_ENDPOINTS.SUPERVISOR_CONFIRM_PRESENCE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          cdtid: cdtid,
          date: date,
          confirmed: confirmed
        }),
      });

      const data = await response.json();
      if (data.success) {
        setConfirmationStatus(data.message);
        
        // Refresh intern details
        handleViewInternDetails(cdtid);
        
        // Simple refresh of intern details
        handleViewInternDetails(cdtid);
        
        setTimeout(() => setConfirmationStatus(""), 3000);
      } else {
        setConfirmationStatus(data.error || "Erreur lors de la confirmation");
      }
    } catch (error) {
      setConfirmationStatus("Erreur réseau lors de la confirmation");
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
        <div className="grid md:grid-cols-5 gap-6 mb-8">
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
                   {interns.filter(intern => intern.today_attendance === true).length}
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
                <p className="text-2xl font-bold text-gray-800">{monthlyAbsences}</p>
              </div>
            </div>
          </div>

                     <div className="bg-white rounded-xl shadow-lg p-6">
             <div className="flex items-center">
               <div className="bg-orange-100 p-3 rounded-lg">
                 <FaClock className="text-2xl text-orange-600" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600">Confirmations en attente</p>
                 <p className="text-2xl font-bold text-gray-800">
                   {interns.filter(intern => intern.pending_confirmations > 0).reduce((sum, intern) => sum + intern.pending_confirmations, 0)}
                 </p>
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
                        src={`${API_BASE_URL}${intern.imageurl}`}
                        alt={`${intern.prenom} ${intern.nom}`}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 rounded-full bg-coke-red flex items-center justify-center mr-4 ${intern.imageurl ? 'hidden' : ''}`}>
                      <FaUsers className="text-white" />
                    </div>
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
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Journal d'activité - {selectedIntern.intern.prenom} {selectedIntern.intern.nom}
              </h3>
              <button
                onClick={() => setShowInternDetails(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Intern Info Header */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p className="text-gray-800">{selectedIntern.intern.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Statut:</span>
                  <p className="text-gray-800">{selectedIntern.intern.statut_candidature}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Type de stage:</span>
                  <p className="text-gray-800">{selectedIntern.intern.typestage || 'Non spécifié'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Durée:</span>
                  <p className="text-gray-800">{selectedIntern.intern.periode || 'Non spécifiée'}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => handleMarkAbsence(selectedIntern.intern.cdtid)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FaCalendar className="text-sm" />
                Marquer une absence
              </button>
            </div>

            {/* Status Messages */}
            {confirmationStatus && (
              <div className={`p-3 rounded-lg text-sm font-medium mb-4 ${
                confirmationStatus.includes("succès") 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {confirmationStatus}
              </div>
            )}

            {/* Daily Logs */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Journal quotidien des activités
              </h4>
              
              {selectedIntern.attendance.length === 0 && selectedIntern.dailyReports.length === 0 && selectedIntern.absences.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaCalendar className="text-4xl mx-auto mb-4 text-gray-300" />
                  <p>Aucune activité enregistrée pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Combine attendance and daily reports by date */}
                  {(() => {
                    const allActivities = [];
                    
                    // Add attendance records
                    selectedIntern.attendance.forEach(att => {
                      allActivities.push({
                        date: att.date,
                        type: 'attendance',
                        data: att
                      });
                    });
                    
                    // Add daily reports
                    selectedIntern.dailyReports.forEach(report => {
                      allActivities.push({
                        date: report.date,
                        type: 'report',
                        data: report
                      });
                    });
                    
                    // Add absences
                    selectedIntern.absences.forEach(absence => {
                      allActivities.push({
                        date: absence.date_absence,
                        type: 'absence',
                        data: absence
                      });
                    });
                    
                    // Sort by date (newest first)
                    allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
                    
                    // Group by date
                    const groupedActivities = {};
                    allActivities.forEach(activity => {
                      const dateKey = activity.date;
                      if (!groupedActivities[dateKey]) {
                        groupedActivities[dateKey] = [];
                      }
                      groupedActivities[dateKey].push(activity);
                    });
                    
                    return Object.entries(groupedActivities).map(([date, activities]) => (
                      <div key={date} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-semibold text-gray-800">
                            {new Date(date).toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </h5>
                          <div className="flex gap-2">
                            {activities.some(a => a.type === 'attendance') && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                Présent
                              </span>
                            )}
                            {activities.some(a => a.type === 'absence') && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                Absent
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Attendance Info */}
                          {activities.find(a => a.type === 'attendance') && (() => {
                            const att = activities.find(a => a.type === 'attendance').data;
                            return (
                              <div className="bg-white rounded p-3 border-l-4 border-green-500">
                                <div className="flex justify-between items-start mb-2">
                                  <h6 className="font-medium text-gray-800">Pointage</h6>
                                  <div className="flex items-center gap-2">
                                    {att.confirme_par_superviseur === true && (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                        ✓ Confirmé
                                      </span>
                                    )}
                                    {att.confirme_par_superviseur === false && (
                                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                        ✗ Non confirmé
                                      </span>
                                    )}
                                    {att.confirme_par_superviseur === null && (
                                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                        ⏳ En attente
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                  <div>
                                    <span className="text-gray-600">Entrée:</span>
                                    <span className="ml-2 font-medium">
                                      {att.heure_entree ? (() => {
                                        try {
                                          // If it's already a time string, remove seconds
                                          if (typeof att.heure_entree === 'string' && att.heure_entree.includes(':')) {
                                            return att.heure_entree.split(':').slice(0, 2).join(':');
                                          }
                                          // If it's a date object, format it without seconds
                                          return new Date(att.heure_entree).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                        } catch (error) {
                                          return att.heure_entree || 'Non pointé';
                                        }
                                      })() : 'Non pointé'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Sortie:</span>
                                    <span className="ml-2 font-medium">
                                      {att.heure_sortie ? (() => {
                                        try {
                                          // If it's already a time string, remove seconds
                                          if (typeof att.heure_sortie === 'string' && att.heure_sortie.includes(':')) {
                                            return att.heure_sortie.split(':').slice(0, 2).join(':');
                                          }
                                          // If it's a date object, format it without seconds
                                          return new Date(att.heure_sortie).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                        } catch (error) {
                                          return att.heure_sortie || 'Non pointé';
                                        }
                                      })() : 'Non pointé'}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Confirmation buttons */}
                                {att.confirme_par_superviseur === null && (
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={() => handleConfirmPresence(selectedIntern.intern.cdtid, new Date().toISOString().split('T')[0], true)}
                                      className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                                    >
                                      Confirmer présence
                                    </button>
                                    <button
                                      onClick={() => handleConfirmPresence(selectedIntern.intern.cdtid, new Date().toISOString().split('T')[0], false)}
                                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                                    >
                                      Non présent
                                    </button>
                                  </div>
                                )}
                                
                                {/* Show confirmation date if confirmed */}
                                {att.confirme_par_superviseur !== null && att.date_confirmation && (
                                  <div className="text-xs text-gray-500 mt-2">
                                    Confirmé le: {new Date(att.date_confirmation).toLocaleDateString('fr-FR')} à {new Date(att.date_confirmation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          
                          {/* Daily Report */}
                          {activities.find(a => a.type === 'report') && (() => {
                            const report = activities.find(a => a.type === 'report').data;
                            return (
                              <div className="bg-white rounded p-3 border-l-4 border-blue-500">
                                <h6 className="font-medium text-gray-800 mb-2">Rapport journalier</h6>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-gray-600 font-medium">Tâches effectuées:</span>
                                    <p className="text-gray-800 mt-1">{report.taches_effectuees || 'Aucune tâche spécifiée'}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 font-medium">Documents utilisés:</span>
                                    <p className="text-gray-800 mt-1">{report.documents_utilises || 'Aucun document spécifié'}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                          
                          {/* Absence */}
                          {activities.find(a => a.type === 'absence') && (() => {
                            const absence = activities.find(a => a.type === 'absence').data;
                            return (
                              <div className="bg-white rounded p-3 border-l-4 border-red-500">
                                <h6 className="font-medium text-gray-800 mb-2">
                                  Absence {absence.justifiee ? '(Justifiée)' : '(Non justifiée)'}
                                </h6>
                                <div className="text-sm space-y-1">
                                  <div>
                                    <span className="text-gray-600">Motif:</span>
                                    <span className="ml-2 text-gray-800">{absence.motif || 'Non spécifié'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Statut:</span>
                                    <span className={`ml-2 font-medium ${
                                      absence.justifiee ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {absence.justifiee ? 'Justifiée' : 'Non justifiée'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
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

      {/* Absence Modal */}
      {showAbsenceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Marquer une absence
              </h3>
              <button
                onClick={() => {
                  setShowAbsenceModal(false);
                  setAbsenceReason("");
                  setAbsenceStatus("");
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'absence
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="absenceType"
                      value="justified"
                      checked={absenceType === "justified"}
                      onChange={(e) => setAbsenceType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Justifiée</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="absenceType"
                      value="unjustified"
                      checked={absenceType === "unjustified"}
                      onChange={(e) => setAbsenceType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Non justifiée</span>
                  </label>
                </div>
              </div>

              {absenceType === "justified" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif de l'absence *
                  </label>
                  <textarea
                    value={absenceReason}
                    onChange={(e) => setAbsenceReason(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent"
                    rows="3"
                    placeholder="Ex: Maladie, rendez-vous médical, urgence familiale..."
                  />
                </div>
              )}
              
              {absenceStatus && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                  absenceStatus.includes("succès") 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {absenceStatus}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAbsenceModal(false);
                    setAbsenceReason("");
                    setAbsenceStatus("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                {absenceType === "justified" ? (
                  <button
                    onClick={handleSubmitAbsence}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Marquer (Justifiée)
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitAbsence}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Marquer (Non justifiée)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 