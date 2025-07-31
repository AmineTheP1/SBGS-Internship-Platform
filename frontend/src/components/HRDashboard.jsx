import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/solid';
import API_ENDPOINTS from "../config/api.js";

export default function HRDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllApplications, setShowAllApplications] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterUniversity, setFilterUniversity] = useState("all");
  const [filterInternshipType, setFilterInternshipType] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [universities, setUniversities] = useState([]);
  
  const navigate = useNavigate();

  // Calculate statistics
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === "En attente" || app.status === "Under Review").length;
  const acceptedApplications = applications.filter(app => app.status === "Accepté").length;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [search, filterStatus, dateFrom, dateTo, filterUniversity, filterInternshipType, filterYear, currentPage]);

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.HR_SESSION, { credentials: "include" });
        if (!res.ok) {
          navigate('/hr-login', { replace: true });
          return;
        }
      } catch (error) {
        console.error("HR session error:", error);
        navigate('/hr-login', { replace: true });
        return;
      }
    };
    checkSession();
    
    // Fetch universities
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

    // Fetch applications
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.HR_APPLICATIONS, {
          credentials: "include"
        });
        const data = await response.json();
        
        if (data.success) {
          const formattedApplications = data.applications.map(app => ({
            ...app,
            fullName: `${app.prenom || ''} ${app.nom || ''}`.trim(),
            date: app.datesoumission ? new Date(app.datesoumission).toLocaleDateString('fr-FR') : 'N/A',
            areasOfInterest: app.domaines_interet ? JSON.parse(app.domaines_interet) : []
          }));
          setApplications(formattedApplications);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
    fetchApplications();
  }, [navigate]);

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(search.toLowerCase()) ||
                         app.email.toLowerCase().includes(search.toLowerCase()) ||
                         app.domaine?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const appDate = new Date(app.datesoumission);
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        matchesDate = matchesDate && appDate >= fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59);
        matchesDate = matchesDate && appDate <= toDate;
      }
    }
    
    const matchesUniversity = filterUniversity === "all" || app.universityname === filterUniversity;
    const matchesInternshipType = filterInternshipType === "all" || app.domaine === filterInternshipType;
    const matchesYear = filterYear === "all" || app.currentyear === filterYear;
    
    return matchesSearch && matchesStatus && matchesDate && matchesUniversity && matchesInternshipType && matchesYear;
  });

  // Pagination
  const indexOfLastApplication = currentPage * applicationsPerPage;
  const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstApplication, indexOfLastApplication);
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewDetails = (app) => {
    setSelectedApplication(app);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(API_ENDPOINTS.HR_UPDATE_STATUS, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dsgid: id, status: newStatus }),
      });

      if (response.ok) {
        setApplications(applications.map(app => 
          app.dsgid === id ? { ...app, status: newStatus } : app
        ));
      } else {
        alert("Erreur lors de la mise à jour du statut");
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

  const handleLogout = async () => {
    try {
      await fetch(API_ENDPOINTS.HR_LOGOUT, {
        method: "POST",
        credentials: "include"
      });
      navigate('/hr-login');
    } catch (error) {
      console.error("Logout error:", error);
      navigate('/hr-login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coke-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord RH</h1>
              <p className="text-gray-600">Gestion des candidatures de stage</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-coke-red transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showAllApplications ? (
          // Metrics Dashboard
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-coke-red to-red-700 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-semibold mb-2">Bienvenue sur votre tableau de bord</h2>
              <p className="text-red-100">Gérez efficacement toutes vos candidatures de stage en un seul endroit</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Applications Card */}
              <div 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105 group"
                onClick={() => setShowAllApplications(true)}
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-3 group-hover:bg-blue-200 transition-colors">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Candidatures totales</p>
                    <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
                  </div>
                </div>
                <div className="mt-4 text-xs text-blue-600 font-medium">
                  Cliquez pour voir toutes les candidatures →
                </div>
              </div>

              {/* Pending Applications Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-yellow-100 rounded-full p-3">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingApplications}</p>
                  </div>
                </div>
                <div className="mt-4 text-xs text-yellow-600 font-medium">
                  Nécessitent votre attention
                </div>
              </div>

              {/* Accepted Applications Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Accepté</p>
                    <p className="text-2xl font-bold text-gray-900">{acceptedApplications}</p>
                  </div>
                </div>
                <div className="mt-4 text-xs text-green-600 font-medium">
                  Candidatures approuvées
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowAllApplications(true)}
                  className="flex items-center justify-center px-4 py-3 bg-coke-red text-white rounded-lg hover:bg-red-700 transition-colors transform hover:scale-105"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Voir toutes les candidatures
                </button>
                <button
                  onClick={() => {
                    setFilterStatus("En attente");
                    setShowAllApplications(true);
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors transform hover:scale-105"
                >
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Candidatures en attente
                </button>
                <button
                  onClick={() => {
                    setFilterStatus("Accepté");
                    setShowAllApplications(true);
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors transform hover:scale-105"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Candidatures acceptées
                </button>
                <button
                  onClick={() => window.open('/apply', '_blank')}
                  className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors transform hover:scale-105"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Nouvelle candidature
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            {applications.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h2>
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.dsgid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full object-cover mr-3"
                          src={app.imageurl || '/default-avatar.png'}
                          alt=""
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{app.fullName}</p>
                          <p className="text-xs text-gray-500">{app.domaine}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                        <button
                          onClick={() => handleViewDetails(app)}
                          className="text-xs text-coke-red hover:text-red-700 font-medium"
                        >
                          Voir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {applications.length > 5 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowAllApplications(true)}
                      className="text-sm text-coke-red hover:text-red-700 font-medium"
                    >
                      Voir toutes les candidatures ({applications.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Applications List View
          <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowAllApplications(false)}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <XMarkIcon className="h-5 w-5 mr-2" />
                  Retour au tableau de bord
                </button>
                <h2 className="text-xl font-semibold text-gray-900">Toutes les candidatures</h2>
              </div>
              <div className="text-sm text-gray-500">
                {filteredApplications.length} candidature(s) trouvée(s)
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom, email ou domaine..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red"
                    />
                  </div>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Filtres
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="En attente">En attente</option>
                      <option value="Accepté">Accepté</option>
                      <option value="Rejeté">Rejeté</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Établissement</label>
                    <select
                      value={filterUniversity}
                      onChange={(e) => setFilterUniversity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red"
                    >
                      <option value="all">Tous les établissements</option>
                      {universities.map((university) => (
                        <option key={university.ecoleid} value={university.nom}>
                          {university.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Domaine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Établissement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentApplications.map((app) => (
                      <tr key={app.dsgid} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={app.imageurl || '/default-avatar.png'}
                                alt=""
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{app.fullName}</div>
                              <div className="text-sm text-gray-500">{app.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {app.domaine}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.universityname || 'Non spécifié'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(app)}
                            className="text-coke-red hover:text-red-700 mr-3"
                          >
                            Détails
                          </button>
                          <select
                            value={app.status}
                            onChange={(e) => updateStatus(app.dsgid, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="En attente">En attente</option>
                            <option value="Accepté">Accepté</option>
                            <option value="Rejeté">Rejeté</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Affichage de <span className="font-medium">{indexOfFirstApplication + 1}</span> à{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastApplication, filteredApplications.length)}
                        </span>{' '}
                        sur <span className="font-medium">{filteredApplications.length}</span> résultats
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === number
                                ? 'z-10 bg-coke-red border-coke-red text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {number}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Application Details Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Détails de la candidature</h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.telephone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Domaine</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.domaine}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Établissement</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.universityname || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Année d'étude</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.currentyear}</p>
                  </div>
                </div>
                
                {selectedApplication.areasOfInterest && selectedApplication.areasOfInterest.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Domaines d'intérêt</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedApplication.areasOfInterest.map((area, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <select
                    value={selectedApplication.status}
                    onChange={(e) => updateStatus(selectedApplication.dsgid, e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red"
                  >
                    <option value="En attente">En attente</option>
                    <option value="Accepté">Accepté</option>
                    <option value="Rejeté">Rejeté</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Fermer
                </button>
                <button
                  onClick={() => navigate(`/candidature/${selectedApplication.dsgid}`)}
                  className="px-4 py-2 text-sm font-medium text-white bg-coke-red rounded-lg hover:bg-red-700"
                >
                  Voir détails complets
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 