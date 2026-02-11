import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Divider,
  Tooltip
} from '@mui/material';
import {
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitIcon,
  MenuOpen as MenuOpenIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Pacientes', icon: <PeopleIcon />, path: '/lista-pacientes' },
  // { text: 'Citas', icon: <CalendarIcon />, path: '/citas' },
  { text: 'Reportes', icon: <AssessmentIcon />, path: '/reportes-evaluaciones' },
  // { text: 'Configuración', icon: <SettingsIcon />, path: '/configuracion' },
];

const SideMenu = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleMenu = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? 64 : drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? 64 : drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #7B1FA2 0%, #8D288F 100%)',
          color: '#fff',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          borderRight: 'none',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflowX: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          height: 72,
          px: 1.5,
          background: 'rgba(255,255,255,0.06)',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          mb: 1
        }}
      >
        <ListItemButton
          onClick={toggleMenu}
          sx={{
            minHeight: 48,
            width: 48,
            color: '#fff',
            borderRadius: 2,
            mr: 1,
            transition: 'background 0.2s',
            '&:hover': {
              background: 'rgba(255,255,255,0.12)'
            }
          }}
        >
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </ListItemButton>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            borderRadius: 2.5,
            p: 1,
            boxShadow: 2,
            minWidth: 0
          }}
        >
          <img
            src="/logo-text-short.webp"
            alt="Logo"
            style={{
              width: 110,
              maxWidth: '90%',
              display: 'block'
            }}
          />
        </Box>
      </Box>
      <Divider sx={{ background: 'rgba(255,255,255,0.15)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={collapsed ? item.text : ''} placement="right" arrow disableInteractive={!collapsed}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  color: '#fff',
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  px: collapsed ? 1.5 : 2.5,
                  '&:hover': {
                    backgroundColor: 'rgba(163,198,68,0.12)',
                    color: '#A3C644',
                    '& .MuiListItemIcon-root': { color: '#A3C644' },
                  },
                  '&.Mui-selected, &.Mui-selected:hover': {
                    backgroundColor: 'rgba(163,198,68,0.18)',
                    color: '#A3C644',
                    '& .MuiListItemIcon-root': { color: '#A3C644' },
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#fff', minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                {!collapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 'auto', background: 'rgba(255,255,255,0.15)' }} />
      {/* <List>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              color: '#E53935',
              '&:hover': {
                backgroundColor: 'rgba(229,57,53,0.12)',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              },
            }}
          >
            <ListItemIcon sx={{ color: '#E53935' }}>
              <ExitIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List> */}
    </Drawer>
  );
};

export default SideMenu; 