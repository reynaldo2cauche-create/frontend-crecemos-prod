import React, { useEffect, useState } from 'react';
import { TextField, Button, Box, Grid, Autocomplete, CircularProgress, Typography, Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { getDistritos, getGeneros, getTiposDocumento } from '../../services/catalogoService';
import { checkDocumentoExists } from '../../services/pacienteService';

// const tiposDocumento = ["DNI", "Carnet Extranjería"];
// const distritos = ["Chorrillos", "Ate", "Villa María", "San Juan Miraflores", "Comas", "Lima"];
// const generos = ["Hombre", "Mujer", "Otros"];

const PersonalDataForm = ({ onNext, setSnackbar }) => {
  const { register, formState: { errors }, setValue, watch } = useFormContext();

  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [distritos, setDistritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tipoDocumento = watch('tipoDocumento') || '';
  const [checkingDocumento, setCheckingDocumento] = useState(false);

  // Calcular edad y si es mayor de edad
  const fechaNacimiento = watch('fechaNacimiento');
  const calcularEdad = (fecha) => {
    if (!fecha) return null;
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };
  const edad = calcularEdad(fechaNacimiento);
  const esMayorDeEdad = edad !== null && edad >= 18;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [documentosData, generosData, distritosData] = await Promise.all([
          getTiposDocumento(),
          getGeneros(), 
          getDistritos()
        ]);

        // Asegurarse de que los datos sean arrays y tengan la estructura correcta
        const formatDocumentos = Array.isArray(documentosData) ? documentosData : [];
        const formatGeneros = Array.isArray(generosData) ? generosData : [];
        const formatDistritos = Array.isArray(distritosData) ? distritosData : [];

        // Filtrar solo distritos con provincia_id = 1
        const distritosFiltrados = formatDistritos.filter(distrito => distrito.id_provincia === 1);

        setTiposDocumento(formatDocumentos);
        setGeneros(formatGeneros);
        setDistritos(distritosFiltrados);
        setError(null);
      } catch (error) {
        console.error("Error al cargar datos del formulario:", error);
        setError("Error al cargar los datos. Por favor, recarga la página.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getDocumentoValidation = (tipoDoc) => {
    console.log(tipoDoc)
    switch (tipoDoc) {
      case '3': // DNI
        return {
          required: 'Campo obligatorio',
          pattern: {
            value: /^[0-9]{8}$/,
            message: 'El DNI debe tener 8 dígitos'
          }
        };
      case '4': // Carnet Extranjería
        return {
          required: 'Campo obligatorio',
          pattern: {
            value: /^[0-9]{9,12}$/,
            message: 'El Carnet de Extranjería debe tener entre 9 y 12 dígitos'
          }
        };
      default:
        return { required: 'Campo obligatorio' };
    }
  };

  const handleNumeroDocumentoChange = async (e) => {
    let value = e.target.value;
    // Solo permitir números
    value = value.replace(/[^0-9]/g, '');
    
    // Para DNI
    if (tipoDocumento === '1') {
      value = value.slice(0, 8); // Limitar a exactamente 8 dígitos
    }
    // Para CE
    else if (tipoDocumento === '3') {
      value = value.slice(0, 12); // Limitar a 12 dígitos
    }

    setValue('numeroDocumento', value);
    
    // Verificar documento cuando se complete el DNI (8 dígitos)
    if (tipoDocumento === '1' && value.length === 8) {
      setCheckingDocumento(true);
      try {
        const result = await checkDocumentoExists(value);
        if (result.exists) {
          // Limpiar el campo
          setValue('numeroDocumento', '');
          // Mostrar mensaje
          console.warn(`La persona con DNI ${value} ya existe en el sistema`);
          if (setSnackbar) {
            setSnackbar({
              open: true,
              message: `La persona con DNI ${value} ya existe en el sistema`,
              severity: 'warning'
            });
          }
        }
      } catch (error) {
        console.error('Error al verificar documento:', error);
      } finally {
        setCheckingDocumento(false);
      }
    }
  };

  const handleTelefonoChange = (e, fieldName) => {
    let value = e.target.value;
    // Solo permitir números
    value = value.replace(/[^0-9]/g, '');
    
    // Si el primer número no es 9, no permitir más números
    if (value.length > 0 && value[0] !== '9') {
      value = value.slice(0, 0);
    }
    
    // Limitar a 9 dígitos
    value = value.slice(0, 9);
    
    setValue(fieldName, value);
  };

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onNext();
    }}>
      <Box display="flex" flexDirection="column" gap={3} padding={2} border="1px solid #ccc" borderRadius="8px" boxShadow="0 4px 8px rgba(0,0,0,0.1)">
        <TextField
          label="Nombres"
          {...register('nombre', { required: 'Campo obligatorio' })}
          error={!!errors.nombre}
          helperText={errors.nombre?.message}
          fullWidth
          required
          value={watch('nombre') || ''}
          onChange={e => {
            const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
            setValue('nombre', value.toUpperCase());
          }}
          inputProps={{ style: { textTransform: 'uppercase' } }}
        />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Apellido Paterno"
              {...register('apellidoPaterno', { required: 'Campo obligatorio' })}
              error={!!errors.apellidoPaterno}
              helperText={errors.apellidoPaterno?.message}
              fullWidth
              required
              value={watch('apellidoPaterno') || ''}
              onChange={e => {
                const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
                setValue('apellidoPaterno', value.toUpperCase());
              }}
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Apellido Materno"
              {...register('apellidoMaterno', { required: 'Campo obligatorio' })}
              error={!!errors.apellidoMaterno}
              helperText={errors.apellidoMaterno?.message}
              fullWidth
              required
              value={watch('apellidoMaterno') || ''}
              onChange={e => {
                const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
                setValue('apellidoMaterno', value.toUpperCase());
              }}
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
          </Grid>
        </Grid>

        <TextField
          label="Fecha de Nacimiento"
          type="date"
          InputLabelProps={{ shrink: true }}
          {...register('fechaNacimiento', { required: 'Campo obligatorio' })}
          error={!!errors.fechaNacimiento}
          helperText={errors.fechaNacimiento?.message}
          fullWidth
          required
          inputProps={{ style: { textTransform: 'uppercase' } }}
        />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth error={!!errors.tipoDocumento} required>
              <InputLabel>Tipo de Documento</InputLabel>
              <Select
                {...register('tipoDocumento', { required: 'Campo obligatorio' })}
                value={tipoDocumento}
                label="Tipo de Documento"
                onChange={e => {
                  setValue('tipoDocumento', e.target.value);
                  setValue('numeroDocumento', ''); // Limpiar número al cambiar tipo
                }}
              >
                <MenuItem value="">
                  <em>Seleccione un tipo de documento</em>
                </MenuItem>
                {tiposDocumento.map((tipo) => (
                  <MenuItem key={tipo.id} value={String(tipo.id)} sx={{ textTransform: 'uppercase' }}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </Select>
              {errors.tipoDocumento && (
                <FormHelperText>{errors.tipoDocumento.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Número de Documento"
              {...register('numeroDocumento', {
                required: 'Campo obligatorio',
                validate: {
                  formatoValido: (value) => {
                    if (!value) return 'Campo obligatorio';
                    if (tipoDocumento === '1') {
                      return value.length === 8 || 'El DNI debe tener exactamente 8 dígitos';
                    }
                    if (tipoDocumento === '3') {
                      return (value.length >= 9 && value.length <= 12) || 'El Carnet de Extranjería debe tener entre 9 y 12 dígitos';
                    }
                    return true;
                  }
                }
              })}
              required
              onChange={handleNumeroDocumentoChange}
              value={watch('numeroDocumento')}
              error={!!errors.numeroDocumento}
              helperText={
                errors.numeroDocumento?.message || 
                (tipoDocumento === '1' ? 
                  'El DNI debe tener exactamente 8 dígitos' : 
                  tipoDocumento === '3' ? 
                    'El Carnet de Extranjería debe tener entre 9 y 12 dígitos' : 
                    '')
              }
              fullWidth
              disabled={!tipoDocumento || checkingDocumento}
              type="text"
              InputProps={{
                endAdornment: checkingDocumento ? <CircularProgress size={20} /> : null,
              }}
              inputProps={{
                inputMode: 'numeric',
              }}
            />
          </Grid>
        </Grid>

        <FormControl fullWidth error={!!errors.sexo} required>
          <InputLabel>Sexo</InputLabel>
          <Select
            value={watch('sexo') || ''}
            label="Sexo"
            onChange={(e) => setValue('sexo', e.target.value)}
            sx={{ textTransform: 'uppercase' }}
          >
            <MenuItem value="">
              <em>Seleccione un sexo</em>
            </MenuItem>
            {generos.map((genero) => (
              <MenuItem key={genero.id} value={genero.id} sx={{ textTransform: 'uppercase' }}>
                {genero.nombre}
              </MenuItem>
            ))}
          </Select>
          {errors.sexo && (
            <FormHelperText>{errors.sexo.message}</FormHelperText>
          )}
        </FormControl>

        <Autocomplete
          options={distritos}
          value={distritos.find(d => d.id === watch('distrito')) || null}
          onChange={(event, value) => setValue('distrito', value?.id || '')}
          getOptionLabel={(option) => (option.nombre || '').toUpperCase()}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Distrito" 
              error={!!errors.distrito} 
              helperText={errors.distrito?.message}
              required
              inputProps={{
                ...params.inputProps,
                style: { textTransform: 'uppercase' }
              }} 
            />
          )}
        />

        <TextField
          label="Dirección Completa"
          {...register('direccion', { required: 'Campo obligatorio' })}
          error={!!errors.direccion}
          helperText={errors.direccion?.message}
          fullWidth
          required
          value={watch('direccion') || ''}
          onChange={e => setValue('direccion', e.target.value.toUpperCase())}
          inputProps={{ style: { textTransform: 'uppercase' } }}
        />

        {esMayorDeEdad && (
          <>
            <TextField
              label="Celular 1"
              {...register('celular', { 
                required: 'Campo obligatorio',
                pattern: {
                  value: /^9\d{8}$/,
                  message: 'El celular debe tener 9 dígitos y comenzar con 9'
                }
              })}
              onChange={(e) => handleTelefonoChange(e, 'celular')}
              value={watch('celular')}
              error={!!errors.celular}
              helperText={errors.celular?.message || 'El número debe tener 9 dígitos y comenzar con 9'}
              fullWidth
              required
              inputProps={{
                inputMode: 'numeric',
              }}
            />

            <TextField
              label="Celular 2"
              {...register('celular2', { 
                required: 'Campo obligatorio',
                pattern: {
                  value: /^9\d{8}$/,
                  message: 'El celular debe tener 9 dígitos y comenzar con 9'
                }
              })}
              onChange={(e) => handleTelefonoChange(e, 'celular2')}
              value={watch('celular2')}
              error={!!errors.celular2}
              helperText={errors.celular2?.message || 'El celular debe tener 9 dígitos y comenzar con 9'}
              fullWidth
              inputProps={{
                inputMode: 'numeric',
              }}
            />

            <TextField
              label="Correo Electrónico"
              type="email"
              {...register('correo', { required: 'Campo obligatorio', pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Correo inválido' } })}
              error={!!errors.correo}
              helperText={errors.correo?.message}
              fullWidth
              required
              value={watch('correo') || ''}
              onChange={e => setValue('correo', e.target.value.toUpperCase())}
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
          </>
        )}

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Siguiente
        </Button>
      </Box>
    </form>
  );
};

export default PersonalDataForm;
