import React, { useState } from 'react';
import API_ENDPOINTS from '../config/api';
import axios from 'axios';

const InterviewProposalModal = ({ isOpen, onClose, candidate }) => {
  const [subject, setSubject] = useState("Proposition d'entretien - SBGS");
  const [emailContent, setEmailContent] = useState(
    `Bonjour ${candidate?.prenom || ''} ${candidate?.nom || ''},\n\n` +
    `Suite à votre excellent stage chez SBGS, nous serions ravis de vous proposer un entretien pour un poste au sein de notre entreprise.\n\n` +
    `Pourriez-vous nous indiquer vos disponibilités pour un entretien dans les prochains jours ?\n\n` +
    `Cordialement,\n` +
    `L'équipe RH de SBGS`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post(API_ENDPOINTS.HR_SEND_INTERVIEW_PROPOSAL, {
        cdtid: candidate.cdtid,
        emailContent,
        subject
      }, { withCredentials: true });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.data.error || "Une erreur s'est produite lors de l'envoi de l'email.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur s'est produite lors de l'envoi de l'email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <i className="fas fa-times"></i>
        </button>

        <h2 className="text-2xl font-bold mb-4 text-coke-red">
          Proposition d'entretien
        </h2>
        
        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>Email envoyé avec succès !</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="mb-2">
                <span className="font-semibold">Destinataire:</span> {candidate?.prenom} {candidate?.nom} ({candidate?.email})
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Sujet
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coke-red"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="emailContent" className="block text-sm font-medium text-gray-700 mb-1">
                Contenu de l'email
              </label>
              <textarea
                id="emailContent"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows="10"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coke-red"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 coke-gradient text-white rounded-md hover:opacity-90 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer la proposition"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InterviewProposalModal;