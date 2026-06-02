export const ROLES = {
  ADMINISTRADOR: 1,
  ADMISION: 2,
  RECURSOS_HUMANOS: 3,
  TERAPEUTA: 4
};

export const ROLES_NAMES = {
  [ROLES.ADMINISTRADOR]: 'Administrador',
  [ROLES.ADMISION]: 'Admisión',
  [ROLES.RECURSOS_HUMANOS]: 'Recursos Humanos',
  [ROLES.TERAPEUTA]: 'Terapeuta'
};

export const ROLES_DESCRIPTIONS = {
  [ROLES.ADMINISTRADOR]: 'Usuario con acceso total al sistema',
  [ROLES.ADMISION]: 'Usuario encargado de la admisión de pacientes',
  [ROLES.RECURSOS_HUMANOS]: 'Usuario encargado de la gestión de personal',
  [ROLES.TERAPEUTA]: 'Usuario que realiza terapias y evaluaciones'
};

// Funciones helper
export const isTerapeuta = (user) => user?.rol?.id === ROLES.TERAPEUTA;
export const isAdministrador = (user) => user?.rol?.id === ROLES.ADMINISTRADOR;
export const isAdmision = (user) => user?.rol?.id === ROLES.ADMISION;
export const isRecursosHumanos = (user) => user?.rol?.id === ROLES.RECURSOS_HUMANOS;

export const canEditPatient = (user) => user?.rol?.id !== ROLES.TERAPEUTA;
export const canManageServices = (user) => user?.rol?.id !== ROLES.TERAPEUTA;
export const canViewContactInfo = (user) => user?.rol?.id !== ROLES.TERAPEUTA;
export const canViewServiceInfo = (user) => user?.rol?.id === ROLES.ADMINISTRADOR || user?.rol?.id === ROLES.ADMISION;
export const canManagePatientStatus = (user) => user?.rol?.id === ROLES.ADMINISTRADOR || user?.rol?.id === ROLES.ADMISION;
export const canManageConvenios = (user) => user?.rol?.id === ROLES.ADMINISTRADOR || user?.rol?.id === ROLES.ADMISION;