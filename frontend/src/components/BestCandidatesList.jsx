import React, { useState, useEffect } from 'react';
import InterviewProposalModal from './InterviewProposalModal';

const BestCandidatesList = ({ candidates }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const candidatesPerPage = 3; // Show 3 candidates per page

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Excellent':
        return 'text-green-600';
      case 'Très bien':
        return 'text-blue-600';
      case 'Bien':
        return 'text-teal-600';
      case 'Moyen':
        return 'text-orange-500';
      case 'Insuffisant':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const toggleComments = (cdtid) => {
    setExpandedComments(prev => ({
      ...prev,
      [cdtid]: !prev[cdtid]
    }));
  };

  const handleProposeInterview = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  // Calculate total pages
  const totalPages = Math.ceil(candidates.length / candidatesPerPage);
  
  // Get current page candidates
  const currentCandidates = candidates.slice(
    currentPage * candidatesPerPage,
    (currentPage + 1) * candidatesPerPage
  );

  if (!candidates || candidates.length === 0) {
    return (
      <div className="text-center py-4">
        <p>Aucun ancien stagiaire avec évaluation trouvé.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden text-left">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Nom
              </th>
              <th scope="col" className="px-4 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Période de Stage
              </th>
              <th scope="col" className="px-4 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Évaluation
              </th>
              <th scope="col" className="px-4 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Commentaires
              </th>
              <th scope="col" className="px-4 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentCandidates.map((candidate) => (
              <tr key={candidate.cdtid} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div>
                    <div className="font-medium text-gray-900 text-base">{candidate.prenom} {candidate.nom}</div>
                    <div className="text-sm text-gray-500 mt-1">{candidate.email}</div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  <div className="font-medium">
                    {candidate.date_debut_formatted || candidate.date_debut || 'Non défini'} - {candidate.date_fin_formatted || candidate.date_fin || 'Non défini'}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <span className={`font-medium text-base ${getRatingColor(candidate.niveau)}`}>
                      {candidate.niveau}
                    </span>
                    <span className="ml-2 text-sm text-gray-600">
                      ({candidate.percentage}%)
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <div className={`text-sm text-gray-700 ${expandedComments[candidate.cdtid] ? '' : 'line-clamp-2'}`}>
                      {candidate.commentaires}
                    </div>
                    {candidate.commentaires && candidate.commentaires.length > 100 && (
                      <button 
                        onClick={() => toggleComments(candidate.cdtid)}
                        className="text-xs text-coke-red hover:underline mt-2 font-medium"
                      >
                        {expandedComments[candidate.cdtid] ? 'Voir moins' : 'Voir plus'}
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm">
                  <button
                    onClick={() => handleProposeInterview(candidate)}
                    className="px-4 py-2 bg-coke-red text-white rounded-md hover:bg-coke-dark-red transition-colors font-medium"
                  >
                    Proposer entretien
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {candidates.length > candidatesPerPage && (
        <div className="flex justify-between items-center mt-4 px-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-sm"
            >
              &lt; Précédent
            </button>
            
            <span className="text-sm">
              Page {currentPage + 1} / {totalPages}
            </span>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-sm"
            >
              Suivant &gt;
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <InterviewProposalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          candidate={selectedCandidate}
        />
      )}
    </div>
  );
};

export default BestCandidatesList;