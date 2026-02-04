import React, { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile, getEspecialidades, getCamposBloqueados } from '../services/trabajadorService';
import { UserIcon, PhoneIcon, MapPinIcon, ShoppingBagIcon, CheckCircleIcon, XMarkIcon, LockClosedIcon, PlusIcon, TrashIcon, StarIcon, PencilIcon, BriefcaseIcon, AcademicCapIcon, HeartIcon, DocumentIcon, CakeIcon, UsersIcon, FlagIcon, HomeIcon, BuildingLibraryIcon, BookOpenIcon, CalendarIcon, IdentificationIcon, GiftIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import {
  getCuentasBancarias,
  crearCuentaBancaria,
  eliminarCuentaBancaria,
  marcarCuentaPrincipal
} from '../services/rrhhService';
import { getGeneros, getEstadosCiviles, getParentescos, getProvincias, getDistritosByProvincia, getNivelesEducacion } from '../services/catalogoService';
import {
  FileText,
  Upload,
  Trash2,
  Eye
} from 'lucide-react';

import { 
  subirCV, 
  subirDNI, 
  verArchivo, 
  eliminarCV, 
  eliminarDNI,
  abrirArchivo,
  getTrabajadorById
} from '../services/trabajadorService';

const MiPerfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [parentescos, setParentescos] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [distritosDisponibles, setDistritosDisponibles] = useState([]);
  const [nivelesEducacion, setNivelesEducacion] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [camposBloqueados, setCamposBloqueados] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});
  
  // Estados para manejar archivos temporales
  const [archivosTemporales, setArchivosTemporales] = useState({
    cv: null,
    dni: null
  });
  const [archivosAEliminar, setArchivosAEliminar] = useState({
    cv: false,
    dni: false
  });

  // Estado para modal de confirmación de eliminación
  const [modalEliminar, setModalEliminar] = useState({
    show: false,
    tipo: null, // 'cv' o 'dni'
    callback: null
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleUploadCV = (file) => {
    

    // Verificar si el CV está bloqueado
    if (camposBloqueados.archivo_cv) {
      
      showNotification('El CV ya está completo y no puede modificarse. Contacte al administrador si necesita cambiarlo.', 'error');
      return;
    }

 

    // Guardar temporalmente en el estado
    setArchivosTemporales(prev => {
      const nuevoEstado = { ...prev, cv: file };
    
      return nuevoEstado;
    });
    setArchivosAEliminar(prev => ({ ...prev, cv: false }));

    // Actualizar el perfil localmente para mostrar el archivo
    const tempURL = URL.createObjectURL(file);


    setPerfil(prev => {
      const nuevoEstado = {
        ...prev,
        archivo_cv: file.name,
        archivo_cv_temp: tempURL
      };
  
      return nuevoEstado;
    });

    showNotification('CV listo para guardar', 'success');
  
  };

  const handleUploadDNI = (file) => {
 

    // Verificar si el DNI está bloqueado
    if (camposBloqueados.archivo_dni) {
      
      showNotification('El DNI ya está completo y no puede modificarse. Contacte al administrador si necesita cambiarlo.', 'error');
      return;
    }

 

    // Guardar temporalmente en el estado
    setArchivosTemporales(prev => {
      const nuevoEstado = { ...prev, dni: file };
      
      return nuevoEstado;
    });
    setArchivosAEliminar(prev => ({ ...prev, dni: false }));

    // Actualizar el perfil localmente
    const tempURL = URL.createObjectURL(file);
    

    setPerfil(prev => {
      const nuevoEstado = {
        ...prev,
        archivo_dni: file.name,
        archivo_dni_temp: tempURL
      };
    
      return nuevoEstado;
    });

    showNotification('DNI listo para guardar', 'success');

  };

  const handleViewCV = async () => {
    try {
      // Primero verificar si hay archivo temporal
      if (perfil.archivo_cv_temp) {
        // Abrir archivo temporal
        window.open(perfil.archivo_cv_temp, '_blank');
      } else if (perfil.archivo_cv) {
        // Si no hay temporal, usar el del servidor
        await abrirArchivo(perfil.archivo_cv);
      } else {
        showNotification('No hay CV subido', 'info');
      }
    } catch (error) {
      console.error('Error al ver CV:', error);
      showNotification('Error al abrir el CV', 'error');
    }
  };

  const handleViewDNI = async () => {
    try {
      // Primero verificar si hay archivo temporal
      if (perfil.archivo_dni_temp) {
        // Abrir archivo temporal
        window.open(perfil.archivo_dni_temp, '_blank');
      } else if (perfil.archivo_dni) {
        // Si no hay temporal, usar el del servidor
        await abrirArchivo(perfil.archivo_dni);
      } else {
        showNotification('No hay DNI subido', 'info');
      }
    } catch (error) {
      console.error('Error al ver DNI:', error);
      showNotification('Error al abrir el DNI', 'error');
    }
  };

  const handleDeleteCV = () => {
    setModalEliminar({
      show: true,
      tipo: 'cv',
      callback: () => {
        // Marcar para eliminar cuando se guarde
        setArchivosAEliminar(prev => ({ ...prev, cv: true }));
        setArchivosTemporales(prev => ({ ...prev, cv: null }));

        // Actualizar el perfil localmente
        setPerfil(prev => ({
          ...prev,
          archivo_cv: null,
          archivo_cv_temp: null
        }));

        showNotification('CV marcado para eliminar al guardar', 'success');
        setModalEliminar({ show: false, tipo: null, callback: null });
      }
    });
  };

  const handleDeleteDNI = () => {
    setModalEliminar({
      show: true,
      tipo: 'dni',
      callback: () => {
        // Marcar para eliminar cuando se guarde
        setArchivosAEliminar(prev => ({ ...prev, dni: true }));
        setArchivosTemporales(prev => ({ ...prev, dni: null }));

        // Actualizar el perfil localmente
        setPerfil(prev => ({
          ...prev,
          archivo_dni: null,
          archivo_dni_temp: null
        }));

        showNotification('DNI marcado para eliminar al guardar', 'success');
        setModalEliminar({ show: false, tipo: null, callback: null });
      }
    });
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const usuarioLogueado = JSON.parse(localStorage.getItem('user'));
      const [perfilData, generosData, estadosCivilesData, parentescosData, provinciasData, nivelesEducacionData, especialidadesData] = await Promise.all([
        getMyProfile(),
        getGeneros(),
        getEstadosCiviles(),
        getParentescos(),
        getProvincias(),
        getNivelesEducacion(),
        getEspecialidades()
      ]);

      // ✅ NORMALIZAR: Extraer provincia_id desde distrito_rel
      const perfilNormalizado = {
        ...perfilData,
        // IDs normalizados
        sexo_id: perfilData.sexo?.id ?? perfilData.sexo_id ?? null,
        estado_civil_id: perfilData.estado_civil?.id ?? perfilData.estado_civil_id ?? null,
        parentesco_emergencia_id: perfilData.parentesco_emergencia?.id ?? perfilData.parentesco_emergencia_id ?? null,
        nivel_educacion_id: perfilData.nivel_educacion?.id ?? perfilData.nivel_educacion_id ?? null,
        
        // 🌍 UBICACIÓN: distrito_id viene directo, provincia_id se extrae de distrito_rel
        distrito_id: perfilData.distrito_rel?.id ?? perfilData.distrito_id ?? null,
        provincia_id: perfilData.distrito_rel?.provincia?.id ?? perfilData.provincia_id ?? null,
        
        // Nombres de texto (para mostrar)
        provincia: perfilData.distrito_rel?.provincia?.nombre ?? perfilData.provincia ?? null,
        distrito: perfilData.distrito_rel?.nombre ?? perfilData.distrito ?? null,
        departamento: perfilData.distrito_rel?.provincia?.region ?? perfilData.departamento ?? null
      };

      // Obtener estado de bloqueo de campos solo para el usuario actual
      let camposBloqueadosData = {};
      if (usuarioLogueado && perfilData) {
        try {
          
          camposBloqueadosData = await getCamposBloqueados(perfilData.id);
        
        } catch (error) {
          console.error('❌ Error al cargar campos bloqueados:', error);
        }
      }

    

      console.log('🔒 Campos bloqueados cargados:', {
        archivo_cv: camposBloqueadosData.archivo_cv,
        archivo_dni: camposBloqueadosData.archivo_dni,
        total: Object.keys(camposBloqueadosData).length
      });

      setPerfil(perfilNormalizado);
      setGeneros(generosData || []);
      setEstadosCiviles(estadosCivilesData || []);
      setParentescos(parentescosData || []);
      setProvincias(provinciasData || []);
      setNivelesEducacion(nivelesEducacionData || []);
      setEspecialidades(especialidadesData || []);
      setCamposBloqueados(camposBloqueadosData || {});

      // Limpiar archivos temporales al cargar datos
      setArchivosTemporales({ cv: null, dni: null });
      setArchivosAEliminar({ cv: false, dni: false });

      // Cargar distritos si tiene provincia
      if (perfilNormalizado.provincia_id) {
       
        try {
          const distritosData = await getDistritosByProvincia(perfilNormalizado.provincia_id);
          setDistritosDisponibles(distritosData || []);
         
        } catch (error) {
          console.error('❌ Error al cargar distritos:', error);
          setDistritosDisponibles([]);
        }
      }

      setModoEdicion(false);
    } catch (error) {
      console.error('❌ Error al cargar perfil:', error);
      showNotification('Error al cargar los datos del perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cargarDistritos = async () => {
      if (perfil?.provincia_id && modoEdicion) {
        try {
          const distritosData = await getDistritosByProvincia(perfil.provincia_id);
          setDistritosDisponibles(distritosData || []);
        } catch (error) {
          console.error('Error al cargar distritos:', error);
          setDistritosDisponibles([]);
        }
      }
    };
    
    if (modoEdicion) {
      cargarDistritos();
    }
  }, [perfil?.provincia_id, modoEdicion]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Verificar si el campo está bloqueado antes de permitir cambios
    if (modoEdicion && camposBloqueados[name]) {
      showNotification(`El campo '${name}' ya está completo y no puede modificarse. Contacte al administrador si necesita cambiarlo.`, 'error');
      return;
    }
    
    setPerfil({ ...perfil, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    
    // Verificar si el campo está bloqueado antes de permitir cambios
    if (modoEdicion && camposBloqueados[name]) {
      showNotification(`El campo '${name}' ya está completo y no puede modificarse. Contacte al administrador si necesita cambiarlo.`, 'error');
      return;
    }

    
    // CORRECCIÓN: Convertir correctamente a número o null
    let finalValue;
    
    if (name === 'hijos') {
      // Para hijos: número entero o null
      finalValue = value === '' ? null : parseInt(value, 10);
    } else {
      // Para todos los demás selects (IDs): número o null
      finalValue = value === '' ? null : Number(value);
    }
    
  
    // IMPORTANTE: Usar callback de setPerfil para asegurar que el estado se actualice correctamente
    setPerfil(prev => {
      const nuevoEstado = { ...prev, [name]: finalValue };

      return nuevoEstado;
    });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleProvinciaChange = async (e) => {
    // Verificar si el distrito está bloqueado antes de permitir cambios
    if (modoEdicion && camposBloqueados.distrito_id) {
      showNotification('El distrito ya está completo y no puede modificarse. Contacte al administrador si necesita cambiarlo.', 'error');
      return;
    }
    
    const provinciaId = e.target.value === '' ? null : Number(e.target.value);
    const provinciaSeleccionada = provincias.find(p => p.id === provinciaId);
    

    
    // ✅ Actualizar estado: provincia_id para UI, distrito_id null porque cambió provincia
    setPerfil(prev => ({ 
      ...prev, 
      provincia_id: provinciaId,
      provincia: provinciaSeleccionada?.nombre_provincia ?? null,
      departamento: provinciaSeleccionada?.region ?? null,
      distrito_id: null,  // ← Limpiar distrito porque cambió provincia
      distrito: null
    }));
    
    // Cargar distritos de la nueva provincia
    if (provinciaId) {
      try {
        const distritosData = await getDistritosByProvincia(provinciaId);
        setDistritosDisponibles(distritosData || []);
       
      } catch (error) {
        console.error('❌ Error al cargar distritos:', error);
        setDistritosDisponibles([]);
      }
    } else {
      setDistritosDisponibles([]);
    }
  };

  const handleDistritoChange = (e) => {
    // Verificar si el distrito está bloqueado antes de permitir cambios
    if (modoEdicion && camposBloqueados.distrito_id) {
      showNotification('El distrito ya está completo y no puede modificarse. Contacte al administrador si necesita cambiarlo.', 'error');
      return;
    }
    
    const distritoId = e.target.value === '' ? null : Number(e.target.value);
    const distritoSeleccionado = distritosDisponibles.find(d => d.id === distritoId);
    

    
    // ✅ Actualizar distrito_id (para guardar) y distrito (para mostrar)
    setPerfil(prev => ({
      ...prev,
      distrito_id: distritoId,
      distrito: distritoSeleccionado?.nombre ?? null
    }));
    
    if (errors.distrito_id) {
      setErrors(prev => ({ ...prev, distrito_id: null }));
    }
  };

  const validarFormulario = () => {
    const erroresNuevos = {};
    
    // Solo validar campos que no estén bloqueados
    if (!camposBloqueados.nombres && !perfil.nombres?.trim()) erroresNuevos.nombres = 'Requerido';
    if (!camposBloqueados.apellidos && !perfil.apellidos?.trim()) erroresNuevos.apellidos = 'Requerido';
    if (!camposBloqueados.dni && !perfil.dni?.trim()) erroresNuevos.dni = 'Requerido';
    if (!camposBloqueados.email && !perfil.email?.trim()) erroresNuevos.email = 'Requerido';
    
    if (perfil.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.email)) {
      erroresNuevos.email = 'Email inválido';
    }
    
    if (perfil.dni && !/^\d{8}$/.test(perfil.dni)) {
      erroresNuevos.dni = '8 dígitos';
    }
    
    if (perfil.telefono && perfil.telefono.trim() && !/^\d{9}$/.test(perfil.telefono)) {
      erroresNuevos.telefono = '9 dígitos';
    }
    
    if (perfil.telefono_emergencia && perfil.telefono_emergencia.trim() && !/^\d{9}$/.test(perfil.telefono_emergencia)) {
      erroresNuevos.telefono_emergencia = '9 dígitos';
    }
    
    setErrors(erroresNuevos);
    return Object.keys(erroresNuevos).length === 0;
  };

  const activarEdicion = () => {
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    // Limpiar archivos temporales
    setArchivosTemporales({ cv: null, dni: null });
    setArchivosAEliminar({ cv: false, dni: false });
    
    // Limpiar URLs temporales si existen
    if (perfil?.archivo_cv_temp) {
      URL.revokeObjectURL(perfil.archivo_cv_temp);
    }
    if (perfil?.archivo_dni_temp) {
      URL.revokeObjectURL(perfil.archivo_dni_temp);
    }
    
    setModoEdicion(false);
    cargarDatos();
    setErrors({});
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      showNotification('Por favor corrige los errores', 'error');
      return;
    }

    setGuardando(true);
    try {
      const usuarioLogueado = JSON.parse(localStorage.getItem('user'));
      
 

     

      try {
        // Eliminar archivos marcados para eliminar (solo si no hay archivo temporal que los reemplace)
        if (archivosAEliminar.cv && perfil.archivo_cv && !archivosTemporales.cv) {
       
          await eliminarCV(perfil.id);
         
        }

        if (archivosAEliminar.dni && perfil.archivo_dni && !archivosTemporales.dni) {
          
          await eliminarDNI(perfil.id);
          
        }

        // Subir archivos nuevos si existen
        if (archivosTemporales.cv) {
        
          await subirCV(perfil.id, archivosTemporales.cv);
  
        } else {
          console.log('⏭️ No hay CV temporal para subir');
        }

        if (archivosTemporales.dni) {
        
          await subirDNI(perfil.id, archivosTemporales.dni);
          
        } else {
          console.log('⏭️ No hay DNI temporal para subir');
        }

        
      } catch (error) {
        console.error('❌ Error al manejar archivos:', error);
        console.error('   Detalle del error:', error.message);
        console.error('   Stack:', error.stack);
        // Continuar con la actualización del perfil incluso si hay error con archivos
      }

      // 2. PREPARAR DATOS PARA ACTUALIZAR EL PERFIL (SIN ARCHIVOS)
      // Los archivos ya se manejaron por separado
      const { archivo_cv_temp, archivo_dni_temp, archivo_cv, archivo_dni, ...perfilParaEnviar } = perfil;

      const dataToUpdate = {
        // Incluir solo campos que no estén bloqueados
        ...(!camposBloqueados.nombres && { nombres: perfilParaEnviar.nombres }),
        ...(!camposBloqueados.apellidos && { apellidos: perfilParaEnviar.apellidos }),
        ...(!camposBloqueados.dni && { dni: perfilParaEnviar.dni }),
        ...(!camposBloqueados.email && { email: perfilParaEnviar.email }),
        
        // Ubicación
        ...(!camposBloqueados.distrito_id && { 
          distrito_id: perfilParaEnviar.distrito_id ?? null,
          distrito: perfilParaEnviar.distrito || null,
          provincia: perfilParaEnviar.provincia || null,
          departamento: perfilParaEnviar.departamento || null
        }),
        
        // Datos personales
        ...(!camposBloqueados.fecha_nacimiento && { fecha_nacimiento: perfilParaEnviar.fecha_nacimiento || null }),
        ...(!camposBloqueados.sexo_id && { sexo_id: perfilParaEnviar.sexo_id ?? null }),
        ...(!camposBloqueados.estado_civil_id && { estado_civil_id: perfilParaEnviar.estado_civil_id ?? null }),
        ...(!camposBloqueados.hijos && { hijos: perfilParaEnviar.hijos ?? null }),
        ...(!camposBloqueados.pais && { pais: perfilParaEnviar.pais || null }),
        
        // Especialidad y colegiatura
        ...(!camposBloqueados.especialidad_id && { especialidad_id: perfilParaEnviar.especialidad?.id || null }),
        ...(!camposBloqueados.numero_colegiatura && { numero_colegiatura: perfilParaEnviar.numero_colegiatura || null }),
        
        // Contacto de emergencia
        ...(!camposBloqueados.parentesco_emergencia_id && { parentesco_emergencia_id: perfilParaEnviar.parentesco_emergencia_id ?? null }),
        ...(!camposBloqueados.contacto_emergencia && { contacto_emergencia: perfilParaEnviar.contacto_emergencia || null }),
        ...(!camposBloqueados.telefono && { telefono: perfilParaEnviar.telefono || null }),
        ...(!camposBloqueados.telefono_emergencia && { telefono_emergencia: perfilParaEnviar.telefono_emergencia || null }),
        
        // Experiencia laboral
        ...(!camposBloqueados.procedencia_laboral && { procedencia_laboral: perfilParaEnviar.procedencia_laboral || null }),
        ...(!camposBloqueados.area_laboral && { area_laboral: perfilParaEnviar.area_laboral || null }),
        ...(!camposBloqueados.empresa_anterior && { empresa_anterior: perfilParaEnviar.empresa_anterior || null }),
        ...(!camposBloqueados.motivo_renuncia && { motivo_renuncia: perfilParaEnviar.motivo_renuncia || null }),
        
        // Educación
        ...(!camposBloqueados.nivel_educacion_id && { nivel_educacion_id: perfilParaEnviar.nivel_educacion_id ?? null }),
        ...(!camposBloqueados.centro_estudios_principal && { centro_estudios_principal: perfilParaEnviar.centro_estudios_principal || null }),
        ...(!camposBloqueados.carrera_estudiada_principal && { carrera_estudiada_principal: perfilParaEnviar.carrera_estudiada_principal || null }),
        ...(!camposBloqueados.fecha_inicio_estudio && { fecha_inicio_estudio: perfilParaEnviar.fecha_inicio_estudio || null }),
        ...(!camposBloqueados.fecha_termino_estudio && { fecha_termino_estudio: perfilParaEnviar.fecha_termino_estudio || null }),
        
        // Dirección
        ...(!camposBloqueados.direccion && { direccion: perfilParaEnviar.direccion || null }),
        ...(!camposBloqueados.referencia_direccion && { referencia_direccion: perfilParaEnviar.referencia_direccion || null }),
        
        // Tallas
        ...(!camposBloqueados.talla_polo && { talla_polo: perfilParaEnviar.talla_polo || null }),
        ...(!camposBloqueados.talla_pantalon && { talla_pantalon: perfilParaEnviar.talla_pantalon || null }),
        ...(!camposBloqueados.talla_zapatos && { talla_zapatos: perfilParaEnviar.talla_zapatos || null }),
        
        // Hobbies
        ...(!camposBloqueados.hobbies && { hobbies: perfilParaEnviar.hobbies || null }),
        ...(!camposBloqueados.opciones_regalo && { opciones_regalo: perfilParaEnviar.opciones_regalo || null }),
        
        // NO incluir archivos aquí - se manejan por separado
        
        // Campo requerido para validación de bloqueo en backend
        user_id_actua: usuarioLogueado?.id || perfil.id
      };

    

      // 3. ACTUALIZAR PERFIL EN EL SERVIDOR (SOLO DATOS, SIN ARCHIVOS)
      await updateMyProfile(dataToUpdate);
      
      // 4. LIMPIAR ESTADOS TEMPORALES
      // Revocar URLs temporales para liberar memoria
      if (archivosTemporales.cv && perfil.archivo_cv_temp) {
        URL.revokeObjectURL(perfil.archivo_cv_temp);
      }
      if (archivosTemporales.dni && perfil.archivo_dni_temp) {
        URL.revokeObjectURL(perfil.archivo_dni_temp);
      }
      
      setArchivosTemporales({ cv: null, dni: null });
      setArchivosAEliminar({ cv: false, dni: false });
      
      showNotification('Perfil guardado correctamente', 'success');

      // 5. SALIR DEL MODO EDICIÓN Y RECARGAR DATOS
      setModoEdicion(false);
      await cargarDatos(); // Ahora sí recargar todo desde el servidor
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      
      // Revertir cambios locales si hay error
      if (archivosTemporales.cv && perfil.archivo_cv_temp) {
        URL.revokeObjectURL(perfil.archivo_cv_temp);
      }
      if (archivosTemporales.dni && perfil.archivo_dni_temp) {
        URL.revokeObjectURL(perfil.archivo_dni_temp);
      }
      
      const mensajeError = error.response?.data?.message || error.message || 'Error al guardar';
      showNotification(mensajeError, 'error');
    } finally {
      setGuardando(false);
    }
  };

  // Función para verificar si un campo está bloqueado
  const isCampoBloqueado = (campo) => {
    return modoEdicion && camposBloqueados[campo];
  };

  // Función para renderizar un campo con bloqueo
  const renderCampo = (campo, label, tipo = 'text', opciones = null, multiline = false) => {
    const bloqueado = isCampoBloqueado(campo);
    
    // Obtener el valor correcto según el tipo de campo
    let valor = '';
    
    if (tipo === 'select' && opciones) {
      // Para selects, obtener el ID del objeto relacionado
      if (campo === 'sexo_id') {
        valor = perfil.sexo?.id || perfil.sexo_id || '';
      } else if (campo === 'estado_civil_id') {
        valor = perfil.estado_civil?.id || perfil.estado_civil_id || '';
      } else if (campo === 'parentesco_emergencia_id') {
        valor = perfil.parentesco_emergencia?.id || perfil.parentesco_emergencia_id || '';
      } else if (campo === 'nivel_educacion_id') {
        valor = perfil.nivel_educacion?.id || perfil.nivel_educacion_id || '';
      } else {
        valor = perfil[campo] || '';
      }
    } else {
      valor = perfil[campo] || '';
    }
    
    if (!modoEdicion) {
      // Modo visualización
      if (tipo === 'select' && opciones) {
        let opcionSeleccionada = null;
        
        // Buscar la opción seleccionada según el campo
        if (campo === 'sexo_id') {
          opcionSeleccionada = generos.find(op => op.id === (perfil.sexo?.id || perfil.sexo_id));
        } else if (campo === 'estado_civil_id') {
          opcionSeleccionada = estadosCiviles.find(op => op.id === (perfil.estado_civil?.id || perfil.estado_civil_id));
        } else if (campo === 'parentesco_emergencia_id') {
          opcionSeleccionada = parentescos.find(op => op.id === (perfil.parentesco_emergencia?.id || perfil.parentesco_emergencia_id));
        } else if (campo === 'nivel_educacion_id') {
          opcionSeleccionada = nivelesEducacion.find(op => op.id === (perfil.nivel_educacion?.id || perfil.nivel_educacion_id));
        } else {
          opcionSeleccionada = opciones.find(op => op.id === perfil[campo]);
        }
        
        return (
          <div className="py-2.5 px-3 text-sm text-gray-900 font-medium bg-gray-50 rounded-lg border border-gray-100">
            {opcionSeleccionada ? opcionSeleccionada.nombre : '-'}
          </div>
        );
      } else if (tipo === 'date' && valor) {
        return (
          <div className="py-2.5 px-3 text-sm text-gray-900 font-medium bg-gray-50 rounded-lg border border-gray-100">
            {new Date(valor).toLocaleDateString('es-ES')}
          </div>
        );
      } else {
        return (
          <div className="py-2.5 px-3 text-sm text-gray-900 font-medium bg-gray-50 rounded-lg border border-gray-100">
            {valor || '-'}
          </div>
        );
      }
    }
    
    // Modo edición
    return (
      <div>
        {bloqueado && (
          <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 flex items-center gap-1">
            <LockClosedIcon className="w-3 h-3" />
            Este campo ya está completo y no puede modificarse. Contacte al administrador si necesita cambiarlo.
          </div>
        )}
        
        {tipo === 'select' && opciones ? (
          <select
            name={campo}
            value={valor}
            onChange={handleSelectChange}
            disabled={bloqueado}
            className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all ${
              bloqueado
                ? 'bg-amber-50/50 border-amber-200 text-gray-600 cursor-not-allowed'
                : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300 bg-white text-gray-900'
            }`}
          >
            <option value="">Seleccionar</option>
            {opciones.map(opcion => (
              <option key={opcion.id} value={opcion.id}>
                {opcion.nombre}
              </option>
            ))}
          </select>
        ) : tipo === 'textarea' ? (
          <textarea
            name={campo}
            value={valor}
            onChange={handleChange}
            disabled={bloqueado}
            rows={multiline ? 3 : 2}
            className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all resize-none ${
              bloqueado
                ? 'bg-amber-50/50 border-amber-200 text-gray-600 cursor-not-allowed'
                : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300 bg-white text-gray-900'
            }`}
          />
        ) : tipo === 'date' ? (
          <input
            type="date"
            name={campo}
            value={valor || ''}
            onChange={handleChange}
            disabled={bloqueado}
            className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all ${
              bloqueado
                ? 'bg-amber-50/50 border-amber-200 text-gray-600 cursor-not-allowed'
                : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300 bg-white text-gray-900'
            }`}
          />
        ) : tipo === 'number' ? (
          <input
            type="number"
            name={campo}
            value={valor}
            onChange={handleChange}
            disabled={bloqueado}
            min="0"
            className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all ${
              bloqueado
                ? 'bg-amber-50/50 border-amber-200 text-gray-600 cursor-not-allowed'
                : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300 bg-white text-gray-900'
            }`}
          />
        ) : (
          <input
            type={tipo}
            name={campo}
            value={valor}
            onChange={handleChange}
            disabled={bloqueado}
            className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all ${
              bloqueado
                ? 'bg-amber-50/50 border-amber-200 text-gray-600 cursor-not-allowed'
                : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300 bg-white text-gray-900'
            }`}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 mt-3 text-xs font-medium tracking-wide">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4 text-sm">No se pudo cargar el perfil</p>
          <button
            onClick={cargarDatos}
            className="bg-[#7B1FA2] text-white px-5 py-2.5 rounded-lg text-xs font-medium hover:bg-[#6A1B9A] transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
          notification.type === 'success'
            ? 'bg-white border-gray-200'
            : 'bg-white border-red-200'
        } flex items-center gap-2.5`}>
          {notification.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 text-[#A3C644]" />
          ) : (
            <XMarkIcon className="w-5 h-5 text-red-500" />
          )}
          <span className="text-xs font-medium text-gray-700">{notification.message}</span>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {modalEliminar.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Eliminar {modalEliminar.tipo === 'cv' ? 'CV' : 'DNI'}</h3>
                  <p className="text-xs text-white/80">Esta acción se aplicará al guardar</p>
                </div>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="px-6 py-5">
              <p className="text-gray-700 text-sm leading-relaxed mb-1">
                ¿Estás seguro de que deseas eliminar tu <span className="font-bold">{modalEliminar.tipo === 'cv' ? 'Curriculum Vitae' : 'Copia de DNI'}</span>?
              </p>
              <p className="text-gray-500 text-xs">
                El archivo será eliminado cuando hagas clic en el botón <span className="font-semibold text-[#A3C644]">"Guardar"</span>.
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setModalEliminar({ show: false, tipo: null, callback: null })}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={modalEliminar.callback}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all shadow-sm hover:shadow flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                  {perfil.nombres?.[0]}{perfil.apellidos?.[0]}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1.5">
                  {perfil.nombres} {perfil.apellidos}
                </h1>
                <div className="flex items-center gap-2.5 text-sm">
                  <span className="text-gray-500">{perfil.rol?.nombre}</span>
                  {perfil.especialidad && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="text-[#7B1FA2] font-medium">{perfil.especialidad.nombre}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Controles de edición */}
            <div className="flex items-center gap-3">
              {!modoEdicion && (
                <button
                  onClick={activarEdicion}
                  className="flex items-center gap-2 bg-[#7B1FA2] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#6A1B9A] transition-all"
                >
                  <PencilIcon className="w-4 h-4" />
                  Editar Perfil
                </button>
              )}

              {modoEdicion && (
                <div className="flex gap-2">
                  <button
                    onClick={cancelarEdicion}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all border border-gray-300"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="flex items-center gap-2 bg-[#A3C644] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all disabled:opacity-50"
                  >
                    {guardando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Username y Badge */}
          <div className="flex items-center gap-2.5">
            <div className="px-3.5 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-600 font-medium border border-gray-100">
              @{perfil.username}
            </div>
            {modoEdicion && (
              <div className="px-3.5 py-1.5 bg-blue-50 rounded-lg text-xs text-blue-600 font-medium border border-blue-200 flex items-center gap-1.5">
                <PencilIcon className="w-3.5 h-3.5" />
                Modo Edición
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-10"></div>

        {/* Content - List Style */}
        <div className="space-y-10">
          {/* Datos Personales */}
          <Section icon={UserIcon} title="Datos Personales" color="[#7B1FA2]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {/* Nombres */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Nombres
                </label>
                {renderCampo('nombres', 'Nombres')}
                {errors.nombres && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.nombres}</p>
                )}
              </div>

              {/* Apellidos */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Apellidos
                </label>
                {renderCampo('apellidos', 'Apellidos')}
                {errors.apellidos && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.apellidos}</p>
                )}
              </div>

              {/* DNI */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  DNI
                </label>
                {renderCampo('dni', 'DNI')}
                {errors.dni && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.dni}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Email
                </label>
                {renderCampo('email', 'Email', 'email')}
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
                )}
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Fecha de Nacimiento
                </label>
                {renderCampo('fecha_nacimiento', 'Fecha de Nacimiento', 'date')}
              </div>

              {/* Sexo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Sexo
                </label>
                {renderCampo('sexo_id', 'Sexo', 'select', generos)}
              </div>

              {/* Estado Civil */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Estado Civil
                </label>
                {renderCampo('estado_civil_id', 'Estado Civil', 'select', estadosCiviles)}
              </div>

              {/* Hijos */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Número de Hijos
                </label>
                {renderCampo('hijos', 'Número de Hijos', 'number')}
              </div>

              {/* País */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  País
                </label>
                {renderCampo('pais', 'País')}
              </div>

              {/* Especialidad (solo para Terapeutas) */}
              {perfil.rol?.nombre === 'Terapeuta' && (
                <>
                  {/* Especialidad */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Especialidad
                    </label>
                    {modoEdicion ? (
                      <div>
                        {isCampoBloqueado('especialidad_id') && (
                          <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 flex items-center gap-1">
                            <LockClosedIcon className="w-3 h-3" />
                            Este campo ya está completo y no puede modificarse. Contacte al administrador si necesita cambiarlo.
                          </div>
                        )}
                        <select
                          name="especialidad_id"
                          value={perfil.especialidad?.id || ''}
                          onChange={(e) => {
                            if (isCampoBloqueado('especialidad_id')) {
                              showNotification('La especialidad ya está completa y no puede modificarse. Contacte al administrador si necesita cambiarlo.', 'error');
                              return;
                            }
                            const espId = e.target.value === '' ? null : Number(e.target.value);
                            const esp = especialidades.find(e => e.id === espId);
                            setPerfil({ ...perfil, especialidad: esp });
                          }}
                          disabled={isCampoBloqueado('especialidad_id')}
                          className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all ${
                            isCampoBloqueado('especialidad_id')
                              ? 'bg-amber-50/50 border-amber-200 text-gray-600 cursor-not-allowed'
                              : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300 bg-white text-gray-900'
                          }`}
                        >
                          <option value="">Seleccionar especialidad</option>
                          {especialidades.map(esp => (
                            <option key={esp.id} value={esp.id}>
                              {esp.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="py-2.5 px-3 text-sm text-gray-900 font-medium bg-gray-50 rounded-lg border border-gray-100">
                        {perfil.especialidad?.nombre || '-'}
                      </div>
                    )}
                  </div>
                  
                  {/* Número de Colegiatura */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Número de Colegiatura
                    </label>
                    {renderCampo('numero_colegiatura', 'Número de Colegiatura')}
                  </div>
                </>
              )}
            </div>
          </Section>

          {/* Contacto */}
          <Section icon={PhoneIcon} title="Contacto" color="[#7B1FA2]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {/* Teléfono Personal */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Teléfono Personal
                </label>
                {renderCampo('telefono', 'Teléfono Personal')}
                {errors.telefono && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.telefono}</p>
                )}
              </div>

              {/* Teléfono Emergencia */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Teléfono Emergencia
                </label>
                {renderCampo('telefono_emergencia', 'Teléfono Emergencia')}
                {errors.telefono_emergencia && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.telefono_emergencia}</p>
                )}
              </div>

              {/* Contacto Emergencia */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Contacto Emergencia
                </label>
                {renderCampo('contacto_emergencia', 'Contacto Emergencia')}
              </div>

              {/* Parentesco de Emergencia */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Parentesco de Emergencia
                </label>
                {renderCampo('parentesco_emergencia_id', 'Parentesco de Emergencia', 'select', parentescos)}
              </div>
            </div>
          </Section>

          {/* Dirección */}
          <Section icon={MapPinIcon} title="Dirección" color="[#7B1FA2]">
            <div className="space-y-6">
              {/* Dirección Completa */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Dirección Completa
                </label>
                {renderCampo('direccion', 'Dirección Completa', 'textarea', null, true)}
              </div>

              {/* Referencia de Dirección */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Referencia de Dirección
                </label>
                {renderCampo('referencia_direccion', 'Referencia de Dirección', 'textarea', null, true)}
              </div>

              {/* Provincia, Distrito y Departamento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
                {/* Provincia */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Provincia
                  </label>
                  {modoEdicion ? (
                    <div>
                      {isCampoBloqueado('distrito_id') && (
                        <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 flex items-center gap-1">
                          <LockClosedIcon className="w-3 h-3" />
                          La ubicación ya está completa y no puede modificarse. Contacte al administrador si necesita cambiarlo.
                        </div>
                      )}
                      <select
                        name="provincia_id"
                        value={perfil.provincia_id || ''}
                        onChange={handleProvinciaChange}
                        disabled={isCampoBloqueado('distrito_id')}
                        className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all ${
                          isCampoBloqueado('distrito_id')
                            ? 'bg-amber-50/50 border-amber-200 text-gray-600 cursor-not-allowed'
                            : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value="">Seleccionar provincia</option>
                        {provincias.map(provincia => (
                          <option key={provincia.id} value={provincia.id}>
                            {provincia.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="py-2.5 px-3 text-sm text-gray-900 font-medium bg-gray-50 rounded-lg border border-gray-100">
                      {perfil.provincia || '-'}
                    </div>
                  )}
                </div>

                {/* Distrito */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Distrito
                  </label>
                  {modoEdicion ? (
                    <div>
                      {isCampoBloqueado('distrito_id') && (
                        <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 flex items-center gap-1">
                          <LockClosedIcon className="w-3 h-3" />
                          La ubicación ya está completa y no puede modificarse. Contacte al administrador si necesita cambiarlo.
                        </div>
                      )}
                      <select
                        name="distrito_id"
                        value={perfil.distrito_id || ''}
                        onChange={handleDistritoChange}
                        disabled={!perfil.provincia_id || isCampoBloqueado('distrito_id')}
                        className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all ${
                          !perfil.provincia_id || isCampoBloqueado('distrito_id')
                            ? 'bg-amber-50/50 border-amber-200 text-gray-600 cursor-not-allowed'
                            : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value="">Seleccionar distrito</option>
                        {distritosDisponibles.map(distrito => (
                          <option key={distrito.id} value={distrito.id}>
                            {distrito.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="py-2.5 px-3 text-sm text-gray-900 font-medium bg-gray-50 rounded-lg border border-gray-100">
                      {perfil.distrito || '-'}
                    </div>
                  )}
                </div>

                {/* Departamento */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Departamento
                  </label>
                  {renderCampo('departamento', 'Departamento')}
                </div>
              </div>
            </div>
          </Section>

          {/* Experiencia Laboral */}
          <Section icon={BriefcaseIcon} title="Experiencia Laboral" color="[#7B1FA2]">
            <div className="space-y-6">
              {/* Procedencia Laboral */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Procedencia Laboral
                </label>
                {renderCampo('procedencia_laboral', 'Procedencia Laboral', 'textarea', null, true)}
              </div>

              {/* Área Laboral */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Área Laboral
                </label>
                {renderCampo('area_laboral', 'Área Laboral')}
              </div>

              {/* Empresa Anterior */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Empresa Anterior
                </label>
                {renderCampo('empresa_anterior', 'Empresa Anterior')}
              </div>

              {/* Motivo de Renuncia */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Motivo de Renuncia
                </label>
                {renderCampo('motivo_renuncia', 'Motivo de Renuncia', 'textarea', null, true)}
              </div>
            </div>
          </Section>

          {/* Datos Académicos */}
          <Section icon={AcademicCapIcon} title="Datos Académicos" color="[#7B1FA2]">
            <div className="space-y-6">
              {/* Nivel de Educación */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Nivel de Educación
                </label>
                {renderCampo('nivel_educacion_id', 'Nivel de Educación', 'select', nivelesEducacion)}
              </div>

              {/* Centro de Estudios */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Centro de Estudios
                </label>
                {renderCampo('centro_estudios_principal', 'Centro de Estudios')}
              </div>

              {/* Carrera Estudiada */}
              <div>
                <label className="block text-xs font-semibold text-gray500 mb-2 uppercase tracking-wide">
                  Carrera Estudiada
                </label>
                {renderCampo('carrera_estudiada_principal', 'Carrera Estudiada')}
              </div>

              {/* Fechas de Estudio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Fecha de Inicio
                  </label>
                  {renderCampo('fecha_inicio_estudio', 'Fecha de Inicio', 'date')}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Fecha de Término
                  </label>
                  {renderCampo('fecha_termino_estudio', 'Fecha de Término', 'date')}
                </div>
              </div>
            </div>
          </Section>

          {/* Hobbies */}
          <Section icon={HeartIcon} title="Hobbies" color="[#7B1FA2]">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Hobbies
              </label>
              {renderCampo('hobbies', 'Hobbies', 'textarea', null, true)}
            </div>
          </Section>
          <Section icon={GiftIcon} title="Opciones de Regalo" color="[#7B1FA2]">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Opciones de Regalo
              </label>
              {renderCampo('opciones_regalo', 'Opciones de Regalo', 'textarea', null, true)}
            </div>
          </Section>

          {/* Documentos */}
          <Section icon={DocumentIcon} title="Documentos" color="[#7B1FA2]">
            <DocumentosSection
              empleado={perfil}
              readOnly={!modoEdicion}
              onUploadCV={handleUploadCV}
              onUploadDNI={handleUploadDNI}
              onViewCV={handleViewCV}
              onViewDNI={handleViewDNI}
              onDeleteCV={handleDeleteCV}
              onDeleteDNI={handleDeleteDNI}
              camposBloqueados={camposBloqueados}
            />
          </Section>

          {/* Tallas */}
          <Section icon={ShoppingBagIcon} title="Tallas" color="[#A3C644]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
              {/* Talla Polo/Camisa */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Polo/Camisa
                </label>
                {modoEdicion ? (
                  <div>
                    {isCampoBloqueado('talla_polo') && (
                      <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 flex items-center gap-1">
                        <LockClosedIcon className="w-3 h-3" />
                        Este campo ya está completo y no puede modificarse. Contacte al administrador si necesita cambiarlo.
                      </div>
                    )}
                    <select
                      name="talla_polo"
                      value={perfil.talla_polo || ''}
                      onChange={handleChange}
                      disabled={isCampoBloqueado('talla_polo')}
                      className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all ${
                        isCampoBloqueado('talla_polo')
                          ? 'bg-amber-50/50 border-amber-200 text-gray-600 cursor-not-allowed'
                          : 'border-gray-200 focus:border-[#A3C644] hover:border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="">Seleccionar</option>
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="py-2.5 px-3 text-sm text-gray-900 font-medium bg-gray-50 rounded-lg border border-gray-100">
                    {perfil.talla_polo || '-'}
                  </div>
                )}
              </div>

              {/* Talla Pantalón */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Pantalón
                </label>
                {renderCampo('talla_pantalon', 'Talla Pantalón')}
              </div>

              {/* Talla Zapatos */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Zapatos
                </label>
                {renderCampo('talla_zapatos', 'Talla Zapatos')}
              </div>
            </div>
          </Section>

          {/* Cuentas Bancarias */}
          <Section icon={ShoppingBagIcon} title="Información Bancaria" color="[#7B1FA2]">
            <CuentasBancarias
              trabajadorId={perfil.id}
              readOnly={!modoEdicion}
            />
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section = ({ icon: Icon, title, color, children }) => (
  <div>
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-8 h-8 rounded-lg bg-${color}/10 flex items-center justify-center`}>
        <Icon className={`w-4 h-4 text-${color}`} />
      </div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>
    <div className="pl-11">
      {children}
    </div>
  </div>
);

const CuentasBancarias = ({ trabajadorId, readOnly = false }) => {
  const [cuentas, setCuentas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    banco: '',
    numero_cuenta: '',
    cci: ''
  });

  const bancos = [
    'BCP', 'BBVA', 'INTERBANK', 'SCOTIABANK', 'BANBIF',
    'PICHINCHA', 'BANCO DE LA NACIÓN', 'OTROS'
  ];

  useEffect(() => {
    if (trabajadorId) {
      cargarCuentas();
    }
  }, [trabajadorId]);

  const cargarCuentas = async () => {
    try {
      setLoading(true);
      const data = await getCuentasBancarias(trabajadorId);
      setCuentas(data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarCuenta = async () => {
    if (!formData.banco || !formData.numero_cuenta) {
      alert('Por favor completa banco y número de cuenta');
      return;
    }

    try {
      setLoading(true);
      await crearCuentaBancaria({
        trabajadorId: trabajadorId,
        banco: formData.banco,
        numero_cuenta: formData.numero_cuenta,
        cci: formData.cci || null,
        es_principal: cuentas.length === 0
      });

      setFormData({ banco: '', numero_cuenta: '', cci: '' });
      setMostrarFormulario(false);
      await cargarCuentas();
    } catch (error) {
      console.error('Error al agregar cuenta:', error);
      alert('Error al agregar cuenta bancaria');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarCuenta = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta cuenta bancaria?')) return;

    try {
      setLoading(true);
      await eliminarCuentaBancaria(id);
      await cargarCuentas();
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      alert('Error al eliminar cuenta bancaria');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarPrincipal = async (id) => {
    try {
      setLoading(true);
      await marcarCuentaPrincipal(id);
      await cargarCuentas();
    } catch (error) {
      console.error('Error al marcar cuenta principal:', error);
      alert('Error al marcar como principal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Cuentas Bancarias {cuentas.length > 0 && `(${cuentas.length})`}
        </h3>
        {trabajadorId && !readOnly && (
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#7B1FA2] hover:bg-[#6A1B9A] rounded-lg transition-all"
            disabled={loading}
          >
            <PlusIcon className="w-4 h-4" />
            Agregar
          </button>
        )}
      </div>

      {mostrarFormulario && !readOnly && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Banco <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.banco}
                onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white"
              >
                <option value="">Seleccionar banco</option>
                {bancos.map(banco => (
                  <option key={banco} value={banco}>{banco}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Número de Cuenta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.numero_cuenta}
                onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all"
                placeholder="Ej: 19412345678901"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                CCI (Código de Cuenta Interbancario)
              </label>
              <input
                type="text"
                value={formData.cci}
                onChange={(e) => setFormData({ ...formData, cci: e.target.value })}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all"
                placeholder="Ej: 00219400123456789012"
                maxLength={20}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setMostrarFormulario(false);
                setFormData({ banco: '', numero_cuenta: '', cci: '' });
              }}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleAgregarCuenta}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#7B1FA2] hover:bg-[#6A1B9A] rounded-lg transition-all"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cuenta'}
            </button>
          </div>
        </div>
      )}

      {cuentas.length === 0 && !mostrarFormulario ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-sm text-gray-500">No hay cuentas bancarias registradas</p>
          {trabajadorId && !readOnly && (
            <p className="text-xs text-gray-400 mt-1">Haz clic en "Agregar" para registrar una cuenta</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {cuentas.map((cuenta) => (
            <div
              key={cuenta.id}
              className={`relative border-2 rounded-lg p-3 transition-all ${
                cuenta.es_principal
                  ? 'border-[#A3C644] bg-green-50/50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {cuenta.es_principal && (
                <div className="absolute -top-2 -right-2 bg-[#A3C644] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  PRINCIPAL
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 text-sm">{cuenta.banco}</h4>
                  </div>
                  <p className="text-xs text-gray-600 mb-0.5">
                    <span className="font-medium">Cuenta:</span> {cuenta.numero_cuenta}
                  </p>
                  {cuenta.cci && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">CCI:</span> {cuenta.cci}
                    </p>
                  )}
                </div>

                {!readOnly && trabajadorId && (
                  <div className="flex items-center gap-1">
                    {!cuenta.es_principal && (
                      <button
                        onClick={() => handleMarcarPrincipal(cuenta.id)}
                        className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded transition-all"
                        title="Marcar como principal"
                        disabled={loading}
                      >
                        <StarIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEliminarCuenta(cuenta.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                      title="Eliminar cuenta"
                      disabled={loading}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DocumentosSection = ({ 
  empleado, 
  onUploadCV, 
  onUploadDNI, 
  onViewCV, 
  onViewDNI, 
  onDeleteCV, 
  onDeleteDNI,
  readOnly = false,
  camposBloqueados
}) => {
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingDNI, setUploadingDNI] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleFileUpload = async (type, file) => {
  

    if (!file) {
      console.log('❌ No se recibió archivo');
      return;
    }

    const validTypes = {
      cv: ['.pdf', '.doc', '.docx'],
      dni: ['.pdf', '.jpg', '.jpeg', '.png']
    };

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
   

    if (!validTypes[type].includes(ext)) {
     
      alert(`Formato no válido. Formatos aceptados para ${type.toUpperCase()}: ${validTypes[type].join(', ')}`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
     
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

   

    if (type === 'cv' && camposBloqueados.archivo_cv) {
      
      alert('El CV ya está subido y no puede modificarse. Contacte al administrador si necesita cambiarlo.');
      return;
    }

    if (type === 'dni' && camposBloqueados.archivo_dni) {
     
      alert('El DNI ya está subido y no puede modificarse. Contacte al administrador si necesita cambiarlo.');
      return;
    }

   

    try {
      if (type === 'cv') {
       
        setUploadingCV(true);
        onUploadCV(file); // Solo actualiza estado local, no llama al servidor
      } else {
       
        setUploadingDNI(true);
        onUploadDNI(file); // Solo actualiza estado local, no llama al servidor
      }
   
    } catch (error) {
      console.error(`❌ Error al procesar ${type}:`, error);
      alert(`Error al subir el ${type.toUpperCase()}`);
    } finally {
      if (type === 'cv') setUploadingCV(false);
      else setUploadingDNI(false);
    }
  };

  const handleViewDocument = async (type) => {
    try {
      if (type === 'cv') await onViewCV();
      else await onViewDNI();
    } catch (error) {
      console.error(`Error al ver ${type}:`, error);
      alert(`Error al visualizar el ${type.toUpperCase()}`);
    }
  };

  const handleDeleteDocument = async (type) => {
    // Verificar si el documento ya está bloqueado
    if (type === 'cv' && camposBloqueados.archivo_cv) {
      // Usar el sistema de notificaciones del padre
      return; // El componente padre ya muestra el ícono de bloqueado, no es necesario alert
    }

    if (type === 'dni' && camposBloqueados.archivo_dni) {
      // Usar el sistema de notificaciones del padre
      return; // El componente padre ya muestra el ícono de bloqueado, no es necesario alert
    }

    try {
      // Los handlers del padre (onDeleteCV/onDeleteDNI) ya manejan la confirmación con modal
      if (type === 'cv') {
        onDeleteCV(); // Abre el modal de confirmación
      } else {
        onDeleteDNI(); // Abre el modal de confirmación
      }
    } catch (error) {
      console.error(`Error al eliminar ${type}:`, error);
      // No usar alert, simplemente log del error
    }
  };

 

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
        <DocumentIcon className="w-4 h-4" />
        Documentos Adjuntos
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CV */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Curriculum Vitae</h4>
            </div>
            {empleado.archivo_cv && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Subido
              </span>
            )}
          </div>

          {empleado.archivo_cv ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span className="truncate">{empleado.archivo_cv.split('/').pop()}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleViewDocument('cv')}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver
                </button>
                {!readOnly && !camposBloqueados.archivo_cv && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument('cv')}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                )}
              </div>
              {camposBloqueados.archivo_cv && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 flex items-center gap-1">
                  <LockClosedIcon className="w-3 h-3" />
                  El archivo CV ya está subido y no puede modificarse. Contacte al administrador si necesita cambiarlo.
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-3">No se ha subido CV</p>
          )}

          {!readOnly && !camposBloqueados.archivo_cv && (
            <div className="mt-3">
              <form onSubmit={handleFormSubmit}>
                <label className="block">
                  <div className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-all ${uploadingCV ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
                    {uploadingCV ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-600">Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Subir CV</span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload('cv', e.target.files[0])}
                      disabled={uploadingCV}
                    />
                  </div>
                </label>
              </form>
              <p className="text-xs text-gray-500 mt-2">Formatos: PDF, DOC, DOCX (Max. 10MB)</p>
            </div>
          )}
        </div>

        {/* DNI */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IdentificationIcon className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-gray-900">Copia de DNI</h4>
            </div>
            {empleado.archivo_dni && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Subido
              </span>
            )}
          </div>

          {empleado.archivo_dni ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span className="truncate">{empleado.archivo_dni.split('/').pop()}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleViewDocument('dni')}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver
                </button>
                {!readOnly && !camposBloqueados.archivo_dni && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument('dni')}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                )}
              </div>
              {camposBloqueados.archivo_dni && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 flex items-center gap-1">
                  <LockClosedIcon className="w-3 h-3" />
                  El archivo DNI ya está subido y no puede modificarse. Contacte al administrador si necesita cambiarlo.
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-3">No se ha subido DNI</p>
          )}

          {!readOnly && !camposBloqueados.archivo_dni && (
            <div className="mt-3">
              <form onSubmit={handleFormSubmit}>
                <label className="block">
                  <div className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-all ${uploadingDNI ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'}`}>
                    {uploadingDNI ? (
                      <>
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-600">Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Subir DNI</span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.webp"
                      onChange={(e) => handleFileUpload('dni', e.target.files[0])}
                      disabled={uploadingDNI}
                    />
                  </div>
                </label>
              </form>
              <p className="text-xs text-gray-500 mt-2">Formatos: PDF, JPG, PNG (Max. 10MB)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;