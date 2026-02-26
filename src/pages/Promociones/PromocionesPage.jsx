import React, { useState } from 'react';
import {
  SparklesIcon,
  ListBulletIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import GestionPromocionesTab from './GestionPromocionesTab';
import EstadisticasTab from './EstadisticasTab';

const TABS = [
  { id: 'gestion',      label: 'Gestión de Promociones', icon: ListBulletIcon,  component: GestionPromocionesTab },
  { id: 'estadisticas', label: 'Estadísticas',           icon: ChartBarIcon,    component: EstadisticasTab },
];

const PromocionesPage = () => {
  const [activeTab, setActiveTab] = useState('gestion');

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E91E63] to-[#F06292] flex items-center justify-center shadow-md">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Promociones</h1>
              <p className="text-xs text-gray-500">Gestión de descuentos y promociones especiales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-200 outline-none ${
                    isActive
                      ? 'border-[#E91E63] text-[#E91E63]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default PromocionesPage;
