import React, { useState, useEffect } from 'react';
import { Users, Save, Edit, ChevronDown, ChevronUp, X, Plus, Trash2, Eye, ShieldAlert } from 'lucide-react';
import { calcularEdad } from '../../../../utils/date';
import { guardarEntrevistaPadres, obtenerEntrevistaPadres, actualizarEntrevistaPadres } from '../../../../services/entrevistaPadresService';
import { getGradosEscolares, getAtenciones, getRelacionPadres, getGeneros, getOcupaciones } from '../../../../services/catalogoService';
import { ROLES } from '../../../../constants/roles';

const EntrevistaPadresView = ({ paciente, user }) => {
  // ✅ CONTROL DE PERMISOS - Solo TERAPEUTA y ADMINISTRADOR pueden editar
  const puedeEditarHistoriaClinica = user?.rol?.id === ROLES.ADMINISTRADOR || user?.rol?.id === ROLES.TERAPEUTA;
  const esAdmision = user?.rol?.id === ROLES.ADMISION;
  // Función helper para obtener fecha local
  const getFechaLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [entrevistaPadres, setEntrevistaPadres] = useState({
    fecha: getFechaLocal(),
    nombrePaciente: paciente?.nombres + ' ' + paciente?.apellido_paterno + ' ' + paciente?.apellido_materno || '',
    lugarNacimiento: '',
    fechaNacimiento: paciente?.fecha_nacimiento || '',
    edad: paciente?.edad?.toString() || '',
    sexo: paciente?.sexo || '',
    escolaridad: '',
    motivoConsulta: '',
    derivacionInterna: '',
    cantidadHermanos: '',
    hermanos: [],
    relacionEntrePadres: '',
    detalleRelacionPadres: '',
    tiempoJuego: '',
    tiempoDispositivos: '',
    antecedentesFamiliares: '',
    antecedentesMedicos: '',
    antecedentesPsiquiatricos: '',
    antecedentesToxicologicos: '',
    antecedentesPrenatales: '',
    desarrolloMotor: '',
    desarrolloLenguaje: '',
    alimentacion: '',
    sueno: '',
    controlEsfinteres: '',
    antecedentesMedicosNino: '',
    antecedentesEscolares: '',
    relacionPares: '',
    expresionEmocional: '',
    relacionAutoridad: '',
    juegosPreferidos: '',
    actividadesFavoritas: '',
    recomendaciones: ''
  });

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [entrevistaExistente, setEntrevistaExistente] = useState(null);
  const [expandedEntrevista, setExpandedEntrevista] = useState(false);
  const [editando, setEditando] = useState(false);
  const [mostrarAgregarFamiliar, setMostrarAgregarFamiliar] = useState(false);
  const [tipoFamiliar, setTipoFamiliar] = useState('');
  const [familiares, setFamiliares] = useState([]);
  const [hermanos, setHermanos] = useState([]);
  const [gradosEscolares, setGradosEscolares] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [relacionPadres, setRelacionPadres] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [ocupaciones, setOcupaciones] = useState([]);

  // Cargar entrevista existente al montar el componente
  useEffect(() => {
    if (paciente?.id) {
      cargarEntrevistaExistente();
    }
  }, [paciente?.id]);

  // Cargar catálogos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [grados, atencionesData, relacionPadresData, generosData, ocupacionesData] = await Promise.all([
          getGradosEscolares(),
          getAtenciones(),
          getRelacionPadres(),
          getGeneros(),
          getOcupaciones()
        ]);
        setGradosEscolares(grados);
        setAtenciones(atencionesData);
        setRelacionPadres(relacionPadresData);
        setGeneros(generosData);
        setOcupaciones(ocupacionesData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    cargarDatos();
  }, []);

  // Actualizar datos del paciente cuando cambie
  useEffect(() => {
    if (paciente && !editando) {
      setEntrevistaPadres(prev => ({
        ...prev,
        nombrePaciente: `${paciente.nombres || ''} ${paciente.apellido_paterno || ''} ${paciente.apellido_materno || ''}`.trim(),
        fechaNacimiento: paciente.fecha_nacimiento || '',
        edad: paciente.edad?.toString() || '',
        sexo: paciente.sexo?.nombre || ''
      }));
    }
  }, [paciente, editando]);

  const cargarEntrevistaExistente = async () => {
    setLoading(true);
    try {
      const data = await obtenerEntrevistaPadres(paciente.id);
      console.log('Datos de entrevista cargados desde el backend:', data);
      if (data) {
        setEntrevistaExistente(data);
        setExpandedEntrevista(true);
      }
    } catch (error) {
      console.error('Error al cargar entrevista:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEntrevistaPadres(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const camposRequeridos = [
      { campo: 'escolaridad', nombre: 'Grado escolar' },
      { campo: 'motivoConsulta', nombre: 'Motivo de consulta' },
      { campo: 'derivacionInterna', nombre: 'Otras atenciones' },
      { campo: 'relacionEntrePadres', nombre: 'Relación entre los padres' },

      { campo: 'tiempoJuego', nombre: 'Tiempo de juego' },
      { campo: 'tiempoDispositivos', nombre: 'Tiempo de dispositivos' },
      { campo: 'antecedentesFamiliares', nombre: 'Antecedentes familiares' },
      { campo: 'antecedentesPrenatales', nombre: 'Antecedentes prenatales' },
      { campo: 'desarrolloMotor', nombre: 'Desarrollo motor' },
      { campo: 'desarrolloLenguaje', nombre: 'Desarrollo del lenguaje' },
      { campo: 'alimentacion', nombre: 'Alimentación' },
      { campo: 'sueno', nombre: 'Sueño' },
      { campo: 'controlEsfinteres', nombre: 'Control de esfínteres' },
      { campo: 'antecedentesMedicosNino', nombre: 'Antecedentes médicos del niño' },
      { campo: 'antecedentesEscolares', nombre: 'Antecedentes escolares' },
      { campo: 'relacionPares', nombre: 'Relación con pares' },
      { campo: 'expresionEmocional', nombre: 'Expresión emocional' },
      { campo: 'relacionAutoridad', nombre: 'Relación con figuras de autoridad' },
      { campo: 'juegosPreferidos', nombre: 'Juegos preferidos' },
      { campo: 'actividadesFavoritas', nombre: 'Actividades favoritas' },
      { campo: 'recomendaciones', nombre: 'Recomendaciones' }
    ];

    const camposFaltantes = [];
    camposRequeridos.forEach(({ campo, nombre }) => {
      if (!entrevistaPadres[campo] || entrevistaPadres[campo].toString().trim() === '') {
        nuevosErrores[campo] = 'Este campo es obligatorio';
        camposFaltantes.push(nombre);
      }
    });

    if (entrevistaPadres.antecedentesFamiliares === 'Si') {
      const camposAntecedentes = [
        { campo: 'antecedentesMedicos', nombre: 'Antecedentes médicos' },
        { campo: 'antecedentesPsiquiatricos', nombre: 'Antecedentes psiquiátricos' },
        { campo: 'antecedentesToxicologicos', nombre: 'Antecedentes toxicológicos' }
      ];
      camposAntecedentes.forEach(({ campo, nombre }) => {
        if (!entrevistaPadres[campo] || entrevistaPadres[campo].toString().trim() === '') {
          nuevosErrores[campo] = 'Este campo es obligatorio cuando hay antecedentes familiares';
          camposFaltantes.push(nombre);
        }
      });
    }

    if (familiares.length === 0) {
      nuevosErrores.familiares = 'Debe agregar al menos un miembro de la familia';
      camposFaltantes.push('Miembros de la familia');
    }

    setErrors(nuevosErrores);

    if (camposFaltantes.length > 0) {
      setSnackbarMessage(`Faltan completar los siguientes campos: ${camposFaltantes.join(', ')}`);
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    if (!user || !user.id) {
      setSnackbarMessage('Error: No se pudo obtener la información del usuario');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        paciente_id: paciente.id,
        usuario_id: user.id,
        fecha: entrevistaPadres.fecha,
        escolaridad: entrevistaPadres.escolaridad,
        motivo_consulta: entrevistaPadres.motivoConsulta,
        otras_atenciones: entrevistaPadres.derivacionInterna,
        antecedentes_familiares: entrevistaPadres.antecedentesFamiliares,
        antecedentes_medicos: entrevistaPadres.antecedentesMedicos,
        antecedentes_psiquiatricos: entrevistaPadres.antecedentesPsiquiatricos,
        antecedentes_toxicologicos: entrevistaPadres.antecedentesToxicologicos,
        relacion_entre_padres: entrevistaPadres.relacionEntrePadres,
        detalle_relacion_padres: entrevistaPadres.detalleRelacionPadres,
        cantidad_hermanos: entrevistaPadres.cantidadHermanos,
        tiempo_juego: entrevistaPadres.tiempoJuego,
        tiempo_dispositivos: entrevistaPadres.tiempoDispositivos,
        hermanos: hermanos,
        familiares: familiares,
        antecedentes_prenatales: entrevistaPadres.antecedentesPrenatales,
        desarrollo_motor: entrevistaPadres.desarrolloMotor,
        desarrollo_lenguaje: entrevistaPadres.desarrolloLenguaje,
        alimentacion: entrevistaPadres.alimentacion,
        sueno: entrevistaPadres.sueno,
        control_esfinteres: entrevistaPadres.controlEsfinteres,
        antecedentes_medicos_nino: entrevistaPadres.antecedentesMedicosNino,
        antecedentes_escolares: entrevistaPadres.antecedentesEscolares,
        relacion_pares: entrevistaPadres.relacionPares,
        expresion_emocional: entrevistaPadres.expresionEmocional,
        relacion_autoridad: entrevistaPadres.relacionAutoridad,
        juegos_preferidos: entrevistaPadres.juegosPreferidos,
        actividades_favoritas: entrevistaPadres.actividadesFavoritas,
        recomendaciones: entrevistaPadres.recomendaciones
      };

      if (entrevistaExistente) {
        await actualizarEntrevistaPadres(entrevistaExistente.id, dataToSend);
        setSnackbarMessage('Entrevista actualizada correctamente');
      } else {
        await guardarEntrevistaPadres(dataToSend);
        setSnackbarMessage('Entrevista guardada correctamente');
      }

      setSnackbarSeverity('success');
      setShowSnackbar(true);
      setEditando(false);
      await cargarEntrevistaExistente();
    } catch (error) {
      console.error('Error al guardar:', error);
      setSnackbarMessage('Error al guardar la entrevista');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setSaving(false);
    }
  };

  const handleNuevaEntrevista = () => {
    setEntrevistaExistente(null);
    setEditando(true);
    setExpandedEntrevista(false);
  };

  const handleEditar = () => {
    console.log('handleEditar - entrevistaExistente:', entrevistaExistente);
    if (entrevistaExistente) {
      const nombreCompleto = `${paciente?.nombres || ''} ${paciente?.apellido_paterno || ''} ${paciente?.apellido_materno || ''}`.trim();

      setEntrevistaPadres({
        fecha: entrevistaExistente.fecha?.split('T')[0] || getFechaLocal(),
        nombrePaciente: nombreCompleto,
        fechaNacimiento: paciente?.fecha_nacimiento || '',
        edad: paciente?.edad?.toString() || '',
        sexo: paciente?.sexo?.nombre || '',
        escolaridad: entrevistaExistente.escolaridad || '',
        motivoConsulta: entrevistaExistente.motivoConsulta || '',
        derivacionInterna: entrevistaExistente.otrasAtenciones || '',
        antecedentesFamiliares: entrevistaExistente.antecedentesFamiliares || '',
        antecedentesMedicos: entrevistaExistente.antecedentesMedicos || '',
        antecedentesPsiquiatricos: entrevistaExistente.antecedentesPsiquiatricos || '',
        antecedentesToxicologicos: entrevistaExistente.antecedentesToxicologicos || '',
        relacionEntrePadres: entrevistaExistente.relacionEntrePadres || '',
        detalleRelacionPadres: entrevistaExistente.detalleRelacionPadres || '',
        cantidadHermanos: entrevistaExistente.cantidadHermanos || '',
        tiempoJuego: entrevistaExistente.tiempoJuego || '',
        tiempoDispositivos: entrevistaExistente.tiempoDispositivos || '',
        antecedentesPrenatales: entrevistaExistente.antecedentesPrenatales || '',
        desarrolloMotor: entrevistaExistente.desarrolloMotor || '',
        desarrolloLenguaje: entrevistaExistente.desarrolloLenguaje || '',
        alimentacion: entrevistaExistente.alimentacion || '',
        sueno: entrevistaExistente.sueno || '',
        controlEsfinteres: entrevistaExistente.controlEsfinteres || '',
        antecedentesMedicosNino: entrevistaExistente.antecedentesMedicosNino || '',
        antecedentesEscolares: entrevistaExistente.antecedentesEscolares || '',
        relacionPares: entrevistaExistente.relacionPares || '',
        expresionEmocional: entrevistaExistente.expresionEmocional || '',
        relacionAutoridad: entrevistaExistente.relacionAutoridad || '',
        juegosPreferidos: entrevistaExistente.juegosPreferidos || '',
        actividadesFavoritas: entrevistaExistente.actividadesFavoritas || '',
        recomendaciones: entrevistaExistente.recomendaciones || ''
      });

      if (entrevistaExistente.hermanos) {
        setHermanos(entrevistaExistente.hermanos.map(hermano => ({
          id: hermano.id,
          nombre: hermano.nombre,
          edad: hermano.edad.toString(),
          sexo: hermano.sexoId?.toString() || ''
        })));
      }

      if (entrevistaExistente.familiares) {
        setFamiliares(entrevistaExistente.familiares.map(familiar => ({
          id: familiar.id,
          tipo: familiar.tipo,
          nombre: familiar.nombre,
          edad: familiar.edad.toString(),
          ocupacion: familiar.ocupacionId?.toString() || ''
        })));
      }
    }
    setEditando(true);
  };

  const handleAgregarFamiliar = () => {
    setMostrarAgregarFamiliar(true);
    if (errors.familiares) {
      setErrors(prev => ({
        ...prev,
        familiares: ''
      }));
    }
  };

  const handleTipoFamiliarChange = (tipo) => {
    setTipoFamiliar(tipo);
    if (tipo) {
      const nuevoFamiliar = {
        id: Date.now(),
        tipo: tipo,
        nombre: '',
        edad: '',
        ocupacion: ''
      };
      setFamiliares([...familiares, nuevoFamiliar]);
      setMostrarAgregarFamiliar(false);
      setTipoFamiliar('');
      if (errors.familiares) {
        setErrors(prev => ({
          ...prev,
          familiares: ''
        }));
      }
    }
  };

  const handleFamiliarChange = (familiarId, field, value) => {
    setFamiliares(familiares.map(familiar =>
      familiar.id === familiarId
        ? { ...familiar, [field]: value }
        : familiar
    ));
    const errorKey = `familiar_${familiarId}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  const handleEliminarFamiliar = (familiarId) => {
    setFamiliares(familiares.filter(familiar => familiar.id !== familiarId));
  };

  const handleCantidadHermanosChange = (cantidad) => {
    setEntrevistaPadres(prev => ({ ...prev, cantidadHermanos: cantidad }));

    const nuevaCantidad = parseInt(cantidad) || 0;
    const nuevosHermanos = [];

    for (let i = 0; i < nuevaCantidad; i++) {
      nuevosHermanos.push({
        id: i + 1,
        nombre: hermanos[i]?.nombre || '',
        edad: hermanos[i]?.edad || '',
        sexo: hermanos[i]?.sexo || ''
      });
    }

    setHermanos(nuevosHermanos);
  };

  const handleHermanoChange = (id, campo, valor) => {
    setHermanos(prev =>
      prev.map(hermano =>
        hermano.id === id ? { ...hermano, [campo]: valor } : hermano
      )
    );
    const errorKey = `hermano_${id}_${campo}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  const mostrarFormulario = !entrevistaExistente || editando;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 text-xs font-medium">Cargando entrevista...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Notification */}
      {showSnackbar && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
          snackbarSeverity === 'success'
            ? 'bg-white border-gray-100'
            : 'bg-white border-red-100'
        } flex items-center gap-2.5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${snackbarSeverity === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium text-gray-700">{snackbarMessage}</span>
          <button onClick={() => setShowSnackbar(false)} className="ml-2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Entrevista a Padres</h2>
            <p className="text-sm text-gray-500">Formulario de entrevista inicial</p>
          </div>
        </div>

        {entrevistaExistente && !editando && (
          puedeEditarHistoriaClinica ? (
            <button
              onClick={handleEditar}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
            >
              <Edit className="w-4 h-4" />
              Editar Entrevista
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-amber-700 font-medium">
                Solo lectura
              </span>
            </div>
          )
        )}
      </div>

      {/* Vista Resumida o Formulario */}
      {entrevistaExistente && !editando ? (
        <VistaResumenEntrevista
          entrevista={entrevistaExistente}
          expandida={expandedEntrevista}
          onToggle={() => setExpandedEntrevista(!expandedEntrevista)}
        />
      ) : (
        <FormularioEntrevista
          entrevistaPadres={entrevistaPadres}
          handleInputChange={handleInputChange}
          errors={errors}
          gradosEscolares={gradosEscolares}
          atenciones={atenciones}
          relacionPadres={relacionPadres}
          generos={generos}
          ocupaciones={ocupaciones}
          hermanos={hermanos}
          handleHermanoChange={handleHermanoChange}
          handleCantidadHermanosChange={handleCantidadHermanosChange}
          familiares={familiares}
          handleFamiliarChange={handleFamiliarChange}
          handleEliminarFamiliar={handleEliminarFamiliar}
          mostrarAgregarFamiliar={mostrarAgregarFamiliar}
          setMostrarAgregarFamiliar={setMostrarAgregarFamiliar}
          tipoFamiliar={tipoFamiliar}
          handleTipoFamiliarChange={handleTipoFamiliarChange}
          handleAgregarFamiliar={handleAgregarFamiliar}
          onGuardar={handleGuardar}
          saving={saving}
          esNuevo={!entrevistaExistente}
          puedeEditarHistoriaClinica={puedeEditarHistoriaClinica}
        />
      )}
    </div>
  );
};

// Componente de Vista Resumen
const VistaResumenEntrevista = ({ entrevista, expandida, onToggle }) => {
  console.log('VistaResumenEntrevista - entrevista:', entrevista);

  const DataRow = ({ label, value, fullWidth = false }) => (
    <div className={`py-3 border-b border-gray-100 ${fullWidth ? 'md:col-span-2' : ''}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{label}</p>
      <p className="text-sm text-gray-900 whitespace-pre-line">{value || 'No especificado'}</p>
    </div>
  );

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-all"
      >
        <span className="font-semibold text-gray-900">Entrevista Registrada</span>
        {expandida ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {expandida && (
        <div className="p-6">
          {/* I. DATOS GENERALES */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[#A3C644] uppercase mb-4 pb-2 border-b-2 border-[#A3C644]">I. DATOS GENERALES</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DataRow label="Grado Escolar Actual" value={entrevista.gradoEscolar?.nombre ? ` ${entrevista.gradoEscolar.nombre}` : 'No especificado'} />
              <DataRow label="Otras Atenciones" value={entrevista.atenciones?.nombre || 'No especificado'} />
              <DataRow label="Motivo Principal de Consulta" value={entrevista.motivoConsulta || entrevista.motivo_consulta} fullWidth />
            </div>
          </div>

          {/* II. HISTORIA FAMILIAR */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[#A3C644] uppercase mb-4 pb-2 border-b-2 border-[#A3C644]">II. HISTORIA FAMILIAR</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DataRow label="Relación entre los padres" value={entrevista.relacionPadres?.nombre || 'No especificado'} />
              <DataRow label="Cantidad de hermanos" value={entrevista.cantidadHermanos || entrevista.cantidad_hermanos} />
              <DataRow label="Detalle de la relación entre los padres" value={entrevista.detalleRelacionPadres || entrevista.detalle_relacion_padres} fullWidth />

              {/* Mostrar hermanos */}
              {entrevista.hermanos && entrevista.hermanos.length > 0 && (
                <div className="py-3 border-b border-gray-100 md:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Hermanos</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {entrevista.hermanos.map((hermano, index) => (
                      <div key={hermano.id} className="text-sm text-gray-900">
                        <span className="font-medium">Hermano {index + 1}:</span> {hermano.nombre} - {hermano.edad} años - {hermano.sexo?.nombre || 'No especificado'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mostrar familiares */}
              {entrevista.familiares && entrevista.familiares.length > 0 && (
                <div className="py-3 border-b border-gray-100 md:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Miembros de la Familia</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {entrevista.familiares.map((familiar, index) => (
                      <div key={familiar.id} className="text-sm text-gray-900">
                        <span className="font-medium">{familiar.tipo}:</span> {familiar.nombre} - {familiar.edad} años - {familiar.ocupacion?.nombre || 'No especificado'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DataRow label="Tiempo de juego libre (hrs/día)" value={entrevista.tiempoJuego || entrevista.tiempo_juego} />
              <DataRow label="Tiempo en dispositivos (hrs/día)" value={entrevista.tiempoDispositivos || entrevista.tiempo_dispositivos} />
              <DataRow label="¿Existen antecedentes familiares de enfermedades?" value={entrevista.antecedentesFamiliares || entrevista.antecedentes_familiares} />

              {(entrevista.antecedentesFamiliares === 'Si' || entrevista.antecedentes_familiares === 'Si') && (
                <>
                  <DataRow label="Antecedentes médicos" value={entrevista.antecedentesMedicos || entrevista.antecedentes_medicos} fullWidth />
                  <DataRow label="Antecedentes psiquiátricos" value={entrevista.antecedentesPsiquiatricos || entrevista.antecedentes_psiquiatricos} fullWidth />
                  <DataRow label="Antecedentes toxicológicos" value={entrevista.antecedentesToxicologicos || entrevista.antecedentes_toxicologicos} fullWidth />
                </>
              )}
            </div>
          </div>

          {/* III. HISTORIA DEL DESARROLLO */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[#A3C644] uppercase mb-4 pb-2 border-b-2 border-[#A3C644]">III. HISTORIA DEL DESARROLLO</h4>
            <div className="grid grid-cols-1 gap-x-6">
              <DataRow label="Antecedentes prenatales, perinatales y postnatales" value={entrevista.antecedentesPrenatales || entrevista.antecedentes_prenatales} />
              <DataRow label="Desarrollo motor" value={entrevista.desarrolloMotor || entrevista.desarrollo_motor} />
              <DataRow label="Desarrollo del lenguaje" value={entrevista.desarrolloLenguaje || entrevista.desarrollo_lenguaje} />
              <DataRow label="Alimentación" value={entrevista.alimentacion} />
              <DataRow label="Sueño" value={entrevista.sueno} />
              <DataRow label="Control de esfínteres" value={entrevista.controlEsfinteres || entrevista.control_esfinteres} />
              <DataRow label="Antecedentes médicos del niño" value={entrevista.antecedentesMedicosNino || entrevista.antecedentes_medicos_nino} />
              <DataRow label="Antecedentes escolares" value={entrevista.antecedentesEscolares || entrevista.antecedentes_escolares} />
            </div>
          </div>

          {/* IV. ASPECTOS DE SOCIALIZACIÓN Y AFECTIVO */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[#A3C644] uppercase mb-4 pb-2 border-b-2 border-[#A3C644]">IV. ASPECTOS DE SOCIALIZACIÓN Y AFECTIVO</h4>
            <div className="grid grid-cols-1 gap-x-6">
              <DataRow label="Relación con pares" value={entrevista.relacionPares || entrevista.relacion_pares} />
              <DataRow label="Expresión emocional" value={entrevista.expresionEmocional || entrevista.expresion_emocional} />
              <DataRow label="Relación con figuras de autoridad" value={entrevista.relacionAutoridad || entrevista.relacion_autoridad} />
            </div>
          </div>

          {/* V. INTERESES Y PASATIEMPOS */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[#A3C644] uppercase mb-4 pb-2 border-b-2 border-[#A3C644]">V. INTERESES Y PASATIEMPOS</h4>
            <div className="grid grid-cols-1 gap-x-6">
              <DataRow label="Juegos preferidos" value={entrevista.juegosPreferidos || entrevista.juegos_preferidos} />
              <DataRow label="Actividades favoritas" value={entrevista.actividadesFavoritas || entrevista.actividades_favoritas} />
            </div>
          </div>

          {/* VI. RECOMENDACIONES */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[#A3C644] uppercase mb-4 pb-2 border-b-2 border-[#A3C644]">VI. RECOMENDACIONES</h4>
            <div className="grid grid-cols-1 gap-x-6">
              <DataRow label="Recomendaciones y observaciones finales" value={entrevista.recomendaciones} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componentes auxiliares para el formulario (fuera del componente principal para evitar re-renders)
const Section = ({ title, children }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
    <h3 className="text-sm font-semibold text-[#7B1FA2] uppercase tracking-wide mb-6 pb-2 border-b-2 border-[#7B1FA2]">{title}</h3>
    {children}
  </div>
);

const FormField = ({ label, required, error, children, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// Componente de Formulario COMPLETO
const FormularioEntrevista = ({
  entrevistaPadres,
  handleInputChange,
  errors,
  gradosEscolares,
  atenciones,
  relacionPadres,
  generos,
  ocupaciones,
  hermanos,
  handleHermanoChange,
  handleCantidadHermanosChange,
  familiares,
  handleFamiliarChange,
  handleEliminarFamiliar,
  mostrarAgregarFamiliar,
  setMostrarAgregarFamiliar,
  tipoFamiliar,
  handleTipoFamiliarChange,
  handleAgregarFamiliar,
  onGuardar,
  saving,
  esNuevo,
  puedeEditarHistoriaClinica
}) => {

  return (
    <div className="space-y-6">
      {/* I. DATOS GENERALES */}
      <Section title="I. DATOS GENERALES">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="GRADO ESCOLAR ACTUAL" required error={errors.escolaridad}>
            <select
              value={entrevistaPadres.escolaridad}
              onChange={(e) => handleInputChange('escolaridad', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
            >
              <option value="">Seleccionar grado</option>
              {gradosEscolares.map((grado) => (
                <option key={grado.id} value={grado.id}>
                  {grado.nombre}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="MOTIVO PRINCIPAL DE CONSULTA" required error={errors.motivoConsulta} className="md:col-span-2">
            <textarea
              value={entrevistaPadres.motivoConsulta}
              onChange={(e) => handleInputChange('motivoConsulta', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa el motivo de consulta..."
            />
          </FormField>

          <FormField label="OTRAS ATENCIONES" required error={errors.derivacionInterna}>
            <select
              value={entrevistaPadres.derivacionInterna}
              onChange={(e) => handleInputChange('derivacionInterna', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
            >
              <option value="">Seleccionar</option>
              {atenciones.map((atencion) => (
                <option key={atencion.id} value={atencion.id}>
                  {atencion.nombre}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </Section>

      {/* II. HISTORIA FAMILIAR */}
      <Section title="II. HISTORIA FAMILIAR">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Relación entre padres */}
          <FormField label="RELACIÓN ENTRE LOS PADRES" required error={errors.relacionEntrePadres}>
            <select
              value={entrevistaPadres.relacionEntrePadres}
              onChange={(e) => handleInputChange('relacionEntrePadres', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
            >
              <option value="">Seleccionar</option>
              {relacionPadres.map((relacion) => (
                <option key={relacion.id} value={relacion.id}>
                  {relacion.nombre}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="DETALLE DE LA RELACIÓN ENTRE LOS PADRES" className="md:col-span-2">
            <textarea
              value={entrevistaPadres.detalleRelacionPadres}
              onChange={(e) => handleInputChange('detalleRelacionPadres', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa la relación..."
            />
          </FormField>

          {/* Cantidad de hermanos */}
          <FormField label="CANTIDAD DE HERMANOS" required error={errors.cantidadHermanos}>
            <input
              type="number"
              min="0"
              value={entrevistaPadres.cantidadHermanos}
              onChange={(e) => handleCantidadHermanosChange(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
            />
          </FormField>

          {/* Datos de hermanos */}
          {hermanos.length > 0 && (
            <div className="md:col-span-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Datos de los Hermanos</h4>
              <div className="space-y-4">
                {hermanos.map((hermano, index) => (
                  <div key={hermano.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-3">Hermano {index + 1}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField label="NOMBRE COMPLETO" required error={errors[`hermano_${hermano.id}_nombre`]}>
                        <input
                          type="text"
                          value={hermano.nombre}
                          onChange={(e) => handleHermanoChange(hermano.id, 'nombre', e.target.value)}
                          className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium"
                          placeholder="Nombre del hermano"
                        />
                      </FormField>
                      <FormField label="EDAD" required error={errors[`hermano_${hermano.id}_edad`]}>
                        <input
                          type="number"
                          value={hermano.edad}
                          onChange={(e) => handleHermanoChange(hermano.id, 'edad', e.target.value)}
                          className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium"
                        />
                      </FormField>
                      <FormField label="SEXO" required error={errors[`hermano_${hermano.id}_sexo`]}>
                        <select
                          value={hermano.sexo}
                          onChange={(e) => handleHermanoChange(hermano.id, 'sexo', e.target.value)}
                          className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium"
                        >
                          <option value="">Seleccionar</option>
                          {generos.map((genero) => (
                            <option key={genero.id} value={genero.id}>
                              {genero.nombre}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Miembros de la familia */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700">Miembros de la Familia</h4>
              <button
                onClick={handleAgregarFamiliar}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Agregar Familiar
              </button>
            </div>

            {errors.familiares && <p className="text-xs text-red-500 mb-2">{errors.familiares}</p>}

            {mostrarAgregarFamiliar && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <FormField label="TIPO DE FAMILIAR">
                  <select
                    value={tipoFamiliar}
                    onChange={(e) => handleTipoFamiliarChange(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Madre">Madre</option>
                    <option value="Padre">Padre</option>
                    <option value="Hermano">Hermano</option>
                    <option value="Hermana">Hermana</option>
                    <option value="Abuelo">Abuelo</option>
                    <option value="Abuela">Abuela</option>
                    <option value="Tío">Tío</option>
                    <option value="Tía">Tía</option>
                    <option value="Otro">Otro</option>
                  </select>
                </FormField>
                <button
                  onClick={() => setMostrarAgregarFamiliar(false)}
                  className="mt-3 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
              </div>
            )}

            {familiares.length > 0 && (
              <div className="space-y-4">
                {familiares.map((familiar, index) => (
                  <div key={familiar.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-600">{familiar.tipo} {index + 1}</p>
                      <button
                        onClick={() => handleEliminarFamiliar(familiar.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField label="NOMBRE COMPLETO" required error={errors[`familiar_${familiar.id}_nombre`]}>
                        <input
                          type="text"
                          value={familiar.nombre}
                          onChange={(e) => handleFamiliarChange(familiar.id, 'nombre', e.target.value)}
                          className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium"
                        />
                      </FormField>
                      <FormField label="EDAD" required error={errors[`familiar_${familiar.id}_edad`]}>
                        <input
                          type="number"
                          value={familiar.edad}
                          onChange={(e) => handleFamiliarChange(familiar.id, 'edad', e.target.value)}
                          className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium"
                        />
                      </FormField>
                      <FormField label="OCUPACIÓN" required error={errors[`familiar_${familiar.id}_ocupacion`]}>
                        <select
                          value={familiar.ocupacion}
                          onChange={(e) => handleFamiliarChange(familiar.id, 'ocupacion', e.target.value)}
                          className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium"
                        >
                          <option value="">Seleccionar</option>
                          {ocupaciones.map((ocupacion) => (
                            <option key={ocupacion.id} value={ocupacion.id}>
                              {ocupacion.nombre}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tiempo de juego y dispositivos */}
          <FormField label="TIEMPO DE JUEGO LIBRE (horas/día)" required error={errors.tiempoJuego}>
            <input
              type="text"
              value={entrevistaPadres.tiempoJuego}
              onChange={(e) => handleInputChange('tiempoJuego', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Ej: 2 horas"
            />
          </FormField>

          <FormField label="TIEMPO EN DISPOSITIVOS ELECTRÓNICOS (horas/día)" required error={errors.tiempoDispositivos}>
            <input
              type="text"
              value={entrevistaPadres.tiempoDispositivos}
              onChange={(e) => handleInputChange('tiempoDispositivos', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Ej: 1 hora"
            />
          </FormField>

          {/* Antecedentes Familiares */}
          <FormField label="¿EXISTEN ANTECEDENTES FAMILIARES DE ENFERMEDADES?" required error={errors.antecedentesFamiliares}>
            <select
              value={entrevistaPadres.antecedentesFamiliares}
              onChange={(e) => handleInputChange('antecedentesFamiliares', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
            >
              <option value="">Seleccionar</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
            </select>
          </FormField>

          {entrevistaPadres.antecedentesFamiliares === 'Si' && (
            <>
              <FormField label="ANTECEDENTES MÉDICOS (enfermedades, tratamientos, hospitalizaciones)" required error={errors.antecedentesMedicos} className="md:col-span-2">
                <textarea
                  value={entrevistaPadres.antecedentesMedicos}
                  onChange={(e) => handleInputChange('antecedentesMedicos', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
                />
              </FormField>

              <FormField label="ANTECEDENTES PSIQUIÁTRICOS (trastornos mentales, tratamientos psicológicos)" required error={errors.antecedentesPsiquiatricos} className="md:col-span-2">
                <textarea
                  value={entrevistaPadres.antecedentesPsiquiatricos}
                  onChange={(e) => handleInputChange('antecedentesPsiquiatricos', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
                />
              </FormField>

              <FormField label="ANTECEDENTES TOXICOLÓGICOS (consumo de sustancias, adicciones)" required error={errors.antecedentesToxicologicos} className="md:col-span-2">
                <textarea
                  value={entrevistaPadres.antecedentesToxicologicos}
                  onChange={(e) => handleInputChange('antecedentesToxicologicos', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
                />
              </FormField>
            </>
          )}
        </div>
      </Section>

      {/* III. HISTORIA DEL DESARROLLO */}
      <Section title="III. HISTORIA DEL DESARROLLO">
        <div className="grid grid-cols-1 gap-6">
          <FormField label="ANTECEDENTES PRENATALES, PERINATALES Y POSTNATALES (embarazo, parto, complicaciones)" required error={errors.antecedentesPrenatales}>
            <textarea
              value={entrevistaPadres.antecedentesPrenatales}
              onChange={(e) => handleInputChange('antecedentesPrenatales', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa los antecedentes prenatales..."
            />
          </FormField>

          <FormField label="DESARROLLO MOTOR (sostén cefálico, sedestación, gateo, marcha)" required error={errors.desarrolloMotor}>
            <textarea
              value={entrevistaPadres.desarrolloMotor}
              onChange={(e) => handleInputChange('desarrolloMotor', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa el desarrollo motor..."
            />
          </FormField>

          <FormField label="DESARROLLO DEL LENGUAJE (balbuceo, primeras palabras, frases)" required error={errors.desarrolloLenguaje}>
            <textarea
              value={entrevistaPadres.desarrolloLenguaje}
              onChange={(e) => handleInputChange('desarrolloLenguaje', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa el desarrollo del lenguaje..."
            />
          </FormField>

          <FormField label="ALIMENTACIÓN (lactancia, tipo de alimentación, hábitos actuales)" required error={errors.alimentacion}>
            <textarea
              value={entrevistaPadres.alimentacion}
              onChange={(e) => handleInputChange('alimentacion', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa la alimentación..."
            />
          </FormField>

          <FormField label="SUEÑO (rutinas, horarios, dificultades)" required error={errors.sueno}>
            <textarea
              value={entrevistaPadres.sueno}
              onChange={(e) => handleInputChange('sueno', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa el patrón de sueño..."
            />
          </FormField>

          <FormField label="CONTROL DE ESFÍNTERES (edad de inicio, método utilizado, dificultades)" required error={errors.controlEsfinteres}>
            <textarea
              value={entrevistaPadres.controlEsfinteres}
              onChange={(e) => handleInputChange('controlEsfinteres', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa el control de esfínteres..."
            />
          </FormField>

          <FormField label="ANTECEDENTES MÉDICOS DEL NIÑO (enfermedades, cirugías, medicación actual)" required error={errors.antecedentesMedicosNino}>
            <textarea
              value={entrevistaPadres.antecedentesMedicosNino}
              onChange={(e) => handleInputChange('antecedentesMedicosNino', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa los antecedentes médicos..."
            />
          </FormField>

          <FormField label="ANTECEDENTES ESCOLARES (adaptación, rendimiento, relación con docentes)" required error={errors.antecedentesEscolares}>
            <textarea
              value={entrevistaPadres.antecedentesEscolares}
              onChange={(e) => handleInputChange('antecedentesEscolares', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa los antecedentes escolares..."
            />
          </FormField>
        </div>
      </Section>

      {/* IV. ASPECTOS DE SOCIALIZACIÓN Y AFECTIVO */}
      <Section title="IV. ASPECTOS DE SOCIALIZACIÓN Y AFECTIVO">
        <div className="grid grid-cols-1 gap-6">
          <FormField label="RELACIÓN CON PARES (amigos, interacción social, conflictos)" required error={errors.relacionPares}>
            <textarea
              value={entrevistaPadres.relacionPares}
              onChange={(e) => handleInputChange('relacionPares', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa la relación con pares..."
            />
          </FormField>

          <FormField label="EXPRESIÓN EMOCIONAL (manejo de emociones, reacciones, conductas)" required error={errors.expresionEmocional}>
            <textarea
              value={entrevistaPadres.expresionEmocional}
              onChange={(e) => handleInputChange('expresionEmocional', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa la expresión emocional..."
            />
          </FormField>

          <FormField label="RELACIÓN CON FIGURAS DE AUTORIDAD (padres, profesores, límites)" required error={errors.relacionAutoridad}>
            <textarea
              value={entrevistaPadres.relacionAutoridad}
              onChange={(e) => handleInputChange('relacionAutoridad', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa la relación con figuras de autoridad..."
            />
          </FormField>
        </div>
      </Section>

      {/* V. INTERESES Y PASATIEMPOS */}
      <Section title="V. INTERESES Y PASATIEMPOS">
        <div className="grid grid-cols-1 gap-6">
          <FormField label="JUEGOS PREFERIDOS (tipos de juego, juguetes favoritos)" required error={errors.juegosPreferidos}>
            <textarea
              value={entrevistaPadres.juegosPreferidos}
              onChange={(e) => handleInputChange('juegosPreferidos', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa los juegos preferidos..."
            />
          </FormField>

          <FormField label="ACTIVIDADES FAVORITAS (hobbies, deportes, actividades recreativas)" required error={errors.actividadesFavoritas}>
            <textarea
              value={entrevistaPadres.actividadesFavoritas}
              onChange={(e) => handleInputChange('actividadesFavoritas', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
              placeholder="Describa las actividades favoritas..."
            />
          </FormField>
        </div>
      </Section>

      {/* VI. RECOMENDACIONES */}
      <Section title="VI. RECOMENDACIONES">
        <FormField label="RECOMENDACIONES Y OBSERVACIONES FINALES" required error={errors.recomendaciones}>
          <textarea
            value={entrevistaPadres.recomendaciones}
            onChange={(e) => handleInputChange('recomendaciones', e.target.value)}
            rows={6}
            className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none bg-white text-gray-900 font-medium hover:border-gray-300"
            placeholder="Escriba las recomendaciones..."
          />
        </FormField>
      </Section>

      {/* Botones de acción */}
      {puedeEditarHistoriaClinica && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onGuardar}
            disabled={saving}
            className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {esNuevo ? 'Guardar Entrevista' : 'Actualizar Entrevista'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default EntrevistaPadresView;
