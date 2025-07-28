import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AiFillFilePdf } from "react-icons/ai";
import { FaCheck, FaTimes, FaUserPlus, FaCalendar } from "react-icons/fa";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supervisors, setSupervisors] = useState([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState("");
  const [showDateModal, setShowDateModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [dateStatus, setDateStatus] = useState("");
  const [assignedSupervisor, setAssignedSupervisor] = useState("");
  const [dateSetCompleted, setDateSetCompleted] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/hr/get-applications?dsgid=${id}`);
        const data = await res.json();
        if (data.success && data.applications.length > 0) {
          setCandidate(data.applications[0]);
        }
      } catch (err) {
        // handle error
      }
      setLoading(false);
    };

    const fetchSupervisors = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/hr/get-supervisors", {
          credentials: "include"
        });
        const data = await response.json();
        if (data.success) {
          setSupervisors(data.supervisors);
        }
      } catch (err) {
        console.error("Error fetching supervisors:", err);
      }
    };

    fetchCandidate();
    fetchSupervisors();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-xl">Chargement...</div>;
  if (!candidate) return <div className="text-center py-20 text-xl text-red-500">Candidat introuvable.</div>;

  // Helper to get piece jointe by type
  const getPieceUrl = (type) => {
    if (!candidate.pieces_jointes) return null;
    const piece = candidate.pieces_jointes.find(p => p.typepiece === type);
    return piece ? `http://localhost:3000/api/files${piece.url.replace('/uploads', '')}` : null;
  };

  // Helper to render file preview
  const renderFilePreview = (url, label) => {
    if (!url) return <span className="text-gray-400">Non fournie</span>;
    const ext = url.split('.').pop().toLowerCase();
    const isPdf = ext === "pdf";
    const isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext);

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-4 p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white hover:bg-gray-50 mb-3"
        style={{ maxWidth: 350 }}
      >
        {isPdf ? (
          <AiFillFilePdf className="h-10 w-10 text-red-500 flex-shrink-0" />
        ) : isImage ? (
          <img src={url} alt={label} className="h-10 w-10 object-cover rounded border flex-shrink-0" />
        ) : (
          <svg className="h-10 w-10 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <rect x="4" y="2" width="16" height="20" rx="2" fill="#fff" stroke="#9ca3af" strokeWidth="2"/>
          </svg>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-800 truncate">{label}</div>
          <div className="text-xs text-gray-500 group-hover:text-blue-600 transition"></div>
        </div>
        <svg className="h-5 w-5 text-blue-500 opacity-0 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24">
          <path d="M15 12H9m6 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>
    );
  };

  // Robustly parse domaines_interet
  let areasOfInterest = [];
  try {
    let raw = candidate.domaines_interet;
    while (typeof raw === 'string') {
      raw = JSON.parse(raw);
    }
    // If it's an array with a single string that looks like a JSON array, parse that too
    if (Array.isArray(raw) && raw.length === 1 && typeof raw[0] === 'string' && raw[0].trim().startsWith('[')) {
      raw = JSON.parse(raw[0]);
    }
    if (Array.isArray(raw)) {
      areasOfInterest = raw;
    }
  } catch {
    areasOfInterest = [];
  }

  const yearMap = {
    "1st Year": "1ère année",
    "2nd Year": "2ème année",
    "3rd Year": "3ème année",
    "4th Year": "4ème année",
    "5th Year": "5ème année",
    "Graduate": "Diplômé"
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const res = await fetch("http://localhost:3000/api/hr/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dsgid: candidate.dsgid, status: newStatus }),
      });
      if (res.ok) {
        // Update the local candidate status
        setCandidate(prev => ({ ...prev, status: newStatus }));
        
        // Only navigate back if rejecting
        if (newStatus === "Rejeté") {
          navigate(-1); // Go back to dashboard
        }
        // If accepting, stay on the page to show the assignment button
      } else {
        alert("Erreur lors de la mise à jour du statut");
      }
    } catch {
      alert("Erreur réseau");
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

  // Helper to download all attachments as zip
  const handleAssignToSupervisor = async () => {
    if (!selectedSupervisor || !candidate) {
      setAssignmentStatus("Veuillez sélectionner un responsable de stage");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/hr/assign-intern", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          cdtid: candidate.cdtid,
          resid: selectedSupervisor
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAssignmentStatus("Stagiaire assigné avec succès!");
        setShowAssignmentModal(false);
        setSelectedSupervisor("");
        setAssignedSupervisor(selectedSupervisor);
        
        // Check if both actions are completed
        if (dateSetCompleted) {
          // Both actions completed, navigate back
          setTimeout(() => {
            setAssignmentStatus("");
            navigate(-1); // Go back to dashboard
          }, 1500);
        } else {
          // Only assignment completed, stay on page
          setTimeout(() => {
            setAssignmentStatus("");
          }, 1500);
        }
      } else {
        setAssignmentStatus(data.error || "Erreur lors de l'assignation");
      }
    } catch (error) {
      setAssignmentStatus("Erreur réseau lors de l'assignation");
    }
  };

  const handleSetStartDate = async () => {
    if (!startDate) {
      setDateStatus("Veuillez sélectionner une date de début");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/hr/set-start-date", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          dsgid: candidate.dsgid,
          startDate: startDate
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDateStatus("Date de début définie avec succès!");
        setShowDateModal(false);
        setStartDate("");
        setDateSetCompleted(true);
        
        // Check if both actions are completed
        if (assignedSupervisor) {
          // Both actions completed, navigate back
          setTimeout(() => {
            setDateStatus("");
            navigate(-1); // Go back to dashboard
          }, 1500);
        } else {
          // Only date setting completed, stay on page
          setTimeout(() => {
            setDateStatus("");
          }, 1500);
        }
      } else {
        setDateStatus(data.error || "Erreur lors de la définition de la date");
      }
    } catch (error) {
      setDateStatus("Erreur réseau lors de la définition de la date");
    }
  };

  const handleDownloadAll = async () => {
    if (!candidate || !candidate.pieces_jointes || candidate.pieces_jointes.length === 0) {
      alert("Aucune pièce jointe à télécharger.");
      return;
    }
    const zip = new JSZip();
    const folderName = `${candidate.prenom}_${candidate.nom}`.replace(/\s+/g, "_");
    const folder = zip.folder(folderName);

    // Fetch all files first
    const files = await Promise.all(
      candidate.pieces_jointes.map(async (piece) => {
        const url = `http://localhost:3000/api/files${piece.url.replace('/uploads', '')}`;
        const ext = url.split('.').pop().toLowerCase();
        let filename = piece.typepiece.replace(/\s+/g, "_");
        if (!filename.toLowerCase().endsWith(ext)) filename += `.${ext}`;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Erreur de téléchargement");
          const blob = await res.blob();
          return { filename, blob };
        } catch (e) {
          console.error(`Erreur lors du téléchargement de ${filename}:`, e);
          return null;
        }
      })
    );

    // Add files to zip
    files.forEach(file => {
      if (file) {
        folder.file(file.filename, file.blob);
      }
    });

    // Only generate zip if there are files
    if (files.filter(f => f).length === 0) {
      alert("Aucun fichier n'a pu être téléchargé.");
      return;
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${folderName}.zip`);
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold text-sm transition-colors"
      >
        Retour
      </button>
      <h2 className="text-2xl font-bold mb-4 text-coke-red">Détails du Candidat</h2>
      <div className="flex flex-col items-center mb-6">
        {candidate.imageurl && (
          <img
            src={`http://localhost:3000${candidate.imageurl}`}
            alt="Photo"
            className="h-24 w-24 rounded-full object-cover border mb-2"
          />
        )}
        <div className="text-xl font-semibold">{candidate.prenom} {candidate.nom}</div>
        <div className="text-gray-600">{candidate.email}</div>
        <div className="text-gray-600">{candidate.telephone}</div>
      </div>
      <div className="mb-4"><b>Institution:</b> {candidate.universityname}</div>
      <div className="mb-4"><b>Type de stage:</b> {candidate.typestage || "Non spécifié"}</div>
      <div className="mb-4"><b>Domaine d'Étude/Spécialisation:</b> {candidate.domaine || "Non spécifié"}</div>
      <div className="mb-4"><b>Année d'étude:</b> {yearMap[candidate.currentyear] || candidate.currentyear}</div>
              <div className="mb-4"><b>Durée du stage:</b> {candidate.periode}</div>
        <div className="mb-4"><b>Mois de début souhaité:</b> {candidate.mois_debut}</div>
      <div className="mb-4">
        <b>Domaines d'intérêt:</b> {areasOfInterest && areasOfInterest.length > 0
          ? areasOfInterest.join(", ")
          : "Aucun"}
      </div>
      <div className="mb-4"><b>Demande de stage:</b>
        <div className="bg-gray-50 p-3 rounded-lg text-sm mt-1">{candidate.demande_stage || "Aucune"}</div>
      </div>
      <div className="mb-4">
        <b>CV:</b>
        {getPieceUrl("CV") ? renderFilePreview(getPieceUrl("CV"), "CV.pdf") : <span className="ml-2 text-gray-400">Non fourni</span>}
      </div>
      <div className="mb-4">
        <b>Carte Nationale:</b>
        {getPieceUrl("Carte Nationale") ? renderFilePreview(getPieceUrl("Carte Nationale"), "Carte_Nationale.pdf") : <span className="ml-2 text-gray-400">Non fournie</span>}
      </div>
      <div className="mb-4">
        <b>Convention de Stage:</b>
        {getPieceUrl("Convention de Stage") ? renderFilePreview(getPieceUrl("Convention de Stage"), "Convention.pdf") : <span className="ml-2 text-gray-400">Non fournie</span>}
      </div>
      <div className="mb-4">
        <b>Assurance:</b>
        {getPieceUrl("Assurance") ? renderFilePreview(getPieceUrl("Assurance"), "Assurance.pdf") : <span className="ml-2 text-gray-400">Non fournie</span>}
      </div>
      {/* Download All Attachments Button - moved here */}
      <button
        onClick={handleDownloadAll}
        className="mb-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm transition-colors"
      >
        Télécharger toutes les pièces jointes
      </button>
      <div className="flex items-center gap-4 mt-4">
        <span className="font-bold">Statut:</span>
        {getStatusBadge(candidate.status)}
      </div>
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={() => handleStatusUpdate("Accepté")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow font-semibold text-sm transition"
        >
          <FaCheck className="h-4 w-4" /> Accepter
        </button>
        <button
          onClick={() => handleStatusUpdate("Rejeté")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow font-semibold text-sm transition"
        >
          <FaTimes className="h-4 w-4" /> Rejeter
        </button>
        {candidate.status === "Accepté" && supervisors.length > 0 && (
          <button
            onClick={() => setShowAssignmentModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow font-semibold text-sm transition ${
              assignedSupervisor 
                ? "bg-green-600 text-white hover:bg-green-700" 
                : "bg-coke-red text-white hover:bg-red-700"
            }`}
          >
            <FaUserPlus className="h-4 w-4" /> 
            {assignedSupervisor ? "Responsable assigné ✓" : "Assigner à un Responsable"}
          </button>
        )}
        {candidate.status === "Accepté" && (
          <button
            onClick={() => setShowDateModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow font-semibold text-sm transition ${
              dateSetCompleted 
                ? "bg-green-600 text-white hover:bg-green-700" 
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <FaCalendar className="h-4 w-4" /> 
            {dateSetCompleted ? "Date définie ✓" : "Définir la date de début"}
          </button>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button 
              onClick={() => {
                setShowAssignmentModal(false);
                setSelectedSupervisor("");
                setAssignmentStatus("");
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-coke-red text-2xl"
            >
              &times;
            </button>
            <h3 className="font-bold text-2xl mb-4" style={{ color: '#F40009' }}>
              Assigner à un Responsable de Stage
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsable de Stage
                </label>
                <select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent"
                >
                  <option value="">Sélectionner un responsable</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.resid} value={supervisor.resid}>
                      {supervisor.prenom} {supervisor.nom} - {supervisor.service}
                    </option>
                  ))}
                </select>
              </div>
              
              {assignmentStatus && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                  assignmentStatus.includes("succès") 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {assignmentStatus}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedSupervisor("");
                    setAssignmentStatus("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAssignToSupervisor}
                  className="flex-1 px-4 py-2 bg-coke-red text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Assigner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Selection Modal */}
      {showDateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button 
              onClick={() => {
                setShowDateModal(false);
                setStartDate("");
                setDateStatus("");
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-coke-red text-2xl"
            >
              &times;
            </button>
            <h3 className="font-bold text-2xl mb-4" style={{ color: '#F40009' }}>
              Définir la date de début
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              {dateStatus && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                  dateStatus.includes("succès") 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {dateStatus}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowDateModal(false);
                    setStartDate("");
                    setDateStatus("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSetStartDate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}