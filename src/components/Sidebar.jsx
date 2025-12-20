import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROLES_NAMES, ROLES } from '../constants/roles';
// import NotificacionesGlobales from './NotificacionesGlobales';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  UsersIcon,
  BellAlertIcon,
  BriefcaseIcon,
  DocumentCheckIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon,
  ChevronDownIcon,
  CalendarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

// Contexto para compartir el estado del sidebar
export const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return { isCollapsed: false };
  }
  return context;
};

// Provider del contexto del sidebar
export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

const menuItems = [
  { text: 'Agenda', path: '/intranet/agenda', icon: CalendarDaysIcon },
  { text: 'Pacientes', path: '/intranet/lista-pacientes', icon: UserGroupIcon },
  { text: 'Reportes', path: '/intranet/reportes-evaluaciones', icon: DocumentChartBarIcon },
  { text: 'Popup Inicio', path: '/intranet/popup-promocional', icon: BellAlertIcon },
  { text: 'Postulaciones', path: '/intranet/postulaciones', icon: BriefcaseIcon },
  { text: 'Certificaciones', path: '/intranet/archivos-oficiales', icon: DocumentCheckIcon },
  { text: 'Auditoría', path: '/intranet/auditoria', icon: ShieldCheckIcon, adminOnly: true },
  {
    text: 'Recursos Humanos',
    icon: UsersIcon,
    isDropdown: true,
    subItems: [
      { text: 'Empleados', path: '/intranet/rrhh/empleados', icon: UserIcon },
      { text: 'Gratificaciones', path: '/intranet/rrhh/gratificaciones', icon: CurrencyDollarIcon },
      { text: 'Vacaciones', path: '/intranet/rrhh/vacaciones', icon: CalendarIcon },
      { text: 'Historial de Pagos', path: '/intranet/rrhh/historial', icon: ClockIcon },
      { text: 'Dashboard', path: '/intranet/rrhh/dashboard', icon: ChartBarIcon }
    ]
  }
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '80px' : '256px'
    );
  }, [isCollapsed]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileOpen && !e.target.closest('.mobile-sidebar') && !e.target.closest('.mobile-hamburger')) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileOpen]);

  const getFilteredMenuItems = () => {
    if (!user || !user.rol?.id) return menuItems;
    const userRole = user.rol.id;

    if (userRole === ROLES.TERAPEUTA) {
      return menuItems.filter(item =>
        item.text === 'Agenda' || item.text === 'Pacientes'
      );
    }

    if (userRole === ROLES.ADMISION) {
      return menuItems.filter(item =>
        item.text === 'Agenda' || item.text === 'Pacientes' || item.text === 'Certificaciones'
      );
    }

    // Filtrar items solo para admin
    return menuItems.filter(item => {
      if (item.adminOnly && userRole !== ROLES.ADMINISTRADOR) {
        return false;
      }
      return true;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/intranet');
  };

  const filteredMenuItems = getFilteredMenuItems();

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="mobile-hamburger fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all"
      >
        {isMobileOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Overlay para móvil */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`mobile-sidebar fixed top-0 left-0 h-screen transition-all duration-500 ease-in-out z-50 flex flex-col shadow-lg ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #e9ecef',
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease'
        }}
      >
        {/* Header: Logo + Notificaciones */}
        <div className="p-3" style={{ borderBottom: '1px solid #e9ecef' }}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center overflow-hidden">
              <div className={`transition-all duration-500 ease-in-out ${isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-75 w-0'}`}>
                {isCollapsed && (
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center">
                    <img
                      src="/videologo.png"
                      alt="Logo"
                      className="w-12 h-12 object-contain transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                )}
              </div>
              <div className={`transition-all duration-500 ease-in-out ${!isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-75 w-0 absolute'}`}>
                {!isCollapsed && (
                  <img
                    src="/logo-text-short.png"
                    alt="Logo Crecemos"
                    className="h-10 w-auto object-contain transition-transform duration-500 hover:scale-105"
                  />
                )}
              </div>
            </div>

            {/* Notificaciones - Solo para administradores */}
            {user?.rol?.id === ROLES.ADMINISTRADOR && (
              <div className="flex-shrink-0">
                {/* <NotificacionesGlobales /> */}
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute top-7 -right-3 w-6 h-6 bg-white rounded-full items-center justify-center text-gray-400 hover:text-[#7B1FA2] hover:bg-purple-50 hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg outline-none"
          style={{
            border: '1px solid #e5e7eb',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <svg
            className={`w-3 h-3 transition-transform duration-500 ease-in-out ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <style>{`
            nav::-webkit-scrollbar {
              width: 6px;
            }
            nav::-webkit-scrollbar-track {
              background: transparent;
            }
            nav::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 10px;
            }
            nav::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
            .menu-item {
              background: transparent;
              border: none;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .menu-item:hover {
              background-color: #e9ecef;
              transform: translateX(2px);
            }
            .menu-item.active {
              background-color: #e9ecef;
            }
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateX(-10px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}</style>
          <div className="space-y-1">
            {filteredMenuItems.map((item, index) => {
              const Icon = item.icon;

              if (item.isDropdown) {
                const isOpen = openDropdowns[item.text];
                const isAnySubItemActive = item.subItems?.some(subItem => location.pathname === subItem.path);

                return (
                  <div key={item.text}>
                    <button
                      onClick={() => setOpenDropdowns(prev => ({ ...prev, [item.text]: !prev[item.text] }))}
                      className={`menu-item w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all duration-300 group relative outline-none ${
                        isAnySubItemActive
                          ? 'text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.text : ''}
                      style={{
                        animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isAnySubItemActive
                          ? 'bg-[#7B1FA2] text-white shadow-md scale-105'
                          : 'bg-transparent text-gray-500 group-hover:text-[#7B1FA2] group-hover:bg-purple-50 group-hover:scale-110'
                      }`}>
                        <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span
                        className={`font-semibold text-sm flex-1 text-left transition-all duration-500 overflow-hidden ${
                          isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
                        }`}
                      >
                        {item.text}
                      </span>
                      {!isCollapsed && (
                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      )}
                    </button>

                    {!isCollapsed && isOpen && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((subItem, subIndex) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = location.pathname === subItem.path;

                          return (
                            <button
                              key={subItem.text}
                              onClick={() => navigate(subItem.path)}
                              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-300 group outline-none ${
                                isSubActive
                                  ? 'bg-purple-50 text-[#7B1FA2]'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              <SubIcon className="w-4 h-4 flex-shrink-0" />
                              <span className="font-medium text-sm">{subItem.text}</span>
                              {isSubActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[#A3C644] flex-shrink-0 ml-auto"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  className={`menu-item ${isActive ? 'active' : ''} w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all duration-300 group relative outline-none ${
                    isActive
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.text : ''}
                  style={{
                    animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`
                  }}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isActive
                      ? 'bg-[#7B1FA2] text-white shadow-md scale-105'
                      : 'bg-transparent text-gray-500 group-hover:text-[#7B1FA2] group-hover:bg-purple-50 group-hover:scale-110'
                  }`}>
                    <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span
                    className={`font-semibold text-sm flex-1 text-left transition-all duration-500 overflow-hidden ${
                      isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
                    }`}
                    style={{
                      animation: !isCollapsed ? `slideIn 0.5s ease-out ${0.2 + index * 0.05}s both` : 'none'
                    }}
                  >
                    {item.text}
                  </span>
                  {!isCollapsed && isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#A3C644] flex-shrink-0"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-3" style={{ borderTop: '1px solid #e9ecef' }}>
          {isCollapsed ? (
            // Vista colapsada - Iconos verticales centrados
            <div className="flex flex-col items-center gap-2">
              {/* Avatar del usuario */}
              <button
                onClick={() => navigate('/intranet/mi-perfil')}
                className="w-full flex items-center justify-center p-2.5 text-gray-500 rounded-xl transition-all duration-300 outline-none hover:scale-110 hover:bg-purple-50"
                style={{
                  border: 'none',
                  background: 'transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                title={user.nombres ? `${user.nombres} ${user.apellidos}` : 'Mi Perfil'}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center font-bold text-white text-xs shadow-md hover:shadow-lg transition-all duration-300">
                    {user.nombres?.[0] || ''}{user.apellidos?.[0] || ''}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#A3C644] rounded-full animate-pulse" style={{ border: '2px solid white' }}></div>
                </div>
              </button>

              {/* Cerrar sesión */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2.5 text-gray-500 rounded-xl transition-all duration-300 outline-none hover:scale-110 hover:rotate-6"
                style={{
                  border: 'none',
                  background: 'transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
                title="Cerrar sesión"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 transition-transform duration-300" />
              </button>
            </div>
          ) : (
            // Vista expandida - Layout horizontal completo
            <div className="space-y-2">
              {/* Botón de perfil completo */}
              <button
                onClick={() => navigate('/intranet/mi-perfil')}
                className="w-full flex items-center gap-3 p-2.5 text-gray-600 rounded-xl transition-all duration-300 group outline-none hover:scale-[1.02]"
                style={{
                  border: 'none',
                  background: 'transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center font-bold text-white text-sm shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                    {user.nombres?.[0] || ''}{user.apellidos?.[0] || ''}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#A3C644] rounded-full animate-pulse" style={{ border: '2px solid white' }}></div>
                </div>
                <div className="flex-1 min-w-0 text-left transition-all duration-500 overflow-hidden">
                  <p className="font-semibold text-sm text-gray-900 truncate transition-all duration-300 group-hover:text-[#7B1FA2]">
                    {user.nombres} {user.apellidos}
                  </p>
                  <p className="text-xs text-gray-500 truncate transition-all duration-300">
                    {ROLES_NAMES[user.rol?.id] || 'Sin rol'}
                  </p>
                </div>
                <UserCircleIcon className="w-4 h-4 text-gray-400 group-hover:text-[#7B1FA2] flex-shrink-0 transition-all duration-300 group-hover:scale-125" />
              </button>

              {/* Botón cerrar sesión */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-2.5 text-gray-500 rounded-xl transition-all duration-300 outline-none hover:scale-[1.02]"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};


// Reemplaza solo el componente SidebarContentWrapper en tu archivo Sidebar.jsx

export const SidebarContentWrapper = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .sidebar-content-wrapper {
            margin-left: var(--sidebar-width, 256px);
            transition: margin-left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
        @media (max-width: 1023px) {
          .sidebar-content-wrapper {
            margin-left: 0;
          }
        }
      `}</style>
      <div className="sidebar-content-wrapper min-h-screen flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        
        {/* Footer Global de Intranet - Estilo Moderno */}
        <footer className="mt-auto bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Copyright */}
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#A3C644]"></div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  © {new Date().getFullYear()} <span className="font-bold text-gray-900">Centro Crecemos</span>
                </p>
              </div>
              
              {/* Desarrollado por */}
              <a 
                href="https://vaxa.com.pe" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 hover:bg-white border border-gray-200 transition-all hover:shadow-md"
              >
                <span className="text-xs sm:text-sm text-gray-500 group-hover:text-[#7B1FA2] transition-colors">
                  Desarrollado por
                </span>
                <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] bg-clip-text text-transparent">
                  vaxa
                </span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};
export default Sidebar;