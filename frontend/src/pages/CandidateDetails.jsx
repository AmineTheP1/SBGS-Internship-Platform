import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AiFillFilePdf } from "react-icons/ai";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

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
    fetchCandidate();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-xl">Chargement...</div>;
  if (!candidate) return <div className="text-center py-20 text-xl text-red-500">Candidat introuvable.</div>;

  // Helper to get piece jointe by type
  const getPieceUrl = (type) => {
    if (!candidate.pieces_jointes) return null;
    const piece = candidate.pieces_jointes.find(p => p.typepiece === type);
    return piece ? `http://localhost:3000${piece.url}` : null;
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
        // Optionally show a success message
        navigate(-1); // Go back to dashboard
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
      <div className="flex items-center gap-4 mt-8">
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
      </div>
    </div>
  );
}