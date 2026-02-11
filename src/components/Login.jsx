import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  useMediaQuery, 
  Alert,
  IconButton,
  InputAdornment 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { login } from '../services/authService';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login({
        username: usuario,
        password: contrasena
      });

      // Guardar el token en localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Redirigir a la página de lista de pacientes
      navigate('/intranet/lista-pacientes');
    } catch (error) {
      console.error('Error en login:', error);
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleClickMostrarContrasena = () => {
    setMostrarContrasena(!mostrarContrasena);
  };

  const handleMouseDownContrasena = (e) => {
    e.preventDefault();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: '#f4f6fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Grid
        container
        spacing={4}
        alignItems="center"
        justifyContent="center"
        sx={{ maxWidth: 1100, width: '100%' }}
        direction={isMobile ? 'column' : 'row'}
      >
        {/* Lado Izquierdo: Logo sin tarjeta */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <img
              src={'/logo-inicio-sesion.png'}
              alt="Logo Crecemos"
              style={{ maxWidth: 340, width: '90%', marginBottom: 0 }}
            />
          </Box>
        </Grid>

        {/* Lado Derecho: Formulario */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 5,
              minWidth: 320,
              maxWidth: 380,
              width: '100%',
              background: '#fff',
              boxShadow: '0 4px 24px 0 rgba(44,164,203,0.10)',
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#2ca4cb', textAlign: 'center' }}>
              Iniciar sesión
            </Typography>
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
            <form style={{ width: '100%' }} onSubmit={handleSubmit} autoComplete="off">
              <TextField
                margin="normal"
                fullWidth
                label="Usuario"
                variant="outlined"
                autoComplete="username"
                autoFocus
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                disabled={loading}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Contraseña"
                type={mostrarContrasena ? 'text' : 'password'}
                variant="outlined"
                autoComplete="current-password"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                        onClick={handleClickMostrarContrasena}
                        onMouseDown={handleMouseDownContrasena}
                        edge="end"
                        disabled={loading}
                      >
                        {mostrarContrasena ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, borderRadius: 5, backgroundColor: '#2ca4cb', fontWeight: 'bold', fontSize: 18, boxShadow: 2 }}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;