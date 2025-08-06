import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentTextIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import API_ENDPOINTS, { API_BASE_URL } from "../config/api.js";
import AnnouncementForm from "./AnnouncementForm";


export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPerPage] = useState(10);
  
  // Additional filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterUniversity, setFilterUniversity] = useState("all");
  const [filterInternshipType, setFilterInternshipType] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState("");
  const [approvedCandidates, setApprovedCandidates] = useState([]);
  const [showApprovedCandidates, setShowApprovedCandidates] = useState(false);
  const [selectedAttestation, setSelectedAttestation] = useState(null);
  const [attestationStatus, setAttestationStatus] = useState("");
  
  // New state variable for tracking the current view
  const [currentView, setCurrentView] = useState("initial");
  
  // Function to safely set the current view
  const setViewSafely = (view) => {
    // If trying to view reports but there are none, stay on current view
    if (view === "reports" && approvedCandidates.length === 0) {
      return;
    }
    setCurrentView(view);
  };
  
  const navigate = useNavigate();

  // Scroll to top on mount and when filters/search/page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [search, filterStatus, dateFrom, dateTo, filterUniversity, filterInternshipType, filterYear, currentPage, applications]);

  // Calculate statistics from applications state
  const totalSubmissions = applications.length;
  const pendingReview = applications.filter(app => app.status === "En attente" || app.status === "Under Review").length;
  const approved = applications.filter(app => app.status === "Accepté").length;
  const rejected = applications.filter(app => app.status === "Rejeté").length;


  // Helper function to safely parse JSON strings
  const parseJsonString = (value) => {
    if (!value) return value;
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [search, filterStatus, dateFrom, dateTo, filterUniversity, filterInternshipType, filterYear, currentPage, applications]);

  useEffect(() => {
    // Check if user is logged in via session API
    const checkSession = async () => {
      try {
        console.log("Checking HR session...");
        const res = await fetch(API_ENDPOINTS.HR_SESSION, { credentials: "include" });
        console.log("HR session response:", res.status);
        if (!res.ok) {
          console.log("HR session failed, redirecting to login");
          navigate('/hr-login', { replace: true });
          return;
        }
        console.log("HR session successful");
      } catch (error) {
        console.error("HR session error:", error);
        navigate('/hr-login', { replace: true });
        return;
      }
    };
    checkSession();
    
    // Fetch universities for the filter dropdown
    const fetchUniversities = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.HR_GET_UNIVERSITIES);
        const data = await response.json();
        if (data.success) {
          setUniversities(data.universities);
        }
      } catch (err) {
        console.error("Error fetching universities:", err);
      }
    };

    // Fetch supervisors for assignment
    const fetchSupervisors = async () => {
      try {
        console.log("Fetching supervisors...");
        const response = await fetch(API_ENDPOINTS.HR_GET_SUPERVISORS, {
          credentials: "include"
        });
        const data = await response.json();
        console.log("Supervisors response:", data);
        if (data.success) {
          setSupervisors(data.supervisors);
          console.log("Supervisors loaded:", data.supervisors.length);
        } else {
          console.error("Failed to load supervisors:", data.error);
        }
      } catch (err) {
        console.error("Error fetching supervisors:", err);
      }
    };
    
    // Fetch real applications from backend
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_ENDPOINTS.HR_APPLICATIONS);
        const data = await res.json();
        console.log("Dashboard received data:", data); // Debug
        if (data.success) {
          // Debug: Log the raw areas of interest data
          data.applications.forEach((app, index) => {
            console.log(`App ${index + 1} areas of interest:`, {
              raw: app.domaines_interet,
              type: typeof app.domaines_interet,
              isArray: Array.isArray(app.domaines_interet),
              parsed: (() => {
                try {
                  if (typeof app.domaines_interet === 'string') {
                    return JSON.parse(app.domaines_interet);
                  } else if (Array.isArray(app.domaines_interet)) {
                    return app.domaines_interet;
                  }
                  return null;
                } catch (error) {
                  return `Error: ${error.message}`;
                }
              })()
            });
          });
          
          const processedApplications = data.applications.map(app => {
            // Parse areas of interest properly
            let areasOfInterest = [];
            if (app.domaines_interet) {
              try {
                console.log(`Parsing areas for app ${app.dsgid}:`, {
                  original: app.domaines_interet,
                  type: typeof app.domaines_interet,
                  isArray: Array.isArray(app.domaines_interet)
                });
                
                if (typeof app.domaines_interet === 'string') {
                  areasOfInterest = JSON.parse(app.domaines_interet);
                } else if (Array.isArray(app.domaines_interet)) {
                  // Handle case where it's an array containing a JSON string
                  if (app.domaines_interet.length === 1 && typeof app.domaines_interet[0] === 'string') {
                    areasOfInterest = JSON.parse(app.domaines_interet[0]);
                  } else {
                    areasOfInterest = app.domaines_interet;
                  }
                }
                
                console.log(`Parsed areas for app ${app.dsgid}:`, areasOfInterest);
              } catch (error) {
                console.error("Error parsing areas of interest:", error);
                areasOfInterest = [];
              }
            }
            
            return {
              id: app.dsgid,
              nom: parseJsonString(app.nom) || "",
              prenom: parseJsonString(app.prenom) || "",
              fullName: `${parseJsonString(app.prenom) || ''} ${parseJsonString(app.nom) || ''}`.trim() || "Nom non disponible",
              institution: parseJsonString(app.universityname) || "Non spécifié",
              fieldOfStudy: parseJsonString(app.fieldofstudy) || "Non spécifié",
              email: parseJsonString(app.email) || "Email non disponible",
              phone: parseJsonString(app.telephone) || "",
              areasOfInterest: areasOfInterest,
              demandeStage: parseJsonString(app.demande_stage) || "",
              currentYear: parseJsonString(app.currentyear) || "",
              date: app.datesoumission ? new Date(app.datesoumission).toLocaleDateString('fr-FR') : "",
              status: app.status || "En attente",
              cvUrl: app.cvurl,
              imageurl: app.imageurl, // Add imageurl to the application object
              periode: app.periode || "",
              typestage: parseJsonString(app.typestage) || "Non spécifié", // Add typestage
              fieldofstudy: parseJsonString(app.fieldofstudy) || "Non spécifié", // Add fieldofstudy
              domaine: parseJsonString(app.domaine) || "Non spécifié" // Add domaine
            };
          });
          console.log("Processed applications:", processedApplications); // Debug
          setApplications(processedApplications);
        }
      } catch (err) {
        console.error("Error fetching applications:", err); // Debug
      }
      setLoading(false);
    };
    
    // Fetch approved candidates
    const fetchApprovedCandidates = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.HR_GET_APPROVED_CANDIDATES, {
          credentials: "include"
        });
        const data = await response.json();
        
        if (data.success) {
          setApprovedCandidates(data.candidates || []);
        }
      } catch (error) {
        console.error("Error fetching approved candidates:", error);
      }
    };

    fetchUniversities();
    fetchSupervisors();
    fetchApplications();
    fetchApprovedCandidates();
  }, [navigate]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, dateFrom, dateTo, filterUniversity, filterInternshipType, filterYear]);

  const filteredApplications = applications.filter(app => {
    // Search filter
    const matchesSearch = 
      app.fullName.toLowerCase().includes(search.toLowerCase()) ||
      app.institution.toLowerCase().includes(search.toLowerCase()) ||
      app.fieldOfStudy.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase());
    
    // View-based filtering
    let matchesView = true;
    if (currentView === "pending") {
      matchesView = app.status === "En attente" || app.status === "Under Review";
    } else if (currentView === "approved") {
      matchesView = app.status === "Accepté";
    } else if (currentView === "rejected") {
      matchesView = app.status === "Rejeté";
    }
    
    // Date range filter
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const appDate = new Date(app.date.split('/').reverse().join('-'));
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        matchesDate = matchesDate && appDate >= fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59); // End of day
        matchesDate = matchesDate && appDate <= toDate;
      }
    }
    
    // University filter
    const matchesUniversity = filterUniversity === "all" || app.institution === filterUniversity;
    
    // Internship type filter
    const matchesInternshipType = filterInternshipType === "all" || app.fieldOfStudy === filterInternshipType;
    
    // Year filter (extract year from currentYear field)
    const matchesYear = filterYear === "all" || app.currentYear === filterYear;
    
    return matchesSearch && matchesView && matchesDate && matchesUniversity && matchesInternshipType && matchesYear;
  });

  // Debug: Log applications state and filtered results
  console.log("Applications state:", applications);
  console.log("Filtered applications:", filteredApplications);
  console.log("Search term:", search);
  console.log("Filter status:", filterStatus);

  // Pagination logic
  const indexOfLastApplication = currentPage * applicationsPerPage;
  const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstApplication, indexOfLastApplication);
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette candidature ? Cette action est irréversible.")) {
      try {
        const response = await fetch(API_ENDPOINTS.HR_DELETE_APPLICATION, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dsgid: id }),
        });

        if (response.ok) {
          // Remove from local state
          setApplications(applications.filter(app => app.id !== id));
          setSelectedApplication(null);
          alert("Candidature supprimée avec succès !");
        } else {
          const errorData = await response.json();
          alert("Erreur lors de la suppression: " + (errorData.error || "Erreur inconnue"));
        }
      } catch (error) {
        console.error("Error deleting application:", error);
        alert("Erreur réseau lors de la suppression");
      }
    }
  };

  const handleViewCV = (cvUrl) => {
    if (cvUrl) {
      // Extract filename from the URL path
      const filename = cvUrl.split('/').pop();
      if (filename) {
        // Use the CV serving API endpoint
        window.open(`${API_ENDPOINTS.HR_GET_CV}?filename=${encodeURIComponent(filename)}`, '_blank');
      } else {
        alert("CV non disponible");
      }
    } else {
      alert("CV non disponible");
    }
  };

  const handleViewDetails = (app) => {
    console.log("Opening details for application:", app);
    console.log("Areas of interest in app:", app.areasOfInterest);
    
    // Parse areas of interest for the modal
    let parsedAreasOfInterest = [];
    if (app.areasOfInterest && app.areasOfInterest.length > 0) {
      try {
        if (typeof app.areasOfInterest[0] === 'string') {
          parsedAreasOfInterest = JSON.parse(app.areasOfInterest[0]);
        } else {
          parsedAreasOfInterest = app.areasOfInterest;
        }
      } catch (error) {
        console.error("Error parsing areas for modal:", error);
        parsedAreasOfInterest = [];
      }
    }
    
    // Create a new object with parsed areas of interest
    const modalApp = {
      ...app,
      areasOfInterest: parsedAreasOfInterest
    };
    
    console.log("Modal app with parsed areas:", modalApp);
    setSelectedApplication(modalApp);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(API_ENDPOINTS.HR_UPDATE_STATUS, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dsgid: id, status: newStatus }),
      });

      if (response.ok) {
        setApplications(applications.map(app => 
          app.id === id ? { ...app, status: newStatus } : app
        ));
        console.log(`Status updated to ${newStatus} for application ${id}`);
      } else {
        const errorData = await response.json();
        console.error("Error updating status:", errorData.error);
        alert("Erreur lors de la mise à jour du statut: " + (errorData.error || "Erreur inconnue"));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Erreur réseau lors de la mise à jour du statut");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "En attente": return "bg-yellow-100 text-yellow-800";
      case "Accepté": return "bg-green-100 text-green-800";
      case "Rejeté": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAssignToSupervisor = async () => {
    if (!selectedSupervisor || !selectedApplication) {
      setAssignmentStatus("Veuillez sélectionner un responsable de stage");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.HR_ASSIGN_INTERN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          cdtid: selectedApplication.id,
          resid: selectedSupervisor
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAssignmentStatus("Stagiaire assigné avec succès!");
        setShowAssignmentModal(false);
        setSelectedSupervisor("");
        setTimeout(() => setAssignmentStatus(""), 3000);
      } else {
        setAssignmentStatus(data.error || "Erreur lors de l'assignation");
      }
    } catch (error) {
      setAssignmentStatus("Erreur réseau lors de l'assignation");
    }
  };

  const handleGenerateAttestation = async (cdtid, rapportid) => {
    try {
      setAttestationStatus("Génération en cours...");
      const response = await fetch(API_ENDPOINTS.HR_GENERATE_ATTESTATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          cdtid,
          rapportid
        }),
      });

      const data = await response.json();
      console.log("Attestation generation response:", data); // Debug
      
      if (data.success) {
        setAttestationStatus("Attestation de stage générée avec succès !");
        
                 console.log("Attestation URL from backend:", data.attestation?.downloadUrl); // Debug
         
         // Store the candidate info for later removal when download is clicked
         setSelectedAttestation({
           ...data.attestation,
           candidateToRemove: { cdtid, rapportid }
         });
         
         // Update the approved candidates list to mark this candidate's attestation as generated
         setApprovedCandidates(prevCandidates => {
           const updated = prevCandidates.map(candidate => 
             candidate.cdtid === cdtid && candidate.rapportid === rapportid
               ? { ...candidate, attestationGenerated: true, downloadUrl: data.attestation.downloadUrl }
               : candidate
           );
           console.log("Updated candidates with attestation:", updated); // Debug
           return updated;
         });
      } else {
        setAttestationStatus(data.error);
      }
    } catch (error) {
      console.error("Error generating attestation:", error);
      setAttestationStatus("Erreur lors de la génération de l'attestation de stage");
    }
  };

  const handleDownloadAttestation = async (downloadUrl, cdtid, rapportid) => {
    console.log("handleDownloadAttestation called with:", { downloadUrl, cdtid, rapportid }); // Debug
    
    if (downloadUrl) {
      const fullUrl = `${API_BASE_URL}${downloadUrl}`;
      console.log("Opening URL:", fullUrl); // Debug
      
      // Open attestation in a new tab
      window.open(fullUrl, '_blank');
      
      console.log("Downloading attestation for candidate:", { cdtid, rapportid }); // Debug
      
      // Safety check: don't proceed if values are empty
      if (!cdtid || !rapportid) {
        console.log("Empty cdtid or rapportid, skipping removal"); // Debug
        return;
      }
      
      // Remove from local state
      setApprovedCandidates(prevCandidates => {
        console.log("Previous candidates:", prevCandidates); // Debug
        
        const filtered = prevCandidates.filter(candidate => {
          // Convert to strings for comparison to handle type mismatches
          const candidateCdtid = String(candidate.cdtid || '');
          const candidateRapportid = String(candidate.rapportid || '');
          const targetCdtid = String(cdtid || '');
          const targetRapportid = String(rapportid || '');
          
          const shouldKeep = !(candidateCdtid === targetCdtid && candidateRapportid === targetRapportid);
          console.log(`Checking ${candidateCdtid} vs ${targetCdtid} and ${candidateRapportid} vs ${targetRapportid}: ${shouldKeep}`); // Debug
          return shouldKeep;
        });
        
        console.log("Filtered candidates:", filtered); // Debug
        return filtered;
      });
      
      // Mark attestation as downloaded in database
      try {
        const markResponse = await fetch(API_ENDPOINTS.HR_MARK_ATTESTATION_DOWNLOADED, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            cdtid,
            rapportid
          }),
        });
        console.log("Mark downloaded response:", markResponse.status); // Debug
      } catch (error) {
        console.error("Error marking attestation as downloaded:", error);
      }

      // Send email notification
      try {
        const response = await fetch(API_ENDPOINTS.HR_NOTIFY_ATTESTATION_DOWNLOAD, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            cdtid,
            rapportid
          }),
        });
        console.log("Email notification response:", response.status); // Debug
      } catch (error) {
        console.error("Error sending email notification:", error);
        // Don't fail the download if email fails
      }
      
      // Clear the attestation status
      setAttestationStatus("");
    }
  };

  if (loading) {
    console.log("Dashboard is loading...");
    return <div className="text-center py-20 text-xl">Chargement des candidatures...</div>;
  }

  return (
    <section className="min-h-screen bg-gray-50 py-12">
             <div className="flex flex-row gap-4 mb-8 justify-center flex-wrap">
         {/* Total Submissions */}
         <div 
           className={`min-w-[200px] bg-white border ${currentView === "main" ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"} rounded-xl p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105`}
           onClick={() => {
             setViewSafely("main");
             setShowApprovedCandidates(false);
           }}
         >
           <div className="bg-blue-100 p-3 rounded-full flex items-center justify-center">
             <DocumentTextIcon className="h-7 w-7 text-blue-500" />
           </div>
           <div>
             <div className="text-gray-500 text-xs font-medium">Candidatures totales</div>
             <div className="text-xl font-bold">{totalSubmissions}</div>
           </div>
         </div>
         {/* Pending Review */}
         <div 
           className={`min-w-[200px] bg-white border ${currentView === "pending" ? "border-yellow-500 ring-2 ring-yellow-200" : "border-gray-200"} rounded-xl p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105`}
           onClick={() => {
             setViewSafely("pending");
             setShowApprovedCandidates(false);
           }}
         >
           <div className="bg-yellow-100 p-3 rounded-full flex items-center justify-center">
             <ClockIcon className="h-7 w-7 text-yellow-500" />
           </div>
           <div>
             <div className="text-gray-500 text-xs font-medium"> En attente</div>
             <div className="text-xl font-bold">{pendingReview}</div>
           </div>
         </div>
         {/* Approved */}
         <div 
           className={`min-w-[200px] bg-white border ${currentView === "approved" ? "border-green-500 ring-2 ring-green-200" : "border-gray-200"} rounded-xl p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105`}
           onClick={() => {
             setViewSafely("approved");
             setShowApprovedCandidates(false);
           }}
         >
           <div className="bg-green-100 p-3 rounded-full flex items-center justify-center">
             <CheckCircleIcon className="h-7 w-7 text-green-500" />
           </div>
           <div>
             <div className="text-gray-500 text-xs font-medium">Accepté</div>
             <div className="text-xl font-bold">{approved}</div>
           </div>
         </div>
         {/* Rejected */}
         <div 
           className={`min-w-[200px] bg-white border ${currentView === "rejected" ? "border-red-500 ring-2 ring-red-200" : "border-gray-200"} rounded-xl p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105`}
           onClick={() => {
             setViewSafely("rejected");
             setShowApprovedCandidates(false);
           }}
         >
           <div className="bg-red-100 p-3 rounded-full flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
             </svg>
           </div>
           <div>
             <div className="text-gray-500 text-xs font-medium">Refusé</div>
             <div className="text-xl font-bold">{rejected}</div>
           </div>
         </div>
         {/* Approved Reports - Only shown when there are approved reports */}
         {approvedCandidates.length > 0 && (
           <div 
             className={`min-w-[200px] bg-white border ${currentView === "reports" ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-200"} rounded-xl p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105`}
             onClick={() => {
               setViewSafely("reports");
               setShowApprovedCandidates(true);
             }}
           >
             <div className="bg-purple-100 p-3 rounded-full flex items-center justify-center">
               <DocumentTextIcon className="h-7 w-7 text-purple-500" />
             </div>
             <div>
               <div className="text-gray-500 text-xs font-medium">Rapports approuvés</div>
               <div className="text-xl font-bold">{approvedCandidates.length}</div>
             </div>
           </div>
         )}
         
         {/* Send Announcement */}
         <div 
           className={`min-w-[200px] bg-white border ${currentView === "announcement" ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200"} rounded-xl p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105`}
           onClick={() => {
             setViewSafely("announcement");
             setShowApprovedCandidates(false);
           }}
         >
           <div className="bg-indigo-100 p-3 rounded-full flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
             </svg>
           </div>
           <div>
             <div className="text-gray-500 text-xs font-medium">Envoyer annonce</div>
             <div className="text-xl font-bold">{approved}</div>
           </div>
         </div>
       </div>
       
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentView === "initial" ? (
            <div className="text-center py-20">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Tableau de bord RH</h2>
              <p className="text-lg text-gray-600 mb-8">Cliquez sur une carte ci-dessus pour afficher les données correspondantes</p>
            </div>
          ) : currentView === "announcement" ? (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="coke-gradient px-6 py-4">
                  <h2 className="text-2xl font-bold text-white">Envoyer une annonce</h2>
                  <p className="text-coke-light">Envoyer un e-mail à tous les stagiaires acceptés</p>
                </div>
                
                <div className="p-6">
                  {/* Announcement Form */}
                  <AnnouncementForm />
                </div>
              </div>
            </div>
          ) : currentView === "reports" ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="coke-gradient px-6 py-4">
                <h2 className="text-2xl font-bold text-white">Rapports approuvés</h2>
                <p className="text-coke-light">Candidats avec rapports de stage approuvés</p>
              </div>
              
                                              <div className="p-6">
                   {attestationStatus && (
                     <div className={`mb-4 p-4 rounded-lg ${
                       attestationStatus.includes('succès') 
                         ? 'bg-green-100 text-green-700' 
                         : attestationStatus.includes('Erreur') 
                         ? 'bg-red-100 text-red-700'
                         : 'bg-blue-100 text-blue-700'
                     }`}>
                       <span>{attestationStatus}</span>
                     </div>
                   )}
                   
                   {approvedCandidates.length === 0 ? (
                     <div className="text-center py-8 text-gray-500">
                       Aucun rapport approuvé trouvé.
                     </div>
                   ) : (
                     <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-3">Candidat</th>
                      <th className="p-3">CIN</th>
                      <th className="p-3">Rapport</th>
                      <th className="p-3">Date d'approbation</th>
                      <th className="p-3">École</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                                               {approvedCandidates.map((candidate) => (
                          <tr key={`${candidate.cdtid}-${candidate.rapportid}`} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="p-3">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={candidate.imageurl || '/default-avatar.png'}
                                    alt=""
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-gray-900">{candidate.prenom} {candidate.nom}</div>
                                  <div className="text-gray-500">{candidate.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-gray-900">
                              {candidate.cin || 'Non spécifié'}
                            </td>
                            <td className="p-3 text-gray-900">
                              {candidate.rapport_titre}
                            </td>
                            <td className="p-3 text-gray-500">
                              {candidate.datevalidation ? new Date(candidate.datevalidation).toLocaleDateString('fr-FR') : 'N/A'}
                            </td>
                            <td className="p-3 text-gray-500">
                              {candidate.ecole_nom || 'Non spécifié'}
                            </td>
                                                         <td className="p-3 font-medium">
                              {candidate.attestationGenerated ? (
                                <button
                                  onClick={() => {
                                    console.log("Download button clicked for candidate:", {
                                      cdtid: candidate.cdtid,
                                      rapportid: candidate.rapportid,
                                      downloadUrl: candidate.downloadUrl,
                                      attestationGenerated: candidate.attestationGenerated
                                    });
                                    handleDownloadAttestation(candidate.downloadUrl, candidate.cdtid, candidate.rapportid);
                                  }}
                                  className="px-4 py-2 rounded-lg bg-green-200 text-green-700 hover:bg-green-300 font-semibold text-sm transition-colors"
                                >
                                  Télécharger l'attestation
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleGenerateAttestation(candidate.cdtid, candidate.rapportid)}
                                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold text-sm transition-colors"
                                >
                                  Attestation de stage
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                                        </tbody>
                 </table>
               )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="coke-gradient px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Tableau de bord RH</h2>
              <p className="text-coke-light">Gérez les candidatures de stage</p>
            </div>
            
            <div className="p-6">
              {/* Search and Filter */}
              <div className="mb-6">
                                 {/* Basic Search */}
                 <div className="flex flex-col md:flex-row gap-4 mb-4">
                   <input
                     type="text"
                     placeholder="Rechercher par nom, école ou filière..."
                     className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-coke-red text-lg"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                   />
                   <button
                     onClick={() => setShowFilters(!showFilters)}
                     className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                     title={showFilters ? "Masquer les filtres avancés" : "Afficher les filtres avancés"}
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                     </svg>
                     <span className="text-sm font-medium">{showFilters ? "Masquer" : "Filtres"}</span>
                   </button>
                 </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-700 mb-3">Filtres Avancés</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Date Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de soumission</label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">De</label>
                            <input
                              type="date"
                              value={dateFrom}
                              onChange={(e) => setDateFrom(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red text-sm"
                              placeholder="Date de début"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">À</label>
                            <input
                              type="date"
                              value={dateTo}
                              onChange={(e) => setDateTo(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red text-sm"
                              placeholder="Date de fin"
                            />
                          </div>
                        </div>
                      </div>

                      {/* University Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Établissement</label>
                        <select
                          value={filterUniversity}
                          onChange={(e) => setFilterUniversity(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red text-sm"
                        >
                          <option value="all">Tous les établissements</option>
                          {universities.map((university) => (
                            <option key={university.ecoleid} value={university.nom}>
                              {university.nom} - {university.ville}
                            </option>
                          ))}
                          <option value="Non spécifié">Non spécifié</option>
                        </select>
                      </div>

                      {/* Internship Type Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de Stage</label>
                        <select
                          value={filterInternshipType}
                          onChange={(e) => setFilterInternshipType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red text-sm"
                        >
                          <option value="all">Tous les types</option>
                          <option value="stage d'observation">Stage d'Observation</option>
                          <option value="stage projet de fin d'année">Stage Projet de Fin d'Année</option>
                          <option value="stage projet de fin d'études">Stage Projet de Fin d'Études</option>
                          <option value="stage pré-embauche">Stage Pré-embauche</option>
                        </select>
                      </div>

                      {/* Year Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Année d'Étude</label>
                        <select
                          value={filterYear}
                          onChange={(e) => setFilterYear(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red text-sm"
                        >
                          <option value="all">Toutes les années</option>
                          <option value="1st Year">1ère Année</option>
                          <option value="2nd Year">2ème Année</option>
                          <option value="3rd Year">3ème Année</option>
                          <option value="4th Year">4ème Année</option>
                          <option value="5th Year">5ème Année</option>
                          <option value="Graduate">Diplômé</option>
                        </select>
                      </div>

                      {/* Clear Filters Button */}
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setDateFrom("");
                            setDateTo("");
                            setFilterUniversity("all");
                            setFilterInternshipType("all");
                            setFilterYear("all");
                            setSearch("");
                            setFilterStatus("all");
                          }}
                          className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Effacer Tous les Filtres
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

                             {/* Applications Table */}
               {/* Page Info */}
               <div className="mb-4 text-sm text-gray-600">
                 Affichage de {indexOfFirstApplication + 1} à {Math.min(indexOfLastApplication, filteredApplications.length)} sur {filteredApplications.length} candidatures
               </div>
               
                               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-3">Candidat</th>
                      <th className="p-3">Institution</th>
                      <th className="p-3">Type de stage</th>
                      <th className="p-3">Date de soumission</th>
                      <th className="p-3">Durée</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                   {currentApplications.length === 0 ? (
                     <tr>
                       <td colSpan={7} className="text-center py-8 text-gray-500">
                         Aucune candidature trouvée.
                       </td>
                     </tr>
                   ) : (
                                           currentApplications.map((app) => (
                        <tr key={app.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {app.imageurl ? (
                                  <img src={`${API_BASE_URL}${app.imageurl}`} alt="Photo" className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">?</div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">{app.fullName}</div>
                                <div className="text-gray-500">{app.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-gray-900">
                            {app.institution}
                          </td>
                          <td className="p-3 text-gray-900">
                            {app.typestage}
                          </td>
                          <td className="p-3 text-gray-500">
                            {app.date}
                          </td>
                          <td className="p-3 text-gray-500">
                            {app.periode}
                          </td>
                                                     <td className="p-3 text-center">
                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                               {app.status}
                             </span>
                           </td>
                                                     <td className="p-3 font-medium">
                             <button
                               onClick={() => navigate(`/candidature/${app.id}`)}
                               className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold text-sm transition-colors"
                             >
                               Voir Détails
                             </button>
                           </td>
                        </tr>
                      ))
                   )}
                 </tbody>
               </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold text-sm transition-colors"
                    >
                      Précédent
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                          currentPage === i + 1
                            ? "bg-coke-red text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold text-sm transition-colors"
                    >
                      Suivant
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button 
              onClick={() => setSelectedApplication(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-coke-red text-2xl"
            >
              &times;
            </button>
            <h3 className="font-bold text-2xl mb-4" style={{ color: '#F40009' }}>
              Détails de la candidature
            </h3>
            <div className="space-y-3">
              {selectedApplication.imageurl && (
                <div className="flex justify-center mb-2">
                  <img src={`${API_BASE_URL}${selectedApplication.imageurl}`} alt="Photo" className="h-24 w-24 rounded-full object-cover border" />
                </div>
              )}
              <div><b>Prénom:</b> {parseJsonString(selectedApplication.prenom) || "Non disponible"}</div>
              <div><b>Nom:</b> {parseJsonString(selectedApplication.nom) || "Non disponible"}</div>
              <div><b>Nom complet:</b> {selectedApplication.fullName}</div>
              <div><b>Institution:</b> {selectedApplication.institution}</div>
              <div><b>Domaine:</b> {selectedApplication.fieldOfStudy}</div>
              <div><b>Email:</b> {selectedApplication.email}</div>
              <div><b>Téléphone:</b> {selectedApplication.phone}</div>
              <div><b>Type de stage:</b> {selectedApplication.typestage}</div>
              <div><b>Domaine d'Étude/Spécialisation:</b> {selectedApplication.domaine || "Non spécifié"}</div>
              <div><b>Domaines d'intérêt:</b> {(() => {
                try {
                  console.log("Modal areas of interest:", selectedApplication.areasOfInterest);
                  if (selectedApplication.areasOfInterest && selectedApplication.areasOfInterest.length > 0) {
                    const result = selectedApplication.areasOfInterest.join(", ");
                    console.log("Modal display result:", result);
                    return result;
                  }
                  return "Aucun domaine sélectionné";
                } catch (error) {
                  console.error("Error displaying areas of interest:", error);
                  return "Erreur d'affichage";
                }
              })()}</div>
              <div><b>Demande de stage:</b></div>
              <div className="bg-gray-50 p-3 rounded-lg text-sm max-h-32 overflow-y-auto">
                {selectedApplication.demandeStage || "Aucune demande fournie"}
              </div>
              <div><b>Date de soumission:</b> {selectedApplication.date}</div>
              <div><b>Durée du stage:</b> {selectedApplication.periode}</div>
              <div><b>Statut:</b> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                  {selectedApplication.status}
                </span>
              </div>
              {selectedApplication.cvUrl && (
                <div>
                  <b>CV:</b> 
                  <button 
                    onClick={() => handleViewCV(selectedApplication.cvUrl)}
                    className="ml-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold text-sm"
                  >
                    Télécharger CV
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

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

      
    </section>
  );
}