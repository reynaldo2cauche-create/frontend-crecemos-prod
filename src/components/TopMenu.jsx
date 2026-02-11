import React from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar, IconButton, Menu, MenuItem, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { ROLES_NAMES, ROLES } from '../constants/roles';

const menuItems = [
  { text: 'Agenda', path: '/intranet/agenda' },
  { text: 'Pacientes', path: '/intranet/lista-pacientes' },
  { text: 'Reportes', path: '/intranet/reportes-evaluaciones' },
  { text: 'Usuarios', path: '/intranet/usuarios' },
  { text: 'Popup Inicio', path: '/intranet/popup-promocional' },
  { text: 'Postulaciones', path: '/intranet/postulaciones', adminOnly: true },
  { text: 'Certificaciones', path: '/intranet/archivos-oficiales'}
];

const TopMenu = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Función para filtrar elementos del menú basado en el rol del usuario
  const getFilteredMenuItems = () => {
    if (!user || !user.rol?.id) return menuItems;

    const userRole = user.rol.id;
    
    // Terapeuta puede ver "Agenda" y "Pacientes"
    if (userRole === ROLES.TERAPEUTA) {
      return menuItems.filter(item => item.text === 'Agenda' || item.text === 'Pacientes' );
    }
    
    // Admisión puede ver "Agenda", "Pacientes" y "Certificaciones"
    if (userRole === ROLES.ADMISION) {
      return menuItems.filter(item =>
        item.text === 'Agenda' ||
        item.text === 'Pacientes' ||
        item.text === 'Certificaciones'
      );
    }
    
    // Otros roles pueden ver todos los elementos
    return menuItems;
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/intranet');
  };

  const filteredMenuItems = getFilteredMenuItems();

  return (
    <AppBar
      position="fixed"
      sx={{
        background: '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1201,
      }}
    >
      <Toolbar sx={{ minHeight: 64, display: 'flex', justifyContent: 'space-between',pr: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/logo-text-short.webp"
            alt="Logo"
            style={{ height: 48, marginRight: 40 }}
          />
          {filteredMenuItems.map((item) => (
            <Button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                mx: 2,
                color: '#424242',
                '&:hover': {
                  color: '#A3C644',
                  background: 'rgba(163,198,68,0.08)',
                },
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 0 }}>
          {user && (
            <>
              <Avatar sx={{ bgcolor: '#A3C644', width: 36, height: 36, fontWeight: 'bold', mr: 1 }}>
                {user.nombres?.[0] || ''}{user.apellidos?.[0] || ''}
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', mr: 2 }}>
                <Typography sx={{ fontWeight: 'bold', color: '#424242', fontSize: '0.9rem' }}>
                  {user.nombres} {user.apellidos}
                </Typography>
                <Typography sx={{ color: '#757575', fontSize: '0.75rem' }}>
                  {ROLES_NAMES[user.rol?.id] || 'Sin rol'}
                </Typography>
              </Box>
            </>
          )}
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              fontWeight: 'bold',
              border: '1px solid #A3C644',
              borderRadius: 2,
              px: 2,
              color: '#A3C644',
              background: 'transparent',
              '&:hover': {
                background: '#A3C644',
                color: '#ffffff',
              },
              ml: 0, // ❗ sin margen izquierdo
              mr: 0, // ❗ sin margen derecho
              minWidth: 0, // ❗ evita espacio innecesario del botón
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopMenu; 