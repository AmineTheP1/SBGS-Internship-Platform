import React, { useState, useEffect } from "react";
import API_ENDPOINTS from "../config/api.js";

export default function ApplicationForm() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    cin: "",
    email: "",
    telephone: "",
    ecoleid: "",
    typestage: "",
    fieldOfStudy: "",
    currentYear: "",
    areasOfInterest: [],
    cv: null,
    internshipApplication: "",
    photo: null,
    periode: "",
    moisDebut: "",
    carteNationale: null,
    conventionStage: null,
    assurance: null,
  });
  
  // State for school search functionality
  const [schoolSearch, setSchoolSearch] = useState("");
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const [selectedSchoolName, setSelectedSchoolName] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoDragOver, setPhotoDragOver] = useState(false);

  const [cvUploading, setCvUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  // File size constants (in bytes)
  const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to validate file size and type
  const validateFile = (file, type) => {
    if (type === 'pdf') {
      if (file.size > MAX_PDF_SIZE) {
        return {
          isValid: false,
          error: `Le fichier PDF est trop volumineux (${formatFileSize(file.size)}). La taille maximale autorisée est de 5MB.`
        };
      }
      if (!file.type.includes('pdf')) {
        return {
          isValid: false,
          error: 'Seuls les fichiers PDF sont acceptés.'
        };
      }
    } else if (type === 'image') {
      if (file.size > MAX_IMAGE_SIZE) {
        return {
          isValid: false,
          error: `L'image est trop volumineuse (${formatFileSize(file.size)}). La taille maximale autorisée est de 2MB.`
        };
      }
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        return {
          isValid: false,
          error: 'Seuls les fichiers JPG, JPEG et PNG sont acceptés.'
        };
      }
    }
    return { isValid: true, error: null };
  };

  // Fetch universities from database
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.HR_GET_UNIVERSITIES);
        const data = await response.json();
        if (data.success) {
          setUniversities(data.universities);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  // Handle school search input
  const handleSchoolSearch = (e) => {
    const value = e.target.value;
    setSchoolSearch(value);
    setShowSchoolSuggestions(value.length > 0);
    
    // Clear selection if user is typing
    if (formData.ecoleid) {
      setFormData(prev => ({ ...prev, ecoleid: "" }));
      setSelectedSchoolName("");
    }
  };
  
  // Handle school selection from suggestions
  const handleSchoolSelect = (university) => {
    const cityAlreadyInName = university.nom.toLowerCase().includes(university.ville.toLowerCase());
    const displayName = cityAlreadyInName
      ? university.nom
      : `${university.nom} - ${university.ville}`;
    setFormData(prev => ({ ...prev, ecoleid: university.ecoleid }));
    setSelectedSchoolName(displayName);
    setSchoolSearch(displayName);
    setShowSchoolSuggestions(false);
  };
  
  // Filter universities based on search
  const filteredUniversities = universities.filter(university => 
    university.nom.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    university.ville.toLowerCase().includes(schoolSearch.toLowerCase())
  ).slice(0, 10); // Limit to 10 suggestions

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    // Clear any previous errors
    setError("");
    
    if (type === 'file') {
      if (name === 'cv' || name === 'carteNationale' || name === 'conventionStage' || name === 'assurance') {
        const file = files[0];
        if (file) {
          const validation = validateFile(file, 'pdf');
          if (!validation.isValid) {
            setError(validation.error);
            // Clear the file input
            e.target.value = '';
            return;
          }
          setFormData(prev => ({ ...prev, [name]: file }));
        }
      } else if (name === 'photo') {
        const file = files[0];
        if (file) {
          const validation = validateFile(file, 'image');
          if (!validation.isValid) {
            setError(validation.error);
            // Clear the file input
            e.target.value = '';
            return;
          }
          setFormData(prev => ({ ...prev, photo: file }));
          const reader = new FileReader();
          reader.onloadend = () => setPhotoPreview(reader.result);
          reader.readAsDataURL(file);
        } else {
          setPhotoPreview(null);
        }
      }
    } else if (type === 'checkbox') {
      const { checked } = e.target;
      if (checked) {
        setFormData(prev => ({
          ...prev,
          areasOfInterest: [...prev.areasOfInterest, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          areasOfInterest: prev.areasOfInterest.filter(area => area !== value)
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveCV = () => {
    setFormData(prev => ({ ...prev, cv: null }));
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
    setPhotoPreview(null);
  };

  const handlePhotoDrop = (e) => {
    e.preventDefault();
    setPhotoDragOver(false);
    setError("");
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validation = validateFile(file, 'image');
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }
      
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoDragOver = (e) => {
    e.preventDefault();
    setPhotoDragOver(true);
  };

  const handlePhotoDragLeave = (e) => {
    e.preventDefault();
    setPhotoDragOver(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");

    // Basic validation
    if (!formData.nom || !formData.prenom || !formData.cin || !formData.email || 
        !formData.telephone || !formData.typestage || !formData.fieldOfStudy || 
        !formData.currentYear || !formData.cv || !formData.internshipApplication || !formData.periode || !formData.moisDebut || !formData.photo) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Phone number must be exactly 10 digits
    if (!/^\d{10}$/.test(formData.telephone)) {
      setError("Le numéro de téléphone doit contenir exactement 10 chiffres.");
      return;
    }

    if (formData.areasOfInterest.length === 0) {
      setError("Veuillez sélectionner au moins un domaine d'intérêt.");
      return;
    }

    if (!formData.carteNationale || !formData.conventionStage || !formData.assurance) {
      setError("Veuillez joindre tous les documents obligatoires.");
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'areasOfInterest') {
          data.append(key, JSON.stringify(value));
        } else if (key === 'photo' && value) {
          data.append('photo', value);
        } else if (value) {
          data.append(key, value);
        }
      });

      if (formData.carteNationale) data.append('carteNationale', formData.carteNationale);
      if (formData.conventionStage) data.append('conventionStage', formData.conventionStage);
      if (formData.assurance) data.append('assurance', formData.assurance);

      const response = await fetch(API_ENDPOINTS.APPLY, {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        setStatus("Votre candidature a été envoyée avec succès !");
        setFormData({
          nom: "",
          prenom: "",
          cin: "",
          email: "",
          telephone: "",
          ecoleid: "",
          typestage: "",
          fieldOfStudy: "",
          currentYear: "",
          areasOfInterest: [],
          cv: null,
          internshipApplication: "",
          photo: null,
          periode: "",
          moisDebut: "",
          carteNationale: null,
          conventionStage: null,
          assurance: null,
        });
        setPhotoPreview(null);
        setSchoolSearch("");
        setSelectedSchoolName("");
      } else {
        const errData = await response.json();
        setError(errData.error || "Erreur lors de l'envoi. Veuillez réessayer.");
      }
    } catch (err) {
      setError("Erreur réseau. Veuillez réessayer.");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-xl">Chargement du formulaire...</div>;
  }

  return (
    <section id="apply" className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Candidature de Stage</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Rejoignez notre équipe et faites vos premiers pas dans votre carrière professionnelle avec SBGS.
          </p>
          <div className="w-20 h-1 bg-coke-red mx-auto mt-4"></div>
        </div>
        
        <div className="mt-12 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="coke-gradient py-4 px-6">
            <h3 className="text-xl font-bold text-white">Soumettre Votre Candidature</h3>
            <p className="text-coke-light">Remplissez le formulaire ci-dessous pour postuler à un poste de stage</p>
          </div>
          
          <form className="p-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium">Nom *</label>
                <input 
                  type="text" 
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  required 
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Prénom *</label>
                <input 
                  type="text" 
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  required 
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">CIN (Carte Nationale d'Identité) *</label>
                <input 
                  type="text" 
                  name="cin"
                  value={formData.cin}
                  onChange={handleInputChange}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  placeholder="Ex: AB123456"
                  required 
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Email *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  required 
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Téléphone *</label>
                <input 
                  type="tel" 
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  placeholder="Ex: 0612345678"
                  required 
                  pattern="\d{10}"
                  maxLength={10}
                  minLength={10}
                />
              </div>
              <div className="relative">
                <label className="block text-gray-700 font-medium">Établissement d'Enseignement</label>
                <input
                  type="text"
                  value={schoolSearch}
                  onChange={handleSchoolSearch}
                  onFocus={() => setShowSchoolSuggestions(schoolSearch.length > 0)}
                  onBlur={() => {
                    // Delay hiding suggestions to allow for clicks
                    setTimeout(() => setShowSchoolSuggestions(false), 200);
                  }}
                  placeholder="Tapez le nom de votre établissement..."
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent"
                />
                
                {/* Suggestions dropdown */}
                {showSchoolSuggestions && filteredUniversities.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredUniversities.map((university) => {
                      // Check if city is already included in the university name
                      const cityAlreadyInName = university.nom.toLowerCase().includes(university.ville.toLowerCase());
                      
                      return (
                        <div
                          key={university.ecoleid}
                          onClick={() => handleSchoolSelect(university)}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{university.nom}</div>
                          {!cityAlreadyInName && (
                            <div className="text-sm text-gray-600">{university.ville}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Show message when no suggestions found */}
                {showSchoolSuggestions && schoolSearch.length > 0 && filteredUniversities.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                    <div className="text-gray-500 text-sm">Aucun établissement trouvé</div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Type de Stage *</label>
                <select 
                  name="typestage"
                  value={formData.typestage}
                  onChange={handleInputChange}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  required
                >
                  <option value="">Sélectionner le type de stage</option>
                  <option value="stage d'observation">Stage d'Observation</option>
                  <option value="stage projet de fin d'année">Stage Projet de Fin d'Année</option>
                  <option value="stage projet de fin d'études">Stage Projet de Fin d'Études</option>
                  <option value="stage pré-embauche">Stage Pré-embauche</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Domaine d'Étude/Spécialisation *</label>
                <input 
                  type="text" 
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleInputChange}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  required 
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Année Actuelle *</label>
                <select 
                  name="currentYear"
                  value={formData.currentYear}
                  onChange={handleInputChange}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  required
                >
                  <option value="">Sélectionner l'Année</option>
                  <option value="1st Year">1ère Année</option>
                  <option value="2nd Year">2ème Année</option>
                  <option value="3rd Year">3ème Année</option>
                  <option value="4th Year">4ème Année</option>
                  <option value="5th Year">5ème Année</option>
                  <option value="Graduate">Diplômé</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Durée du stage *</label>
                <select 
                  name="periode"
                  value={formData.periode}
                  onChange={handleInputChange}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  required
                >
                  <option value="">Sélectionner la durée</option>
                  <option value="1 mois">1 mois</option>
                  <option value="2 mois">2 mois</option>
                  <option value="3 mois">3 mois</option>
                  <option value="4 mois">4 mois</option>
                  <option value="5 mois">5 mois</option>
                  <option value="6 mois">6 mois</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Mois de début souhaité *</label>
                <select 
                  name="moisDebut"
                  value={formData.moisDebut}
                  onChange={handleInputChange}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  required
                >
                  <option value="">Sélectionner le mois</option>
                  <option value="Janvier">Janvier</option>
                  <option value="Février">Février</option>
                  <option value="Mars">Mars</option>
                  <option value="Avril">Avril</option>
                  <option value="Mai">Mai</option>
                  <option value="Juin">Juin</option>
                  <option value="Juillet">Juillet</option>
                  <option value="Août">Août</option>
                  <option value="Septembre">Septembre</option>
                  <option value="Octobre">Octobre</option>
                  <option value="Novembre">Novembre</option>
                  <option value="Décembre">Décembre</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium">Domaine d'Intérêt *</label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    "Marketing", "Opérations", "Finance", "RH", 
                    "Chaîne d'Approvisionnement", "IT", "Ingénierie", "Contrôle Qualité"
                  ].map((area) => (
                    <label key={area} className="flex items-center">
                      <input 
                        type="checkbox" 
                        name="areasOfInterest"
                        value={area}
                        checked={formData.areasOfInterest.includes(area)}
                        onChange={handleInputChange}
                        className="text-coke-red focus:ring-coke-red" 
                      />
                      <span className="ml-2 text-gray-600">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium">Télécharger Votre CV (PDF, max 5MB) *</label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="space-y-1 text-center w-full">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 48 48">
                      <rect x="10" y="8" width="28" height="32" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <rect x="16" y="16" width="16" height="2.5" rx="1" fill="currentColor" opacity="0.2"/>
                      <rect x="16" y="22" width="12" height="2" rx="1" fill="currentColor" opacity="0.2"/>
                      <rect x="16" y="28" width="10" height="2" rx="1" fill="currentColor" opacity="0.2"/>
                      <rect x="16" y="34" width="8" height="2" rx="1" fill="currentColor" opacity="0.2"/>
                      <text x="18" y="40" font-size="10" font-weight="bold" fill="#9ca3af">CV</text>
                    </svg>
                    <span className="block text-gray-500 font-medium"></span>
                    {formData.cv ? (
                      <>
                        <span className="font-medium text-coke-red">{formData.cv.name}</span>
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={handleRemoveCV}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-semibold"
                          >
                            Supprimer
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-coke-red hover:text-coke-dark">
                          <span>{cvUploading ? "Chargement..." : "Télécharger un fichier"}</span>
                          <input
                            type="file"
                            name="cv"
                            onChange={handleInputChange}
                            className="sr-only"
                            accept=".pdf"
                            required
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                        <p className="text-xs text-gray-500 mt-2">PDF jusqu'à 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium">Photocopie de Carte Nationale (PDF, max 5MB) *</label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="space-y-1 text-center w-full">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 48 48">
                      <rect x="8" y="14" width="32" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <circle cx="18" cy="24" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <rect x="26" y="22" width="10" height="2" rx="1" fill="currentColor" opacity="0.2"/>
                      <rect x="26" y="26" width="7" height="2" rx="1" fill="currentColor" opacity="0.2"/>
                    </svg>
                    <span className="block text-gray-500 font-medium"></span>
                    {formData.carteNationale ? (
                      <>
                        <span className="font-medium text-coke-red">{formData.carteNationale.name}</span>
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, carteNationale: null }))}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-semibold"
                          >
                            Supprimer
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-coke-red hover:text-coke-dark">
                          <span>Télécharger un fichier</span>
                          <input
                            type="file"
                            name="carteNationale"
                            onChange={handleInputChange}
                            className="sr-only"
                            accept=".pdf"
                            required
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                        <p className="text-xs text-gray-500 mt-2">PDF jusqu'à 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium">Convention de Stage (PDF, max 5MB) *</label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="space-y-1 text-center w-full">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 48 48">
                      <rect x="12" y="8" width="24" height="32" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <rect x="18" y="16" width="12" height="2" rx="1" fill="currentColor" opacity="0.2"/>
                      <rect x="18" y="22" width="8" height="2" rx="1" fill="currentColor" opacity="0.2"/>
                      <rect x="18" y="28" width="10" height="2" rx="1" fill="currentColor" opacity="0.2"/>
                    </svg>
                    <span className="block text-gray-500 font-medium"></span>
                    {formData.conventionStage ? (
                      <>
                        <span className="font-medium text-coke-red">{formData.conventionStage.name}</span>
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, conventionStage: null }))}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-semibold"
                          >
                            Supprimer
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-coke-red hover:text-coke-dark">
                          <span>Télécharger un fichier</span>
                          <input
                            type="file"
                            name="conventionStage"
                            onChange={handleInputChange}
                            className="sr-only"
                            accept=".pdf"
                            required
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                        <p className="text-xs text-gray-500 mt-2">PDF jusqu'à 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium">Assurance (PDF, max 5MB) *</label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="space-y-1 text-center w-full">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 48 48">
                      <path d="M24 8L38 14V24C38 33 24 40 24 40C24 40 10 33 10 24V14L24 8Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M24 20V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="24" cy="18" r="2" fill="currentColor" opacity="0.2"/>
                    </svg>
                    <span className="block text-gray-500 font-medium"></span>
                    {formData.assurance ? (
                      <>
                        <span className="font-medium text-coke-red">{formData.assurance.name}</span>
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, assurance: null }))}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-semibold"
                          >
                            Supprimer
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-coke-red hover:text-coke-dark">
                          <span>Télécharger un fichier</span>
                          <input
                            type="file"
                            name="assurance"
                            onChange={handleInputChange}
                            className="sr-only"
                            accept=".pdf"
                            required
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                        <p className="text-xs text-gray-500 mt-2">PDF jusqu'à 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium">Photo du candidat (JPG, PNG, max 2MB) *</label>
                <div 
                  className={`mt-2 flex flex-col items-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                    photoDragOver 
                      ? 'border-coke-red bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  onDrop={handlePhotoDrop}
                  onDragOver={handlePhotoDragOver}
                  onDragLeave={handlePhotoDragLeave}
                >
                  {photoPreview ? (
                    <div className="text-center">
                      <img src={photoPreview} alt="Aperçu" className="h-24 w-24 object-cover rounded-full mx-auto mb-2" />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-semibold"
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                      <div className="flex flex-col items-center text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-coke-red hover:text-coke-dark">
                          <span>Télécharger une photo</span>
                          <input
                            type="file"
                            name="photo"
                            onChange={handleInputChange}
                            className="sr-only"
                            accept=".jpg,.jpeg,.png"
                            required
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                        <p className="text-xs text-gray-500 mt-1">JPG ou PNG jusqu'à 2MB</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium">Demande de stage *</label>
                <textarea 
                  rows="5" 
                  name="internshipApplication"
                  value={formData.internshipApplication}
                  onChange={handleInputChange}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  placeholder="Dites-nous pourquoi vous voulez faire un stage chez SBGS..." 
                  required
                ></textarea>
              </div>
            </div>
            
            {error && <div className="mt-4 text-red-600 font-semibold text-center">{error}</div>}
            {status && <div className="mt-4 text-green-600 font-semibold text-center">{status}</div>}
            
            <div className="mt-6">
              <button 
                type="submit" 
                className="w-full coke-gradient py-3 px-4 text-white font-bold rounded-lg shadow-md hover:bg-coke-dark transition"
              >
                Soumettre la Candidature
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}