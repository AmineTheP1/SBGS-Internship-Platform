import React, { useState } from 'react';
import API_ENDPOINTS from '../config/api.js';

export default function AnnouncementForm() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      setStatus('Veuillez remplir tous les champs');
      return;
    }
    
    setLoading(true);
    setStatus('Envoi en cours...');
    
    try {
      const response = await fetch(API_ENDPOINTS.HR_SEND_ANNOUNCEMENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subject,
          message
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.message);
        setSubject('');
        setMessage('');
      } else {
        setStatus(`Erreur: ${data.error || 'Une erreur est survenue'}`);
      }
    } catch (error) {
      setStatus('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {status && (
        <div className={`mb-6 p-4 rounded-lg ${status.includes('succès') || status.includes('envoyée') ? 'bg-green-100 text-green-700' : status === 'Envoi en cours...' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
          {status}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Sujet de l'annonce
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent"
            placeholder="Ex: Information importante pour tous les stagiaires"
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="8"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent"
            placeholder="Saisissez votre message ici..."
            disabled={loading}
          ></textarea>
          <p className="mt-2 text-sm text-gray-500">
            Ce message sera envoyé à tous les stagiaires dont la candidature a été acceptée.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-coke-red text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Envoyer l'annonce
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}