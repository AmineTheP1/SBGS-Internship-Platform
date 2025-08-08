import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaFileAlt } from 'react-icons/fa';

const InternEvaluationDisplay = ({ evaluation }) => {
  if (!evaluation) return null;

  const {
    competences_techniques,
    qualite_travail,
    respect_delais,
    travail_equipe,
    autonomie_initiative,
    communication,
    commentaires,
    total_score,
    percentage,
    niveau,
    date_debut_formatted,
    date_fin_formatted,
    date_evaluation_formatted,
    supervisor_nom,
    supervisor_prenom,
    departement
  } = evaluation;

  // Fonction pour déterminer la couleur en fonction du score
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Fonction pour déterminer la couleur du niveau
  const getLevelColor = (level) => {
    switch (level) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Très bien': return 'bg-blue-100 text-blue-800';
      case 'Bien': return 'bg-teal-100 text-teal-800';
      case 'Moyen': return 'bg-yellow-100 text-yellow-800';
      case 'Insuffisant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <FaFileAlt className="text-coke-red text-2xl mr-3" />
        <h2 className="text-xl font-bold text-gray-800">Fiche d'évaluation du stagiaire</h2>
      </div>

      {/* En-tête */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Période de stage</p>
            <p className="font-medium">{date_debut_formatted} – {date_fin_formatted}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Département / Service</p>
            {/*<p className="font-medium">{departement && departement !== 'À définir' ? departement : 'Non spécifié'}</p>*/}
            <p className="font-medium">Informatique</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Superviseur</p>
            <p className="font-medium">{supervisor_prenom} {supervisor_nom}</p>
          </div>
        </div>
      </div>

      {/* Tableau d'évaluation */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Évaluation des compétences</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Critère</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Score (0-10)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-900">Compétences techniques</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`font-bold ${getScoreColor(competences_techniques)}`}>{competences_techniques}/10</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-900">Qualité du travail rendu</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`font-bold ${getScoreColor(qualite_travail)}`}>{qualite_travail}/10</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-900">Respect des délais</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`font-bold ${getScoreColor(respect_delais)}`}>{respect_delais}/10</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-900">Capacité à travailler en équipe</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`font-bold ${getScoreColor(travail_equipe)}`}>{travail_equipe}/10</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-900">Autonomie et initiative</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`font-bold ${getScoreColor(autonomie_initiative)}`}>{autonomie_initiative}/10</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-900">Communication professionnelle</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`font-bold ${getScoreColor(communication)}`}>{communication}/10</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Résumé des scores */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Score total</p>
            <p className="text-xl font-bold">{total_score}/60</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pourcentage</p>
            <p className="text-xl font-bold">{percentage}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Niveau global</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(niveau)}`}>
              {niveau}
            </span>
          </div>
        </div>
      </div>

      {/* Commentaires */}
      {commentaires && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Commentaires du superviseur</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-line">{commentaires}</p>
          </div>
        </div>
      )}

      {/* Signature */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Date d'évaluation</p>
            <p className="font-medium">{date_evaluation_formatted}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Signature du superviseur</p>
            <p className="font-medium">{supervisor_prenom} {supervisor_nom}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternEvaluationDisplay;