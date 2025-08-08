import React, { useState, useEffect } from 'react';
import { 
  FaFile, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, 
  FaFilePowerpoint, FaFileArchive, FaFileCode, FaFileVideo, FaFileAudio, 
  FaTrash, FaPlus, FaFolder, FaFolderOpen, FaEdit, FaFolderPlus 
} from 'react-icons/fa';
import API_ENDPOINTS from '../config/api';

const UsefulFilesManager = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    file: null,
    folderId: ''
  });
  const [folderForm, setFolderForm] = useState({
    name: '',
    description: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [folderError, setFolderError] = useState(null);
  const [currentView, setCurrentView] = useState('folders'); // 'folders' or 'files'

  // Fetch files and folders on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch files
      const filesResponse = await fetch(API_ENDPOINTS.HR_GET_USEFUL_FILES, {
        credentials: 'include'
      });
      
      if (!filesResponse.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const filesData = await filesResponse.json();
      if (!filesData.success) {
        throw new Error(filesData.error || 'Failed to fetch files');
      }

      // Fetch folders
      const foldersResponse = await fetch(API_ENDPOINTS.HR_GET_FOLDERS, {
        credentials: 'include'
      });
      
      if (!foldersResponse.ok) {
        throw new Error('Failed to fetch folders');
      }
      
      const foldersData = await foldersResponse.json();
      if (!foldersData.success) {
        throw new Error(foldersData.error || 'Failed to fetch folders');
      }

      setFiles(filesData.files);
      setFolders(foldersData.folders);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setUploadForm(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    setIsCreatingFolder(true);
    setFolderError(null);

    try {
      const response = await fetch(API_ENDPOINTS.HR_CREATE_FOLDER, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: folderForm.name,
          description: folderForm.description
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setShowFolderModal(false);
        setFolderForm({
          name: '',
          description: ''
        });
        fetchData(); // Refresh the folders list
      } else {
        throw new Error(data.error || 'Failed to create folder');
      }
    } catch (err) {
      setFolderError(err.message || 'Une erreur est survenue lors de la création du dossier');
      console.error('Error creating folder:', err);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('file', uploadForm.file);
      if (uploadForm.folderId) {
        formData.append('folderId', uploadForm.folderId);
      }

      const response = await fetch(API_ENDPOINTS.HR_UPLOAD_USEFUL_FILE, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });
      
      let data;
      try {
        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
          // Try to get error message from response if possible
          try {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.status}`);
          } catch (jsonError) {
            // If we can't parse the error response, use status text
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
        }
        
        // Parse successful response
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error(parseError.message || 'Failed to parse server response. Please try again.');
      }
      if (data.success) {
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          description: '',
          file: null
        });
        fetchFiles(); // Refresh the file list
      } else {
        throw new Error(data.error || 'Failed to upload file');
      }
    } catch (err) {
      setUploadError(err.message || 'Une erreur est survenue lors du téléchargement du fichier');
      console.error('Error uploading file:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.HR_DELETE_USEFUL_FILE}?fileId=${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setFiles(files.filter(file => file.id !== fileId));
      } else {
        throw new Error(data.error || 'Failed to delete file');
      }
    } catch (err) {
      alert(`Erreur lors de la suppression: ${err.message}`);
      console.error('Error deleting file:', err);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier ? Les fichiers qu\'il contient seront déplacés à la racine.')) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.HR_DELETE_FOLDER}?folderId=${folderId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setFolders(folders.filter(folder => folder.id !== folderId));
        fetchData(); // Refresh to update files that were in the folder
      } else {
        throw new Error(data.error || 'Failed to delete folder');
      }
    } catch (err) {
      alert(`Erreur lors de la suppression: ${err.message}`);
      console.error('Error deleting folder:', err);
    }
  };

  // Helper function to get appropriate icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile className="text-gray-500" />;
    
    if (fileType.includes('pdf')) {
      return <FaFilePdf className="text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FaFileWord className="text-blue-500" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FaFileExcel className="text-green-500" />;
    } else if (fileType.includes('image')) {
      return <FaFileImage className="text-purple-500" />;
    } else {
      return <FaFileAlt className="text-gray-500" />;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Fichiers Utiles</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setFolderForm({ name: '', description: '' });
              setFolderError('');
              setShowFolderModal(true);
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaFolder className="mr-2" /> Créer un dossier
          </button>
          <button
            onClick={() => {
              setUploadForm({ title: '', description: '', file: null, folderId: '' });
              setUploadError('');
              setShowUploadModal(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Ajouter un fichier
          </button>
        </div>
      </div>
      
      {/* View Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setCurrentView('folders')}
          className={`px-4 py-2 font-medium text-sm flex items-center ${currentView === 'folders' 
            ? 'border-b-2 border-blue-500 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FaFolder className="mr-2" /> Dossiers
        </button>
        <button
          onClick={() => setCurrentView('files')}
          className={`px-4 py-2 font-medium text-sm flex items-center ${currentView === 'files' 
            ? 'border-b-2 border-blue-500 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FaFile className="mr-2" /> Tous les fichiers
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4">
          <p>Erreur: {error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 text-blue-500 hover:underline"
          >
            Réessayer
          </button>
        </div>
      ) : currentView === 'folders' ? (
        // Folders View
        <div>
          {folders.length === 0 ? (
            <div className="text-center text-gray-500 p-8">
              <p>Aucun dossier disponible. Créez des dossiers pour organiser vos fichiers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <div key={folder.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <FaFolderOpen className="text-yellow-500 text-2xl mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">{folder.name}</h3>
                        <p className="text-sm text-gray-500">{folder.description || 'Aucune description'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  {/* Files in this folder */}
                  <div className="mt-4 pl-8 border-t pt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Fichiers dans ce dossier:</h4>
                    {files.filter(file => file.folder_id === folder.id).length === 0 ? (
                      <p className="text-sm text-gray-500">Aucun fichier dans ce dossier</p>
                    ) : (
                      <ul className="space-y-2">
                        {files.filter(file => file.folder_id === folder.id).map(file => (
                          <li key={file.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              {getFileIcon(file.file_type)}
                              <span className="ml-2 text-gray-800">{file.title}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="text-red-600 hover:text-red-900 text-xs"
                            >
                              <FaTrash />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Files without folder */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Fichiers sans dossier</h3>
            {files.filter(file => !file.folder_id).length === 0 ? (
              <p className="text-gray-500">Aucun fichier sans dossier</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fichier</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'ajout</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {files.filter(file => !file.folder_id).map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                              {getFileIcon(file.file_type)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{file.title}</div>
                              <div className="text-sm text-gray-500">{file.filename}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{file.description || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(file.uploaded_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="text-red-600 hover:text-red-900 ml-4"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        // All Files View
        <div className="overflow-x-auto">
          {files.length === 0 ? (
            <div className="text-center text-gray-500 p-8">
              <p>Aucun fichier disponible. Ajoutez des fichiers pour les stagiaires.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fichier</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dossier</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'ajout</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                          {getFileIcon(file.file_type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{file.title}</div>
                          <div className="text-sm text-gray-500">{file.filename}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{file.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {file.folder_name ? (
                        <div className="flex items-center">
                          <FaFolder className="text-yellow-500 mr-2" />
                          <span className="text-sm text-gray-900">{file.folder_name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(file.uploaded_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Ajouter un nouveau fichier</h3>
            
            {uploadError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{uploadError}</span>
              </div>
            )}
            
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Titre *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={uploadForm.title}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={uploadForm.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="folderId">
                  Dossier (optionnel)
                </label>
                <select
                  id="folderId"
                  name="folderId"
                  value={uploadForm.folderId || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">-- Aucun dossier --</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
                  Fichier *
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  onChange={handleFileChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={isUploading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center gap-2"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    'Télécharger'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Créer un dossier</h3>
            
            {folderError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{folderError}</span>
              </div>
            )}
            
            <form onSubmit={handleCreateFolder}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="folderName">
                  Nom du dossier *
                </label>
                <input
                  id="folderName"
                  name="name"
                  type="text"
                  value={folderForm.name}
                  onChange={(e) => setFolderForm({...folderForm, name: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="folderDescription">
                  Description (optionnelle)
                </label>
                <textarea
                  id="folderDescription"
                  name="description"
                  value={folderForm.description}
                  onChange={(e) => setFolderForm({...folderForm, description: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={isCreatingFolder}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center gap-2"
                  disabled={isCreatingFolder}
                >
                  {isCreatingFolder ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Création en cours...
                    </>
                  ) : (
                    'Créer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsefulFilesManager;