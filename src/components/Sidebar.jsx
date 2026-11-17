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
  BuildingOfficeIcon,
  UsersIcon,
  MegaphoneIcon,
  ExclamationTriangleIcon,
  InboxArrowDownIcon,
  MagnifyingGlassIcon,
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
    title: 'Administración y Ventas',
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
      { text: 'Mesa de Partes',      path: '/intranet/mesa-partes',        icon: InboxArrowDownIcon },
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
        roles: [ROLES.ADMINISTRADOR],
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
      { text: 'Staff',        path: '/intranet/gestion-staff',     icon: UserGroupIcon },
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
      { text: 'Asistencia y ausencias', path: '/intranet/rrhh/solicitudes', icon: ExclamationTriangleIcon },
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
    path: 'https://lucas.admeli.com:2096/webmaillogout.cgi',
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

const SIDEBAR_BG = '#ffffff';
const HEADER_HEIGHT = 'h-[68px]'; // misma altura para el logo y la barra superior

// Ítem de menú: ocupa todo el ancho, con barra morada a la izquierda cuando está activo
const getItemClass = ({ isActive, isCollapsed, bloqueado }) =>
  `flex items-center gap-6 pl-5 pr-6 py-2.5 border-l-4 rounded-r-2xl transition-all duration-150 outline-none group ${
    isCollapsed ? 'justify-center' : ''
  } ${
    bloqueado ? 'border-transparent opacity-40 cursor-not-allowed text-gray-400' :
    isActive  ? 'border-[#7B1FA2] bg-purple-100/70 text-[#7B1FA2] font-bold' :
                'border-transparent text-gray-700 hover:bg-purple-50/70'
  }`;

const getIconClass = (isActive) =>
  `w-[22px] h-[22px] flex-shrink-0 ${isActive ? 'text-[#7B1FA2]' : 'text-[#8B7FA0] group-hover:text-[#7B1FA2]'}`;

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
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '224px');
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

  // ── Render: ítem de menú (plano, estilo mockup) ─────────────────────────────
  const renderSubItem = (item, key) => {
    if (item.isDropdown) {
      const Icon         = item.icon;
      const isOpen       = openDropdowns[item.text];
      const anySubActive = item.subItems?.some(s => location.pathname === s.path);
      return (
        <div key={key}>
          <button
            onClick={() => setOpenDropdowns(p => ({ ...p, [item.text]: !p[item.text] }))}
            title={isCollapsed ? item.text : ''}
            className={`w-full ${getItemClass({ isActive: anySubActive, isCollapsed })}`}
          >
            {Icon && <Icon className={getIconClass(anySubActive)} />}
            {!isCollapsed && (
              <>
                <span className="text-[15px] font-medium flex-1 text-left">{item.text}</span>
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          {isOpen && !isCollapsed && (
            <div className="ml-12 mr-2 pl-3 mt-0.5 space-y-0.5 border-l border-purple-100">
              {item.subItems.map(sub => {
                const SubIcon  = sub.icon;
                const isActive = location.pathname === sub.path;
                return (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 outline-none ${
                      isActive
                        ? 'bg-purple-100/70 text-[#7B1FA2] font-semibold'
                        : 'text-gray-600 hover:bg-purple-50/70'
                    }`}
                  >
                    {SubIcon && <SubIcon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-[#7B1FA2]' : 'text-[#8B7FA0]'}`} />}
                    <span className="text-sm flex-1">{sub.text}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    const Icon      = item.icon;
    const isActive  = location.pathname === item.path;
    const bloqueado = isItemBlocked(item);
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={bloqueado ? (e) => { e.preventDefault(); handleBlockedClick(); } : undefined}
        title={isCollapsed ? item.text : ''}
        className={getItemClass({ isActive, isCollapsed, bloqueado })}
      >
        {Icon && <Icon className={getIconClass(isActive && !bloqueado)} />}
        {!isCollapsed && <span className={`text-[15px] flex-1 ${isActive && !bloqueado ? 'font-bold' : 'font-medium'}`}>{item.text}</span>}
        {!isCollapsed && bloqueado && <span className="text-xs">🔒</span>}
      </Link>
    );
  };

  // ── Render: sección como grupo plano con etiqueta ───────────────────────────
  const renderSection = (section, idx) => (
    <div key={section.title} style={{ animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both` }}>
      {!isCollapsed ? (
        <p className="text-[12.5px] font-semibold uppercase tracking-wide px-5 pt-6 pb-2 select-none text-gray-600">
          {section.title}
        </p>
      ) : (
        <div className="my-3 mx-3" style={{ borderTop: '1px solid #efeaf6' }} />
      )}
      <div className="space-y-0.5">
        {section.items.map((item, i) => renderSubItem(item, item.path || `${section.title}-${i}`))}
      </div>
    </div>
  );

  // ── Render: acceso rápido como tarjeta blanca ───────────────────────────────
  const renderExternalItem = (item, idx) => {
    const bloqueado = isItemBlocked(item);
    const cardClass = `flex items-center justify-center px-3 py-2 rounded-2xl bg-white border border-gray-200 transition-all duration-200 ${
      bloqueado ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:border-purple-200 cursor-pointer'
    }`;

    const inner = (
      <img
        src={item.fullLogo} alt={item.text}
        className={`object-contain flex-shrink-0 ${isCollapsed ? 'w-7 h-7' : 'h-8 w-full max-h-9'}`}
        style={{ filter: bloqueado ? 'grayscale(100%)' : 'none' }}
      />
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

  const centroOperativoActivo = location.pathname.startsWith('/intranet/centro-operativo');

  return (
    <>
      {/* Hamburger móvil */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="mobile-hamburger fixed top-4 left-4 z-50 lg:hidden w-12 h-12 rounded-xl shadow-md flex items-center justify-center text-white transition-all active:scale-95 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0]"
        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', minWidth: '48px', minHeight: '48px' }}
      >
        {isMobileOpen
          ? <XMarkIcon className="w-6 h-6 pointer-events-none" />
          : <Bars3Icon className="w-6 h-6 pointer-events-none" />}
      </button>

      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      <div
        className={`mobile-sidebar fixed top-0 left-0 h-screen z-50 flex flex-col ${isCollapsed ? 'w-20' : 'w-56'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{
          backgroundColor: SIDEBAR_BG,
          borderRight: '1px solid #ece8f3',
          transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.3s ease',
        }}
      >
        {/* Logo */}
        <div className={`${HEADER_HEIGHT} flex items-center flex-shrink-0 ${isCollapsed ? 'justify-center px-3' : 'pl-6 pr-14'}`} style={{ borderBottom: '1px solid #f2eef8' }}>
          {isCollapsed ? (
            <img src="/videologo.png" alt="Logo" className="w-10 h-10 object-contain" />
          ) : (
            <img src="/logo-text-short.png" alt="Logo Crecemos" className="h-12 w-auto object-contain" />
          )}
        </div>

        {/* Botón colapsar (desktop): círculo lavanda dentro del encabezado */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden lg:flex absolute items-center justify-center rounded-full text-[#7B1FA2] transition-all duration-300 outline-none ${
            isCollapsed
              ? 'top-7 -right-3 w-6 h-6 bg-white shadow-md border border-purple-100 hover:bg-purple-50'
              : 'top-[26px] right-3 w-9 h-9 bg-purple-50 hover:bg-purple-100'
          }`}
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto pr-2 py-3 min-h-0">
          <style>{`
            nav::-webkit-scrollbar { width: 4px; }
            nav::-webkit-scrollbar-track { background: transparent; }
            nav::-webkit-scrollbar-thumb { background: rgba(123,31,162,0.2); border-radius: 10px; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          `}</style>

          {/* Centro Operativo — link directo, primero */}
          {[ROLES.ADMINISTRADOR, ROLES.ADMISION, ROLES.TERAPEUTA, ROLES.RECURSOS_HUMANOS].includes(userRole) && (
            <Link
              to="/intranet/centro-operativo"
              className={getItemClass({ isActive: centroOperativoActivo, isCollapsed })}
              title={isCollapsed ? 'Centro Operativo' : ''}
            >
              <BuildingOfficeIcon className={getIconClass(centroOperativoActivo)} />
              {!isCollapsed && <span className="text-[15px] font-bold flex-1 text-left">Centro Operativo</span>}
            </Link>
          )}

          {/* Grupos de navegación */}
          {filteredSections.map((section, idx) => renderSection(section, idx))}

          {/* Accesos rápidos — solo cuando está expandido */}
          {filteredExternalItems.length > 0 && !isCollapsed && (
            <div className="pl-5 pr-3">
              <div className="my-4" style={{ borderTop: '1px solid #efeaf6' }} />
              <p className="text-[12.5px] font-semibold uppercase tracking-wide pb-2 select-none text-gray-600">
                Accesos Rápidos
              </p>
              <div className="space-y-2">
                {filteredExternalItems.map((item, i) => renderExternalItem(item, i))}
              </div>
            </div>
          )}
        </nav>

        {/* Perfil de usuario */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid #f2eef8' }}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Link to="/intranet/mi-perfil"
                className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-purple-50 transition-all outline-none"
                title={`${user.nombres} ${user.apellidos}`}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center font-bold text-white text-xs shadow-md">
                  {user.nombres?.[0]}{user.apellidos?.[0]}
                </div>
              </Link>
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center p-2 rounded-xl transition-all outline-none text-gray-500 hover:text-red-500 hover:bg-red-50"
                title="Cerrar sesión"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link to="/intranet/mi-perfil"
                className="w-full flex items-center gap-3 p-1.5 rounded-xl hover:bg-purple-50 transition-all outline-none"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center font-bold text-white text-sm shadow-md flex-shrink-0">
                  {user.nombres?.[0]}{user.apellidos?.[0]}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="font-bold text-base text-gray-900 truncate">{user.nombres} {user.apellidos}</p>
                  <p className="text-sm text-gray-600 truncate">{ROLES_NAMES[user.rol?.id] || 'Sin rol'}</p>
                </div>
                <UserCircleIcon className="w-5 h-5 flex-shrink-0 text-gray-400" />
              </Link>
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2.5 py-2 rounded-xl transition-all outline-none text-gray-500 hover:text-red-500 hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="text-[15px]">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const SidebarContentWrapper = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .sidebar-content-wrapper { margin-left: var(--sidebar-width, 224px); transition: margin-left 0.4s cubic-bezier(0.4,0,0.2,1); }
          .intranet-topbar { left: var(--sidebar-width, 224px); transition: left 0.4s cubic-bezier(0.4,0,0.2,1); }
        }
        @media (max-width: 1023px) {
          .sidebar-content-wrapper { margin-left: 0; }
          .intranet-topbar { display: none !important; }
        }
      `}</style>

      {/* Top bar */}
      <div
        className={`intranet-topbar fixed top-0 right-0 z-40 ${HEADER_HEIGHT} flex items-center px-8 gap-4 overflow-hidden`}
        style={{
          backgroundImage: 'linear-gradient(90deg, #ffffff 0%, #faf6fe 55%, #f2eafb 100%)',
          borderBottom: '1px solid #ece8f3',
        }}
      >
        {/* Ola decorativa */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 h-full w-[60%]" viewBox="0 0 400 88" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cxTopWave" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9C27B0" stopOpacity="0" />
              <stop offset="100%" stopColor="#7B1FA2" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path d="M0,88 C90,80 140,30 220,34 C300,38 340,14 400,20 L400,88 Z" fill="#7B1FA2" fillOpacity="0.05" />
          <path d="M60,88 C140,70 190,10 270,14 C330,17 365,2 400,4 L400,88 Z" fill="url(#cxTopWave)" />
        </svg>

        {/* Buscador global */}
        <div className="relative flex-1 max-w-[520px]">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            placeholder="Buscar paciente (nombre, DNI o código)..."
            className="w-full pl-12 pr-24 py-2 bg-white/90 border border-gray-200 rounded-full text-[14px] text-gray-700 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/30 focus:border-[#7B1FA2]/40"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-lg">Ctrl + K</kbd>
        </div>

        <div className="flex-1" />

        {/* Campana */}
        <div className="relative flex items-center">
          <NotificacionesGlobales panelClassName="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl z-50 border border-purple-100 flex flex-col overflow-hidden" />
        </div>

        {/* Separador */}
        <div className="relative w-px h-8 flex-shrink-0 bg-gray-300/70" />

        {/* Perfil */}
        <Link
          to="/intranet/mi-perfil"
          className="relative flex items-center gap-3 px-2 py-1.5 rounded-2xl transition-colors duration-150 hover:bg-white/70 group"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center font-semibold text-white text-sm flex-shrink-0">
            {user.nombres?.[0]}{user.apellidos?.[0]}
          </div>

          <div className="text-left hidden md:block leading-tight">
            <p className="text-base font-bold text-gray-900">{user.nombres} {user.apellidos}</p>
            <p className="text-sm font-medium text-[#7B1FA2]">{ROLES_NAMES[user.rol?.id] || 'Sin rol'}</p>
          </div>

          <ChevronDownIcon className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-[#7B1FA2] transition-colors" />
        </Link>
      </div>

      <div className="sidebar-content-wrapper min-h-screen flex flex-col">
        {/* Espaciado para el top bar en desktop */}
        <div className={`hidden lg:block ${HEADER_HEIGHT} flex-shrink-0`} />
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