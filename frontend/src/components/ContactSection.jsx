import React, { useState } from "react";

export default function ContactSection() {
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");

    if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        setStatus("Merci pour votre message ! Notre équipe vous répondra dans les 24-48 heures.");
        setContactData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
      } else {
        setError("Erreur lors de l'envoi. Veuillez réessayer.");
      }
    } catch (err) {
      setError("Erreur réseau. Veuillez réessayer.");
    }
  };

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Contactez-Nous</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Contactez notre équipe pour toute question concernant notre programme de stage
          </p>
          <div className="w-20 h-1 bg-coke-red mx-auto mt-4"></div>
        </div>
        
        <div className="mt-12 grid md:grid-cols-2 gap-10 items-stretch">
          <div className="bg-white rounded-xl shadow-lg p-8 h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Contactez-Nous</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-2">Nom</label>
                <input 
                  type="text" 
                  name="name"
                  value={contactData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  required 
                />
              </div>
              <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={contactData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  required 
                />
              </div>
              <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-2">Sujet</label>
                <input 
                  type="text" 
                  name="subject"
                  value={contactData.subject}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  required 
                />
              </div>
              <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-2">Message</label>
                <textarea 
                  rows="4" 
                  name="message"
                  value={contactData.message}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coke-red focus:border-transparent" 
                  required
                ></textarea>
              </div>
              
              {error && <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>}
              {status && <div className="mb-4 text-green-600 font-semibold text-center">{status}</div>}
              
              <button 
                type="submit" 
                className="coke-gradient text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-coke-dark transition"
              >
                Envoyer le Message
              </button>
            </form>
          </div>
          
          <div className="h-full">
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
              <div className="bg-gradient-to-br from-coke-red to-gray-900 flex flex-col p-8 text-white h-full">
                <h3 className="text-2xl font-bold mb-4">Siège Social SBGS</h3>
                <ul className="space-y-5">
                  <li className="flex items-start">
                    <div className="bg-coke-light w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-map-marker-alt text-coke-red"></i>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Adresse</h4>
                      <p className="opacity-80">Sté Des Boissons Gazeuses Du Souss Coca-Cola, Rte De Marrakech<br />Agadir 80000</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-coke-light w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-phone-alt text-coke-red"></i>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Téléphone</h4>
                      <p className="opacity-80">+212 5288-33333</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-coke-light w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-envelope text-coke-red"></i>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Email</h4>
                      <p className="opacity-80">stage@sbgs.ma</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-coke-light w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-clock text-coke-red"></i>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Heures de Bureau</h4>
                      <p className="opacity-80">Lundi - Vendredi : 8h - 19h30 <br /> Samedi : 8h - 18h </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 