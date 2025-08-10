import React, { useState } from 'react';
import API_ENDPOINTS from '../config/api';

const InternEvaluationForm = ({ candidateInfo, rapportid, resid, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    technical_skills_score: 0,
    work_quality_score: 0,
    timeliness_score: 0,
    teamwork_score: 0,
    initiative_score: 0,
    communication_score: 0,
    supervisor_comments: ''
  });

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('score') ? parseInt(value) : value
    }));
  };

  const calculateTotal = () => {
    const {
      technical_skills_score,
      work_quality_score,
      timeliness_score,
      teamwork_score,
      initiative_score,
      communication_score
    } = formData;

    return technical_skills_score + work_quality_score + timeliness_score + 
           teamwork_score + initiative_score + communication_score;
  };

  const calculatePercentage = () => {
    return (calculateTotal() / 60) * 100;
  };

  const getRatingLevel = () => {
    const percentage = calculatePercentage();
    if (percentage >= 90) return "Excellent";
    if (percentage >= 80) return "Très bien";
    if (percentage >= 70) return "Bien";
    if (percentage >= 60) return "Moyen";
    return "Insuffisant";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Envoi en cours...');

    try {
      const response = await fetch(API_ENDPOINTS.SUPERVISOR_EVALUATE_INTERN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          cdtid: candidateInfo.cdtid,
          rapportid: rapportid,
          resid: resid
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('Évaluation enregistrée avec succès!');
        if (onSuccess) onSuccess();
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setStatus(`Erreur: ${data.error}`);
      }
    } catch (error) {
      setStatus('Erreur lors de l\'envoi de l\'évaluation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Fiche d'évaluation du stagiaire
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">Informations du stagiaire</h3>
        <p><span className="font-medium">Nom:</span> {candidateInfo.nom}</p>
        <p><span className="font-medium">Prénom:</span> {candidateInfo.prenom}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Critères d'évaluation (0-10)</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Compétences techniques */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compétences techniques
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    name="technical_skills_score"
                    value={formData.technical_skills_score}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-lg font-semibold">{formData.technical_skills_score}</span>
                </div>
              </div>

              {/* Qualité du travail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualité du travail rendu
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    name="work_quality_score"
                    value={formData.work_quality_score}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-lg font-semibold">{formData.work_quality_score}</span>
                </div>
              </div>

              {/* Respect des délais */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Respect des délais
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    name="timeliness_score"
                    value={formData.timeliness_score}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-lg font-semibold">{formData.timeliness_score}</span>
                </div>
              </div>

              {/* Travail en équipe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité à travailler en équipe
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    name="teamwork_score"
                    value={formData.teamwork_score}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-lg font-semibold">{formData.teamwork_score}</span>
                </div>
              </div>

              {/* Autonomie et initiative */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autonomie et initiative
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    name="initiative_score"
                    value={formData.initiative_score}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-lg font-semibold">{formData.initiative_score}</span>
                </div>
              </div>

              {/* Communication */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Communication professionnelle
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    name="communication_score"
                    value={formData.communication_score}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-lg font-semibold">{formData.communication_score}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé des scores */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Résumé</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Score total</p>
                <p className="text-xl font-bold">{calculateTotal()}/60</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pourcentage</p>
                <p className="text-xl font-bold">{calculatePercentage().toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Niveau</p>
                <p className="text-xl font-bold">{getRatingLevel()}</p>
              </div>
            </div>
          </div>

          {/* Commentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires du superviseur
            </label>
            <textarea
              name="supervisor_comments"
              value={formData.supervisor_comments}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coke-red"
              placeholder="Commentaires, observations, recommandations..."
            ></textarea>
          </div>

          {status && (
            <div className={`p-3 rounded-lg ${status.includes('succès') ? 'bg-green-100 text-green-700' : status.includes('Erreur') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              {status}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-coke-red text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Envoi...' : 'Soumettre l\'évaluation'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InternEvaluationForm;