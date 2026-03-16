import React, { useState } from 'react';
import {
  SparklesIcon,
  ListBulletIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import GestionPromocionesTab from './GestionPromocionesTab';
import EstadisticasTab from './EstadisticasTab';

const TABS = [
  { id: 'gestion',      label: 'Gestión de Promociones', icon: ListBulletIcon, component: GestionPromocionesTab },
  { id: 'estadisticas', label: 'Estadísticas',           icon: ChartBarIcon,   component: EstadisticasTab       },
];

const PromocionesPage = () => {
  const [activeTab, setActiveTab] = useState('gestion');

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <SparklesIcon className="w-8 h-8 text-[#7B1FA2]" />
              <h1 className="text-3xl font-bold text-gray-900">Promociones</h1>
            </div>
            <p className="text-sm text-gray-500">
              Gestiona descuentos y estadísticas de promociones
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-all duration-200 outline-none ${
                  isActive
                    ? 'border-[#7B1FA2] text-[#7B1FA2]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
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