import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Button,
  Autocomplete,
  FormControl,
  InputLabel,
  FormHelperText,
  Select,
  CircularProgress,
  ListSubheader,
  Grid,
} from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { getRelacionesResponsable, getTiposDocumento, getServicios } from '../../services/catalogoService';
import { SERVICIOS } from '../../constants/areas';

const AdditionalInfo = ({ onNext, onBack }) => {
  
  const { register, formState: { errors }, setValue, watch, handleSubmit } = useFormContext();
  const [servicios, setServicios] = useState([]);
  const [ocupaciones, setOcupaciones] = useState([]);
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [gradosInstruccion, setGradosInstruccion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOcupacion, setSelectedOcupacion] = useState(watch('ocupacion') || '');
  const [selectedEstadoCivil, setSelectedEstadoCivil] = useState(watch('estadoCivil') || '');
  const [selectedGradoInstruccion, setSelectedGradoInstruccion] = useState(watch('gradoInstruccion') || '');
  const [relaciones, setRelaciones] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);

  // Calcular edad y si es menor de edad
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
  console.log('edad', edad);
  const showResponsible = edad !== null && edad < 18;
  console.log('showResponsible', showResponsible);

  useEffect(() => {
    const cargarServicios = async () => {
      try {
        setLoading(true);
        const data = await getServicios();
        console.log('Servicios cargados:', data);
        setServicios(Array.isArray(data) ? data : []);
        setError(null);
      } catch (error) {
        console.error("Error al cargar servicios:", error);
        setError("Error al cargar los servicios. Por favor, recarga la página.");
      } finally {
        setLoading(false);
      }
    };

    cargarServicios();
  }, []);

  useEffect(() => {
    const subscription = watch((value) => {
      setSelectedOcupacion(value.ocupacion || '');
      setSelectedEstadoCivil(value.estadoCivil || '');
      setSelectedGradoInstruccion(value.gradoInstruccion || '');
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    const cargarRelaciones = async () => {
      try {
        const data = await getRelacionesResponsable();
        setRelaciones(data);
      } catch (error) {
        console.error('Error al cargar relaciones:', error);
      }
    };

    cargarRelaciones();
  }, []);

  useEffect(() => {
    const cargarTiposDocumento = async () => {
      try {
        const data = await getTiposDocumento();
        setTiposDocumento(Array.isArray(data) ? data : []);
      } catch (error) {
        setTiposDocumento([]);
      }
    };
    cargarTiposDocumento();
  }, []);

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

  const onSubmit = (data) => {
    console.log('Datos enviados:', data);
    onNext(data); // Solo avanzar al siguiente paso
  };

  const handleOcupacionChange = (event) => {
    const value = event.target.value;
    setSelectedOcupacion(value);
    setValue('ocupacion', value);
  };

  const handleEstadoCivilChange = (event) => {
    const value = event.target.value;
    setSelectedEstadoCivil(value);
    setValue('estadoCivil', value);
  };

  const handleGradoInstruccionChange = (event) => {
    const value = event.target.value;
    setSelectedGradoInstruccion(value);
    setValue('gradoInstruccion', value);
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

  // Antes del renderizado del Select, agregar el filtrado de servicios según la edad
  let serviciosFiltrados = servicios;

  if (fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    if (edad < 18) {
      serviciosFiltrados = servicios.filter(s => s.area?.nombre === "Área Infantil y Adolescentes");
    } else {
      serviciosFiltrados = servicios.filter(s => s.area?.nombre === "Área Adultos");
    }

    console.log('Servicios filtrados:', serviciosFiltrados);
    console.log('Total servicios:', servicios.length, 'Filtrados:', serviciosFiltrados.length);
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ 
        mt: 3, 
        p: 3, 
        border: '1px solid #e0e0e0', 
        borderRadius: 2, 
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff'
      }}
    >
      <Box
        sx={{ 
          mt: 3, 
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {/* Servicios requeridos */}
        <FormControl fullWidth error={!!errors.serviciosRequeridos} required sx={{ mb: 3 }}>
          <InputLabel id="servicios-requeridos-label">Servicios Requeridos </InputLabel>
          <Select
            labelId="servicios-requeridos-label"
            value={watch('serviciosRequeridos') || ''}
            label="Servicios Requeridos *"
            onChange={(e) => setValue('serviciosRequeridos', e.target.value)}
            sx={{ textTransform: 'uppercase' }}
          >
            <MenuItem value="">
              <em>Seleccione un servicio</em>
            </MenuItem>
            {/* Agrupar servicios por área */}
            {Object.entries(
              serviciosFiltrados.reduce((acc, servicio) => {
                const area = servicio.area?.nombre || 'Sin Área';
                if (!acc[area]) acc[area] = [];
                acc[area].push(servicio);
                return acc;
              }, {})
            ).map(([areaNombre, serviciosArea]) => [
              <ListSubheader
                key={areaNombre}
                sx={{
                  background: '#fff',
                  color: '#174ea6',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  letterSpacing: 0.5,
                  py: 1,
                  borderBottom: '1px solid #e0e0e0'
                }}
              >
                {areaNombre}
              </ListSubheader>,
              serviciosArea.map(servicio => (
                <MenuItem key={servicio.id} value={servicio.id} sx={{ textTransform: 'uppercase' }}>
                  {servicio.nombre}
                </MenuItem>
              ))
            ])}
          </Select>
          {errors.serviciosRequeridos && (
            <FormHelperText error>{errors.serviciosRequeridos.message}</FormHelperText>
          )}
        </FormControl>

        {/* Motivo de consulta */}
        <FormControl fullWidth error={!!errors.motivoConsulta} required sx={{ mb: 3 }}>
          <TextField
            label="Motivo de consulta"
            {...register('motivoConsulta', { 
              required: 'Este campo es obligatorio',
            })}
            fullWidth
            multiline
            required
            rows={4}
            value={watch('motivoConsulta') || ''}
            onChange={e => setValue('motivoConsulta', e.target.value.toUpperCase())}
            inputProps={{
              style: { textTransform: 'uppercase' }
            }}
          />
          {errors.motivoConsulta && (
            <FormHelperText error>{errors.motivoConsulta.message}</FormHelperText>
          )}
        </FormControl>
        

        {/* Referido por */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <TextField
            label="Referido por"
            variant="outlined"
            fullWidth
            {...register('referidoPor')}
            value={watch('referidoPor') || ''}
            onChange={e => setValue('referidoPor', e.target.value.toUpperCase())}
            inputProps={{
              style: { textTransform: 'uppercase' }
            }}
          />
        </FormControl>

        {/* Campos adicionales para Terapia de Pareja */}
        {watch('serviciosRequeridos') === SERVICIOS.TERAPIA_PAREJA && (
          <Box>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: '#174ea6',
                fontWeight: 700,
                letterSpacing: 0.5,
                borderBottom: '2px solid #e0e0e0',
                pb: 1
              }}
            >
              Información de la Pareja
            </Typography>

            <TextField
              label="Nombres de la pareja"
              variant="outlined"
              fullWidth
              sx={{ mb: 3 }}
              {...register('parejaNombres', { 
                required: 'Campo obligatorio para terapia de pareja'
              })}
              error={!!errors.parejaNombres}
              helperText={errors.parejaNombres?.message}
              value={watch('parejaNombres') || ''}
              onChange={e => {
                const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
                setValue('parejaNombres', value.toUpperCase());
              }}              
              inputProps={{
                style: { textTransform: 'uppercase' }
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Apellido Paterno de la pareja"
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 3 }}
                  {...register('parejaApellidoPaterno', { 
                    required: 'Campo obligatorio para terapia de pareja'
                  })}
                  error={!!errors.parejaApellidoPaterno}
                  helperText={errors.parejaApellidoPaterno?.message}
                  value={watch('parejaApellidoPaterno') || ''}
                  onChange={e => {
                    const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
                    setValue('parejaApellidoPaterno', value.toUpperCase());
                  }}
                  inputProps={{
                    style: { textTransform: 'uppercase' }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Apellido Materno de la pareja"
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 3 }}
                  {...register('parejaApellidoMaterno', { 
                    required: 'Campo obligatorio para terapia de pareja'
                  })}
                  error={!!errors.parejaApellidoMaterno}
                  helperText={errors.parejaApellidoMaterno?.message}
                  value={watch('parejaApellidoMaterno') || ''}
                  onChange={e => {
                    const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
                    setValue('parejaApellidoMaterno', value.toUpperCase());
                  }}
                  inputProps={{
                    style: { textTransform: 'uppercase' }
                  }}
                />
              </Grid>
            </Grid>

            {/* Tipo de Documento y Número de Documento de la pareja */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth error={!!errors.parejaTipoDocumento} required sx={{ mb: 3 }}>
                  <InputLabel id="pareja-tipo-doc-label">Tipo de Documento de la pareja</InputLabel>
                  <Select
                    labelId="pareja-tipo-doc-label"
                    value={watch('parejaTipoDocumento') || ''}
                    label="Tipo de Documento de la pareja"
                    onChange={e => {
                      setValue('parejaTipoDocumento', e.target.value);
                      setValue('parejaNumeroDocumento', '');
                    }}
                    {...register('parejaTipoDocumento', {
                      required: 'Campo obligatorio para terapia de pareja'
                    })}
                    sx={{ textTransform: 'uppercase' }}
                  >
                    <MenuItem value="">
                      <em>Seleccione un tipo de documento</em>
                    </MenuItem>
                    {tiposDocumento.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id} sx={{ textTransform: 'uppercase' }}>
                        {tipo.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.parejaTipoDocumento && (
                    <FormHelperText>{errors.parejaTipoDocumento.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Número de Documento de la pareja"
                  {...register('parejaNumeroDocumento', {
                    required: 'Campo obligatorio para terapia de pareja',
                    validate: value => {
                      const tipo = watch('parejaTipoDocumento');
                      if (!value) return 'Campo obligatorio';
                      if (tipo === 1) {
                        return value.length === 8 || 'El DNI debe tener exactamente 8 dígitos';
                      }
                      if (tipo === 3) {
                        return (value.length >= 9 && value.length <= 12) || 'El Carnet de Extranjería debe tener entre 9 y 12 dígitos';
                      }
                      return true;
                    }
                  })}
                  required
                  onChange={e => {
                    let value = e.target.value.replace(/[^0-9]/g, '');
                    const tipo = watch('parejaTipoDocumento');
                    if (tipo === 1) value = value.slice(0, 8);
                    if (tipo === 3) value = value.slice(0, 12);
                    setValue('parejaNumeroDocumento', value);
                  }}
                  value={watch('parejaNumeroDocumento') || ''}
                  error={!!errors.parejaNumeroDocumento}
                  helperText={
                    errors.parejaNumeroDocumento?.message ||
                    (watch('parejaTipoDocumento') === 1
                      ? 'El DNI debe tener exactamente 8 dígitos'
                      : watch('parejaTipoDocumento') === 3
                      ? 'El Carnet de Extranjería debe tener entre 9 y 12 dígitos'
                      : '')
                  }
                  fullWidth
                  disabled={!watch('parejaTipoDocumento')}
                  type="text"
                  inputProps={{
                    inputMode: 'numeric',
                    maxLength: watch('parejaTipoDocumento') === 1 ? 8 : watch('parejaTipoDocumento') === 3 ? 12 : undefined
                  }}
                  sx={{ mb: 3 }}
                />
              </Grid>
                         </Grid>

             {/* Celular, Dirección y Correo de la pareja */}
             <TextField
               label="Celular de la pareja"
               variant="outlined"
               fullWidth
               sx={{ mb: 3 }}
               value={watch('parejaCelular') || ''}
               onChange={e => {
                 let value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
                 setValue('parejaCelular', value, { shouldValidate: true });
               }}
               {...register('parejaCelular', {
                 required: 'Campo obligatorio para terapia de pareja',
                 validate: value => {
                   if (!value) return 'Campo obligatorio';
                   if (value.length !== 9) return 'El celular debe tener 9 dígitos y comenzar con 9';
                   if (!/^9/.test(value)) return 'El celular debe comenzar con 9';
                   return true;
                 }
               })}
               error={!!errors.parejaCelular}
               helperText={errors.parejaCelular?.message || 'El número debe tener 9 dígitos y comenzar con 9'}
               inputProps={{
                 inputMode: 'numeric',
                 maxLength: 9
               }}
             />

             <TextField
               label="Dirección de la pareja"
               variant="outlined"
               fullWidth
               sx={{ mb: 3 }}
               {...register('parejaDireccion', { 
                 required: 'Campo obligatorio para terapia de pareja'
               })}
               error={!!errors.parejaDireccion}
               helperText={errors.parejaDireccion?.message}
               value={watch('parejaDireccion') || ''}
               onChange={e => setValue('parejaDireccion', e.target.value.toUpperCase())}
               inputProps={{
                 style: { textTransform: 'uppercase' }
               }}
             />

             <TextField
               label="Correo electrónico de la pareja"
               variant="outlined"
               type="email"
               fullWidth
               sx={{ mb: 3 }}
               {...register('parejaEmail', {
                 required: 'Campo obligatorio para terapia de pareja',
                 pattern: {
                   value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                   message: 'Correo inválido'
                 }
               })}
               error={!!errors.parejaEmail}
               helperText={errors.parejaEmail?.message}
               value={watch('parejaEmail') || ''}
               onChange={e => setValue('parejaEmail', e.target.value.toUpperCase())}
               inputProps={{
                 style: { textTransform: 'uppercase' }
               }}
             />
           </Box>
         )}

        {/* Campos del responsable */}
        {showResponsible && (
          <Box>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: '#174ea6', // azul institucional
                fontWeight: 700,  // más negrita
                letterSpacing: 0.5,
                borderBottom: '2px solid #e0e0e0',
                pb: 1
              }}
            >
              Información del Responsable
            </Typography>

            <TextField
              label="Nombres del responsable"
              variant="outlined"
              fullWidth
              sx={{ mb: 3 }}
              {...register('responsableNombre', { 
                required: showResponsible ? 'Campo obligatorio' : false 
              })}
              error={!!errors.responsableNombre}
              helperText={errors.responsableNombre?.message}
              value={watch('responsableNombre') || ''}
              onChange={e => {
                const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
                setValue('responsableNombre', value.toUpperCase());
              }}              
              inputProps={{
                style: { textTransform: 'uppercase' }
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Apellido Paterno del responsable"
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 3 }}
                  {...register('responsableApellidoPaterno', { 
                    required: showResponsible ? 'Campo obligatorio' : false 
                  })}
                  error={!!errors.responsableApellidoPaterno}
                  helperText={errors.responsableApellidoPaterno?.message}
                  value={watch('responsableApellidoPaterno') || ''}
                  onChange={e => {
                    const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
                    setValue('responsableApellidoPaterno', value.toUpperCase());
                  }}
                  inputProps={{
                    style: { textTransform: 'uppercase' }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Apellido Materno del responsable"
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 3 }}
                  {...register('responsableApellidoMaterno', { 
                    required: showResponsible ? 'Campo obligatorio' : false 
                  })}
                  error={!!errors.responsableApellidoMaterno}
                  helperText={errors.responsableApellidoMaterno?.message}
                  value={watch('responsableApellidoMaterno') || ''}
                  onChange={e => {
                    const value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ ]/g, '');
                    setValue('responsableApellidoMaterno', value.toUpperCase());
                  }}
                  inputProps={{
                    style: { textTransform: 'uppercase' }
                  }}
                />
              </Grid>
            </Grid>

            {/* Tipo de Documento y Número de Documento del responsable */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth error={!!errors.responsableTipoDocumento} required={showResponsible} sx={{ mb: 3 }}>
                  <InputLabel id="responsable-tipo-doc-label">Tipo de Documento del responsable</InputLabel>
                  <Select
                    labelId="responsable-tipo-doc-label"
                    value={watch('responsableTipoDocumento') || ''}
                    label="Tipo de Documento del responsable"
                    onChange={e => {
                      setValue('responsableTipoDocumento', e.target.value);
                      setValue('responsableNumeroDocumento', '');
                    }}
                    {...register('responsableTipoDocumento', {
                      required: showResponsible ? 'Campo obligatorio' : false
                    })}
                    sx={{ textTransform: 'uppercase' }}
                  >
                    <MenuItem value="">
                      <em>Seleccione un tipo de documento</em>
                    </MenuItem>
                    {tiposDocumento.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id} sx={{ textTransform: 'uppercase' }}>
                        {tipo.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.responsableTipoDocumento && (
                    <FormHelperText>{errors.responsableTipoDocumento.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Número de Documento del responsable"
                  {...register('responsableNumeroDocumento', {
                    required: showResponsible ? 'Campo obligatorio' : false,
                    validate: value => {
                      const tipo = watch('responsableTipoDocumento');
                      if (!showResponsible) return true;
                      if (!value) return 'Campo obligatorio';
                      if (tipo === 1) {
                        return value.length === 8 || 'El DNI debe tener exactamente 8 dígitos';
                      }
                      if (tipo === 3) {
                        return (value.length >= 9 && value.length <= 12) || 'El Carnet de Extranjería debe tener entre 9 y 12 dígitos';
                      }
                      return true;
                    }
                  })}
                  required={showResponsible}
                  onChange={e => {
                    let value = e.target.value.replace(/[^0-9]/g, '');
                    const tipo = watch('responsableTipoDocumento');
                    if (tipo === 1) value = value.slice(0, 8);
                    if (tipo === 3) value = value.slice(0, 12);
                    setValue('responsableNumeroDocumento', value);
                  }}
                  value={watch('responsableNumeroDocumento') || ''}
                  error={!!errors.responsableNumeroDocumento}
                  helperText={
                    errors.responsableNumeroDocumento?.message ||
                    (watch('responsableTipoDocumento') === 1
                      ? 'El DNI debe tener exactamente 8 dígitos'
                      : watch('responsableTipoDocumento') === 3
                      ? 'El Carnet de Extranjería debe tener entre 9 y 12 dígitos'
                      : '')
                  }
                  fullWidth
                  disabled={!watch('responsableTipoDocumento')}
                  type="text"
                  inputProps={{
                    inputMode: 'numeric',
                    maxLength: watch('responsableTipoDocumento') === 1 ? 8 : watch('responsableTipoDocumento') === 3 ? 12 : undefined
                  }}
                  sx={{ mb: 3 }}
                />
              </Grid>
            </Grid>

            <FormControl fullWidth error={!!errors.responsableRelacion} required={showResponsible} sx={{ mb: 3 }}>
              <InputLabel id="responsable-relacion-label">Relación con el paciente</InputLabel>
              <Select
                labelId="responsable-relacion-label"
                value={watch('responsableRelacion') || ''}
                label="Relación con el paciente"
                onChange={(e) => setValue('responsableRelacion', e.target.value)}
                sx={{ textTransform: 'uppercase' }}
                {...register('responsableRelacion', {
                  required: showResponsible ? 'Campo obligatorio' : false
                })}
              >
                <MenuItem value="">
                  <em>Seleccione una relación</em>
                </MenuItem>
                {relaciones.map((relacion) => (
                  <MenuItem key={relacion.id} value={relacion.id} sx={{ textTransform: 'uppercase' }}>
                    {relacion.nombre}
                  </MenuItem>
                ))}
              </Select>
              {errors.responsableRelacion && (
                <FormHelperText>{errors.responsableRelacion.message}</FormHelperText>
              )}
            </FormControl>

            <TextField
              label="Teléfono de contacto del responsable"
              variant="outlined"
              fullWidth
              sx={{ mb: 3 }}
              value={watch('responsableTelefono') || ''}
              onChange={e => {
                let value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
                setValue('responsableTelefono', value, { shouldValidate: true });
              }}
              {...register('responsableTelefono', {
                required: showResponsible ? 'Campo obligatorio' : false,
                validate: value => {
                  if (!showResponsible) return true;
                  if (!value) return 'Campo obligatorio';
                  if (value.length !== 9) return 'El celular debe tener 9 dígitos y comenzar con 9';
                  if (!/^9/.test(value)) return 'El celular debe comenzar con 9';
                  return true;
                }
              })}
              error={!!errors.responsableTelefono}
              helperText={errors.responsableTelefono?.message || 'El número debe tener 9 dígitos y comenzar con 9'}
              inputProps={{
                inputMode: 'numeric',
                maxLength: 9
              }}
            />
            
            <TextField
              label="Correo electrónico del responsable"
              variant="outlined"
              type="email"
              fullWidth
              sx={{ mb: 3 }}
              {...register('responsableEmail', {
                required: showResponsible ? 'Campo obligatorio' : false,
                pattern: showResponsible
                  ? {
                      value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                      message: 'Correo inválido'
                    }
                  : undefined
              })}
              error={!!errors.responsableEmail}
              helperText={errors.responsableEmail?.message}
              value={watch('responsableEmail') || ''}
              onChange={e => setValue('responsableEmail', e.target.value.toUpperCase())}
              inputProps={{
                style: { textTransform: 'uppercase' }
              }}
            />
          </Box>
        )}      

        {/* Botones de navegación */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onBack} // Volver al paso anterior
          >
            Atrás
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
          >
            Siguiente
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AdditionalInfo;
