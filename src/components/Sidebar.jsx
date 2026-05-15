import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ROLES_NAMES, ROLES } from '../constants/roles';
import NotificacionesGlobales from './NotificacionesGlobales';
import { useGeofencing } from '../hooks/useGeofencing';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
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
  ChevronRightIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  GiftIcon,
  CubeIcon,
  TagIcon,
  TruckIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  SparklesIcon,
  RectangleGroupIcon,
  BuildingOfficeIcon,
  UsersIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';

export const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) return { isCollapsed: false };
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Cada sección tiene su propio ícono y es un item colapsable
const menuSections = [
  {
    title: 'Admisión y Ventas',
    icon: ShoppingCartIcon,
    roles: [ROLES.ADMINISTRADOR, ROLES.ADMISION],
    items: [
      { text: 'Venta de servicios',  path: '/intranet/ventas/servicios',  icon: ShoppingCartIcon },
      { text: 'Promociones',         path: '/intranet/promociones',        icon: SparklesIcon },
      { text: 'Convenios',           path: '/intranet/convenios',          icon: ShieldCheckIcon },
      { text: 'Certificaciones',     path: '/intranet/archivos-oficiales', icon: DocumentCheckIcon },
      { text: 'Venta de productos',  path: '/intranet/ventas/productos',   icon: CubeIcon },
      { text: 'Tarifario',           path: '/intranet/tarifario',          icon: CurrencyDollarIcon },
      { text: 'Historial de ventas', path: '/intranet/ventas/historial',   icon: ClipboardDocumentCheckIcon },
    ],
  },
  {
    title: 'Operaciones Clínicas',
    icon: CalendarDaysIcon,
    roles: [ROLES.ADMINISTRADOR, ROLES.ADMISION, ROLES.TERAPEUTA],
    items: [
      { text: 'Agenda',    path: '/intranet/agenda',         icon: CalendarDaysIcon },
      { text: 'Pacientes', path: '/intranet/lista-pacientes', icon: UserGroupIcon },
      {
        text: 'Informes', path: '/intranet/informes', icon: DocumentChartBarIcon,
        roles: [ROLES.ADMINISTRADOR, ROLES.ADMISION],
      },
      {
        text: 'Asistencias', icon: ClipboardDocumentCheckIcon, isDropdown: true,
        roles: [ROLES.ADMINISTRADOR, ROLES.ADMISION],
        subItems: [
          { text: 'Por Terapeuta',    path: '/intranet/asistencias/terapeuta',        icon: UserIcon },
          { text: 'Por Paciente',     path: '/intranet/asistencias/paciente',          icon: UserGroupIcon },
          { text: 'Inconsistencias',  path: '/intranet/asistencias/inconsistencias',   icon: ShieldCheckIcon, adminOnly: true },
          { text: 'Sesiones',         path: '/intranet/asistencias/sesiones',          icon: ChartBarIcon,    adminOnly: true },
        ],
      },
      {
        text: 'Inventario', icon: CubeIcon, isDropdown: true,
        roles: [ROLES.ADMINISTRADOR, ROLES.ADMISION],
        subItems: [
          { text: 'Productos',          path: '/intranet/inventario/productos',  icon: CubeIcon },
          { text: 'Categorías',         path: '/intranet/inventario/categorias', icon: TagIcon },
          { text: 'Proveedores',        path: '/intranet/inventario/proveedores', icon: TruckIcon },
          { text: 'Reposición de Stock',path: '/intranet/inventario/reposicion', icon: ArrowPathIcon },
          { text: 'Servicios',          path: '/intranet/inventario/servicios',  icon: BanknotesIcon },
        ],
      },
      {
        text: 'Reporte Escolar', path: '/intranet/reportes-evaluaciones', icon: DocumentChartBarIcon,
        roles: [ROLES.ADMINISTRADOR, ROLES.ADMISION],
      },
    ],
  },
  {
    title: 'Marketing',
    icon: BellAlertIcon,
    roles: [ROLES.ADMINISTRADOR],
    items: [
      { text: 'Popup Inicio', path: '/intranet/popup-promocional', icon: BellAlertIcon },
      { text: 'Sorteo',       path: '/intranet/sorteo',            icon: GiftIcon },
      { text: 'Campañas',     path: '/intranet/campanas',          icon: MegaphoneIcon },
    ],
  },
  {
    title: 'CENTRO OPERATIVO',
    icon: RectangleGroupIcon,
    roles: [ROLES.ADMINISTRADOR, ROLES.ADMISION, ROLES.TERAPEUTA, ROLES.RECURSOS_HUMANOS],
    items: [
      { text: 'Centro Operativo', path: '/intranet/centro-operativo', icon: RectangleGroupIcon },
    ],
  },
  {
    title: 'RRHH',
    icon: UsersIcon,
    roles: [ROLES.ADMINISTRADOR, ROLES.RECURSOS_HUMANOS],
    items: [
      { text: 'Postulaciones',      path: '/intranet/postulaciones',        icon: BriefcaseIcon },
      { text: 'Empleados',          path: '/intranet/rrhh/empleados',       icon: UserIcon },
      { text: 'Gratificaciones',    path: '/intranet/rrhh/gratificaciones', icon: CurrencyDollarIcon },
      { text: 'Vacaciones',         path: '/intranet/rrhh/vacaciones',      icon: CalendarIcon },
      { text: 'Historial de Pagos', path: '/intranet/rrhh/historial',       icon: ClockIcon },
      { text: 'Cumpleaños',         path: '/intranet/rrhh/cumpleanos',      icon: GiftIcon },
      { text: 'Dashboard RRHH',     path: '/intranet/rrhh/dashboard',       icon: ChartBarIcon },
    ],
  },
  {
    title: 'Administración y Finanzas',
    icon: BanknotesIcon,
    roles: [ROLES.ADMINISTRADOR],
    items: [
      { text: 'Reporte Financiero', path: '/intranet/ventas/reportes', icon: ChartBarIcon },
      { text: 'Auditoría',          path: '/intranet/auditoria',       icon: ShieldCheckIcon },
    ],
  },
];

