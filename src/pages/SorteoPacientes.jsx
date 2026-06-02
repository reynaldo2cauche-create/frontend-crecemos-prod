// SorteoPacientes.jsx - Solo Gestión de Sorteos
import React from 'react';
import GestionSorteoManual from '../components/Sorteo/GestionSorteoManual';

const SorteoPacientes = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-12">
        <GestionSorteoManual />
      </div>
    </div>
  );
};

export default SorteoPacientes;