const externalItems = [
  {
    text: 'Libro de Reclamaciones',
    path: '/intranet/libro-reclamaciones',
    isReclamaciones: true,
    fullLogo: '/assets/img/librito.png',
    roles: [ROLES.ADMINISTRADOR],
  },
  {
    text: 'Webmail',
    path: 'https://www.crecemos.com.pe:2096/webmaillogout.cgi',
    isExternal: true,
    isWebmail: true,
    fullLogo: '/assets/img/webmail-logo.webp',
  },
  {
    text: 'Izipay',
    path: 'https://secure.micuentaweb.pe/vads-merchant/loginAction.do',
    isExternal: true,
    isIzipay: true,
    fullLogo: '/assets/img/index/izipay.png',
    roles: [ROLES.ADMINISTRADOR, ROLES.ADMISION],
  },
];

const SIDEBAR_BG = '#1a0533';

const Sidebar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});

  const rolesConGeofencing  = [ROLES.TERAPEUTA, ROLES.ADMISION];
  const requiereGeofencing  = rolesConGeofencing.includes(user?.rol?.id);
  const { dentroDelPerimetro, distancia } = useGeofencing(requiereGeofencing, 60000);
  const rutasPermitidasFuera = ['/intranet/agenda', 'webmail'];

  // Auto-abrir la sección que contiene la ruta activa
  useEffect(() => {
    const updates = {};
    menuSections.forEach(section => {
      const hasActive = section.items.some(item =>
        item.path === location.pathname ||
        item.subItems?.some(sub => sub.path === location.pathname)
      );
      if (hasActive) updates[section.title] = true;
    });
    if (Object.keys(updates).length) {
      setOpenSections(prev => ({ ...prev, ...updates }));
    }
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '256px');
  }, [isCollapsed]);

  useEffect(() => { setIsMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileOpen && !e.target.closest('.mobile-sidebar') && !e.target.closest('.mobile-hamburger')) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileOpen]);

  const userRole = user?.rol?.id;

  const getFilteredSections = () => {
    if (!userRole) return menuSections;
    return menuSections
      .filter(s => s.roles.includes(userRole))
      .map(s => ({
        ...s,
        items: s.items
          .filter(item => !item.roles || item.roles.includes(userRole))
          .map(item => ({
            ...item,
            subItems: item.subItems?.filter(sub => !(sub.adminOnly && userRole !== ROLES.ADMINISTRADOR)),
          })),
      }))
      .filter(s => s.items.length > 0);
  };

  const getFilteredExternalItems = () =>
    externalItems.filter(item => !item.roles || item.roles.includes(userRole));

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/intranet');
  };

  const filteredSections     = getFilteredSections();
  const filteredExternalItems = getFilteredExternalItems();

  const isItemBlocked = (item) =>
    requiereGeofencing &&
    !dentroDelPerimetro &&
    !rutasPermitidasFuera.some(r => item.path?.includes(r) || item.text?.toLowerCase().includes(r));

  const handleBlockedClick = () => {
    alert(`⛔ Acceso Restringido\n\nEstás a ${distancia}m del centro.\nEsta sección solo está disponible dentro del centro de labores (100m).\n\nPuedes acceder a:\n- Agenda\n- Webmail`);
  };

  const isSectionActive = (section) =>
    section.items.some(item =>
      item.path === location.pathname ||
      item.subItems?.some(sub => sub.path === location.pathname)
    );

  // ── Render: item hijo dentro de una sección ─────────────────────────────────
  const renderSubItem = (item, key) => {
    if (item.isDropdown) {
      const isOpen      = openDropdowns[item.text];
      const anySubActive = item.subItems?.some(s => location.pathname === s.path);
      return (
        <div key={key}>
          <button
            onClick={() => setOpenDropdowns(p => ({ ...p, [item.text]: !p[item.text] }))}
            className={`w-full flex items-center gap-2 pl-4 pr-2.5 py-2 rounded-xl transition-all duration-150 outline-none group ${
              anySubActive ? 'text-white font-bold' : 'text-white/60 hover:text-white hover:font-semibold'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-60" />
            <span className="text-[14px] flex-1 text-left">{item.text}</span>
            <ChevronDownIcon className={`w-3.5 h-3.5 opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {isOpen && (
            <div className="ml-6 space-y-0.5 mt-0.5">
              {item.subItems.map(sub => {
                const isActive = location.pathname === sub.path;
                return (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    className={`flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-lg transition-all duration-150 outline-none ${
                      isActive ? 'text-white font-bold' : 'text-white/50 hover:text-white hover:font-semibold'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-current flex-shrink-0 opacity-60" />
                    <span className="text-[13px]">{sub.text}</span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#A3C644]" />}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    const isActive    = location.pathname === item.path;
    const bloqueado   = isItemBlocked(item);
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={bloqueado ? (e) => { e.preventDefault(); handleBlockedClick(); } : undefined}
        className={`flex items-center gap-2 pl-4 pr-2.5 py-2 rounded-xl transition-all duration-150 outline-none ${
          bloqueado   ? 'opacity-40 cursor-not-allowed text-white/50' :
          isActive    ? 'text-white font-bold' :
          'text-white/60 hover:text-white hover:font-semibold'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-60" />
        <span className="text-[14px] flex-1">{item.text}</span>
        {isActive && !bloqueado && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#A3C644]" />}
        {bloqueado && <span className="text-xs">🔒</span>}
      </Link>
    );
  };

  // ── Render: sección como item colapsable con ícono ───────────────────────────
  const renderSection = (section, idx) => {
    const Icon     = section.icon;
    const isActive = isSectionActive(section);
    const isOpen   = isCollapsed || openSections[section.title];

    return (
      <div key={section.title}>
        <button
          onClick={() => {
            if (!isCollapsed) setOpenSections(p => ({ ...p, [section.title]: !p[section.title] }));
          }}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all duration-200 group outline-none ${
            isActive
              ? 'bg-white/10 text-white'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          } ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? section.title : ''}
          style={{ animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both` }}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            isActive ? 'bg-white/10' : 'group-hover:bg-white/10'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <>
              <span className="font-bold text-[16px] flex-1 text-left leading-snug">{section.title}</span>
              <ChevronRightIcon className={`w-4 h-4 opacity-60 flex-shrink-0 transition-transform duration-300 ${openSections[section.title] ? 'rotate-90' : ''}`} />
            </>
          )}
        </button>

        {/* Sub-items */}
        {!isCollapsed && openSections[section.title] && (
          <div className="mt-0.5 mb-1 space-y-0.5">
            {section.items.map((item, i) => renderSubItem(item, item.path || `${section.title}-${i}`))}
          </div>
        )}
      </div>
    );
  };

  // ── Render: acceso rápido como tarjeta blanca ────────────────────────────────
  const renderExternalItem = (item, idx) => {
    const bloqueado = isItemBlocked(item);
    const cardClass = `flex items-center justify-center px-3 py-2.5 rounded-xl bg-white shadow-sm transition-all duration-200 ${
      bloqueado ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:bg-gray-50 cursor-pointer'
    }`;

    const inner = (
      <>
        <img
          src={item.fullLogo} alt={item.text}
          className={`object-contain flex-shrink-0 ${isCollapsed ? 'w-7 h-7' : 'h-8 w-full max-h-9'}`}
          style={{ filter: bloqueado ? 'grayscale(100%)' : 'none' }}
        />
      </>
    );

    if (item.isWebmail || item.isIzipay) {
      return (
        <a key={item.text} href={bloqueado ? undefined : item.path}
          target="_blank" rel="noopener noreferrer"
          onClick={bloqueado ? e => { e.preventDefault(); handleBlockedClick(); } : undefined}
          className={cardClass}
          style={{ animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both` }}
          title={item.text}
        >{inner}</a>
      );
    }
    if (item.isReclamaciones) {
      return (
        <Link key={item.text} to={item.path}
          onClick={bloqueado ? e => { e.preventDefault(); handleBlockedClick(); } : undefined}
          className={cardClass}
          style={{ animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both` }}
          title={item.text}
        >{inner}</Link>
      );
    }
    return null;
  };

  return (
    <>
      {/* Hamburger móvil */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="mobile-hamburger fixed top-4 left-4 z-50 lg:hidden w-12 h-12 rounded-xl shadow-md flex items-center justify-center text-white transition-all active:scale-95"
        style={{ backgroundColor: SIDEBAR_BG, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', minWidth: '48px', minHeight: '48px' }}
      >
        {isMobileOpen
          ? <XMarkIcon className="w-6 h-6 pointer-events-none" />
          : <Bars3Icon className="w-6 h-6 pointer-events-none" />}
      </button>

      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      <div
        className={`mobile-sidebar fixed top-0 left-0 h-screen z-50 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{
          backgroundColor: SIDEBAR_BG,
          borderRight: '1px solid rgba(255,255,255,0.08)',
          transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.3s ease',
        }}
      >
        {/* Logo — tarjeta blanca sobre fondo morado */}
        <div className="p-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {isCollapsed ? (
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm overflow-hidden">
              <img src="/videologo.png" alt="Logo" className="w-10 h-10 object-contain" />
            </div>
          ) : (
            <div className="bg-white rounded-xl px-3 py-2 flex items-center justify-center shadow-sm overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
              <img src="/logo-text-short.png" alt="Logo Crecemos" className="h-11 w-auto object-contain" />
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute top-7 -right-3 w-6 h-6 rounded-full items-center justify-center text-white/50 hover:text-white transition-all duration-300 shadow-md outline-none"
          style={{ backgroundColor: '#2d0a52', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <svg className={`w-3 h-3 transition-transform duration-400 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
          <style>{`
            nav::-webkit-scrollbar { width: 4px; }
            nav::-webkit-scrollbar-track { background: transparent; }
            nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          `}</style>

          <div className="space-y-0.5">
            {/* Centro Operativo — temporalmente oculto */}
            {/* {(userRole === ROLES.ADMINISTRADOR || userRole === ROLES.ADMISION || userRole === ROLES.TERAPEUTA || userRole === ROLES.RECURSOS_HUMANOS) && (
              <Link
                to="/intranet/centro-operativo"
                className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all duration-200 group outline-none ${
                  location.pathname === '/intranet/centro-operativo'
                    ? 'bg-white/10 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? 'Centro Operativo' : ''}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  location.pathname === '/intranet/centro-operativo' ? 'bg-white/10' : 'group-hover:bg-white/10'
                }`}>
                  <BuildingOfficeIcon className="w-5 h-5" />
                </div>
                {!isCollapsed && <span className="font-bold text-[16px] flex-1">Centro Operativo</span>}
              </Link>
            )} */}

            {/* Label menú principal */}
            {!isCollapsed && (
              <p className="text-[10px] font-bold uppercase tracking-wider px-2.5 pt-4 pb-1 select-none" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Menú Principal
              </p>
            )}
            {isCollapsed && <div className="my-2 mx-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />}

            {/* Secciones colapsables */}
            <div className="space-y-0.5">
              {filteredSections.map((section, idx) => renderSection(section, idx))}
            </div>

            {/* Accesos rápidos — solo cuando está expandido */}
            {filteredExternalItems.length > 0 && !isCollapsed && (
              <div>
                <div className="my-3 mx-1" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
                <p className="text-[10px] font-bold uppercase tracking-wider px-2.5 pb-2 select-none" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Accesos Rápidos
                </p>
                <div className="space-y-2 px-1">
                  {filteredExternalItems.map((item, i) => renderExternalItem(item, i))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Perfil de usuario */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Link to="/intranet/mi-perfil"
                className="w-full flex items-center justify-center p-2.5 rounded-xl hover:bg-white/10 transition-all outline-none"
                title={`${user.nombres} ${user.apellidos}`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center font-bold text-white text-xs shadow-md">
                    {user.nombres?.[0]}{user.apellidos?.[0]}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#A3C644] rounded-full animate-pulse" style={{ border: '2px solid #1a0533' }} />
                </div>
              </Link>
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center p-2.5 rounded-xl transition-all outline-none text-white/40 hover:text-red-400 hover:bg-red-500/10"
                title="Cerrar sesión"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link to="/intranet/mi-perfil"
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-all group outline-none"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center font-bold text-white text-sm shadow-md">
                    {user.nombres?.[0]}{user.apellidos?.[0]}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#A3C644] rounded-full animate-pulse" style={{ border: '2px solid #1a0533' }} />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="font-semibold text-sm text-white truncate">{user.nombres} {user.apellidos}</p>
                  <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{ROLES_NAMES[user.rol?.id] || 'Sin rol'}</p>
                </div>
                <UserCircleIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
              </Link>
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all outline-none text-white/40 hover:text-red-400 hover:bg-red-500/10"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const SidebarContentWrapper = ({ children }) => {
  const { isCollapsed } = useSidebar();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .sidebar-content-wrapper { margin-left: var(--sidebar-width, 256px); transition: margin-left 0.4s cubic-bezier(0.4,0,0.2,1); }
          .intranet-topbar { left: var(--sidebar-width, 256px); transition: left 0.4s cubic-bezier(0.4,0,0.2,1); }
        }
        @media (max-width: 1023px) {
          .sidebar-content-wrapper { margin-left: 0; }
          .intranet-topbar { display: none !important; }
        }
      `}</style>

      {/* Top bar */}
      <div
        className="intranet-topbar fixed top-0 right-0 z-30 h-14 flex items-center justify-end px-6 gap-3"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        {/* Campana */}
        <div className="flex items-center">
          <NotificacionesGlobales panelClassName="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl z-50 border border-purple-100 flex flex-col overflow-hidden" />
        </div>

        {/* Separador */}
        <div className="w-px h-5 flex-shrink-0 bg-gray-200" />

        {/* Perfil */}
        <Link
          to="/intranet/mi-perfil"
          className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors duration-150 hover:bg-gray-50 group"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center font-semibold text-white text-xs">
              {user.nombres?.[0]}{user.apellidos?.[0]}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#A3C644] rounded-full" style={{ border: '1.5px solid white' }} />
          </div>

          {/* Nombre + rol */}
          <div className="text-left hidden xl:block leading-none">
            <p className="text-sm font-semibold text-gray-800">{user.nombres} {user.apellidos}</p>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: '#9333ea' }}>{ROLES_NAMES[user.rol?.id] || 'Sin rol'}</p>
          </div>

          <ChevronDownIcon className="w-3.5 h-3.5 flex-shrink-0 text-purple-400 group-hover:text-purple-600 transition-colors" />
        </Link>
      </div>

      <div className="sidebar-content-wrapper min-h-screen flex flex-col">
        {/* Espaciado para el top bar en desktop */}
        <div className="hidden lg:block h-14 flex-shrink-0" />
        <div className="flex-1">{children}</div>
        <footer className="mt-auto bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A3C644]" />
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                © {new Date().getFullYear()} <span className="font-bold text-gray-900">Centro Crecemos</span>
              </p>
            </div>
            <a href="https://vaxasys.com" target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 hover:bg-white border border-gray-200 transition-all hover:shadow-md">
              <span className="text-xs sm:text-sm text-gray-500 group-hover:text-[#7B1FA2] transition-colors">Desarrollado por</span>
              <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] bg-clip-text text-transparent">vaxa</span>
            </a>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Sidebar;
