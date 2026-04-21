import React, { useState, useEffect } from 'react';
import { User, Save, ChevronDown, ChevronUp, X, Plus, FileText } from 'lucide-react';
import {
  crearEntrevistaAdultos,
  actualizarEntrevistaAdultos,
  obtenerEntrevistasAdultosPorPaciente,
} from '../../services/entrevistaAdultosService';
import { getPacienteById } from '../../services/pacienteService';
import { ROLES } from '../../constants/roles';

const SintomaToggle = ({ label, campo, formData, handleChange }) => (
  <div className="border-2 border-gray-200 rounded-lg p-3">
    <div className="flex items-center justify-between mb-2">
      <label className="text-xs font-semibold text-gray-600 uppercase">{label}</label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleChange(`${campo}Presente`, true)}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            formData[`${campo}Presente`] === true
              ? 'bg-[#7B1FA2] text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Sí
        </button>
        <button
          type="button"
          onClick={() => {
            handleChange(`${campo}Presente`, false);
            handleChange(`${campo}Detalle`, '');
          }}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            formData[`${campo}Presente`] === false
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          No
        </button>
      </div>
    </div>
    {formData[`${campo}Presente`] === true && (
      <input
        type="text"
        placeholder="Especifique..."
        value={formData[`${campo}Detalle`] || ''}
        onChange={(e) => handleChange(`${campo}Detalle`, e.target.value)}
        className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
      />
    )}
  </div>
);

const HabitoToggle = ({ label, campo, formData, handleChange, multiline = false }) => (
  <div className="border-2 border-gray-200 rounded-lg p-3">
    <div className="flex items-center justify-between mb-2">
      <label className="text-xs font-semibold text-gray-600 uppercase">{label}</label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleChange(`${campo}Presente`, true)}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            formData[`${campo}Presente`] === true
              ? 'bg-[#7B1FA2] text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Sí
        </button>
        <button
          type="button"
          onClick={() => {
            handleChange(`${campo}Presente`, false);
            handleChange(campo === 'acusadoDetenido' ? 'acusadoDetenidoPreso' : campo, '');
          }}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            formData[`${campo}Presente`] === false
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          No
        </button>
      </div>
    </div>
    {formData[`${campo}Presente`] === true && (
      multiline ? (
        <textarea
          placeholder="Especifique..."
          value={formData[campo === 'acusadoDetenido' ? 'acusadoDetenidoPreso' : campo] || ''}
          onChange={(e) => handleChange(campo === 'acusadoDetenido' ? 'acusadoDetenidoPreso' : campo, e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all resize-none"
        />
      ) : (
        <input
          type="text"
          placeholder="Especifique..."
          value={formData[campo] || ''}
          onChange={(e) => handleChange(campo, e.target.value)}
          className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
        />
      )
    )}
  </div>
);

const FORM_INICIAL = {
  fecha: '',
  nombre: '', edad: '', genero: '',lugarNacimiento: '',
fechaNacimiento: '',
  domicilioActual: '', telefono: '',
  estadoCivil: '', religion: '', escolaridad: '', ocupacion: '',
  remitidoPorId: '',
  remitidoPorNombre: '',
  motivoConsulta: '',
  antecedentesSituacion: '', funcionesOrganicas: '',
  nombrePadre: '', edadPadre: '', escolaridadOcupacionPadre: '',
  enfermedadesPadre: '', relacionPadrePaciente: '', imposicionCastigosPadre: '',
  nombreMadre: '', edadMadre: '', escolaridadOcupacionMadre: '',
  enfermedadesMadre: '', relacionMadrePaciente: '', imposicionCastigosMadre: '',
  relacionHermanos: '', antecedentesMedicosPsiquiatricosFamilia: '',
  pesadillasPresente: false, pesadillasDetalle: '',
  terrorNocturnoPresente: false, terrorNocturnoDetalle: '',
  sonambulismoPresente: false, sonambulismoDetalle: '',
  enuresisPresente: false, enuresisDetalle: '',
  onicofagiaPresente: false, onicofagiaDetalle: '',
  obsesionesCompulsionesPresente: false, obsesionesCompulsionesDetalle: '',
  fobiasPresente: false, fobiasDetalle: '',
  inquietudPresente: false, inquietudDetalle: '',
  miedoEstarSoloPresente: false, miedoEstarSoloDetalle: '',
  infecciones: '', cefalea: '', convulsiones: '',
  enfermedadesRespiratorias: '', intervencionesQuirurgicas: '',
  socializacion: '', conductaUniversidadTrabajo: '', ocupacionActualDetalles: '',
  circunstanciaEmbarazo: '', planificadoReaccionPadres: '', tipoParto: '',
  recienNacido: '', lactancia: '', desarrolloMotor: '', controlEsfinteres: '',
  informacionSexualAdquirida: '', enfermedadesVenereas: '',
  periodoMenstrual: '', sintomasMenstruacion: '',
  opinionNoviazgoMatrimonio: '', experienciasNoviazgoMatrimonio: '',
  alcoholPresente: false, alcohol: '',
  tabacoPresente: false, tabaco: '',
  drogasPresente: false, acusadoDetenidoPreso: '',
  acusadoDetenidoPresente: false,
  seguridadSiMismo: '', tomaDecisiones: '', miedoAbandono: '',
  confianzaOtros: '', actosImpulsivos: '', preocupacionRechazoCritica: '',
  preocupacionFracaso: '', gustoSerAtractivo: '',
  objetivosTerapeuticos: '',
  observacionesRecomendaciones: '',
};

const EntrevistaAdultos = ({ pacienteId, usuarioId, user }) => {
  const puedeEditar = user?.rol?.id === ROLES.ADMINISTRADOR || user?.rol?.id === ROLES.TERAPEUTA;

  const getFechaLocal = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({ ...FORM_INICIAL, fecha: getFechaLocal() });
  const [entrevistas, setEntrevistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [precargando, setPrecargando] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [expandedEntrevistas, setExpandedEntrevistas] = useState({});
  const [entrevistaEditando, setEntrevistaEditando] = useState(null);
  const [trabajadores, setTrabajadores] = useState([]);

  useEffect(() => { cargarDatos(); }, [pacienteId]);

  // TODO: descomentar cuando tengas el endpoint
  // useEffect(() => {
  //   obtenerTrabajadores().then(setTrabajadores);
  // }, []);

  const cargarDatos = async () => {
    if (!pacienteId) return;
    try {
      setLoading(true);
      const data = await obtenerEntrevistasAdultosPorPaciente(pacienteId);
      // Transformar drogasPresente de string a boolean para la UI
      const entrevistasTransformadas = Array.isArray(data)
        ? data.map(ent => ({
            ...ent,
            drogasPresente: ent.drogasPresente === '1' || ent.drogasPresente === 1
          }))
        : [];
      setEntrevistas(entrevistasTransformadas);
    } catch {
      setEntrevistas([]);
    } finally {
      setLoading(false);
    }
  };

  const precargarDatosPaciente = async () => {
    if (!pacienteId) return;
    try {
      setPrecargando(true);
      const { paciente } = await getPacienteById(pacienteId);

      // Calcular edad
      let edadCalculada = '';
      if (paciente.fecha_nacimiento) {
        const hoy = new Date();
        const fnac = new Date(paciente.fecha_nacimiento);
        let anios = hoy.getFullYear() - fnac.getFullYear();
        if (
          hoy.getMonth() < fnac.getMonth() ||
          (hoy.getMonth() === fnac.getMonth() && hoy.getDate() < fnac.getDate())
        ) {
          anios--;
        }
        edadCalculada = `${anios}`;
      }

      // Formatear fecha de nacimiento para el input tipo date (YYYY-MM-DD)
      let fechaNacimientoFormateada = '';
      if (paciente.fecha_nacimiento) {
        const fecha = new Date(paciente.fecha_nacimiento);
        fechaNacimientoFormateada = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
      }

      // Obtener teléfono: primero del paciente, si no del responsable
      let telefonoCompleto = '';
      if (paciente.celular || paciente.celular2) {
        telefonoCompleto = paciente.celular || paciente.celular2;
      } else if (paciente.responsable_telefono) {
        const relacion = paciente.responsable_relacion?.nombre || 'Responsable';
        telefonoCompleto = `${paciente.responsable_telefono} (${relacion})`;
      }

      setFormData(prev => ({
        ...prev,
        nombre: `${paciente.nombres || ''} ${paciente.apellido_paterno || ''} ${paciente.apellido_materno || ''}`.trim(),
        edad: edadCalculada,
        genero: paciente.sexo?.nombre || '',
        fechaNacimiento: fechaNacimientoFormateada,
        telefono: telefonoCompleto,
        remitidoPorNombre: user ? `${user.nombres || ''} ${user.apellidos || ''}`.trim() : '',
        remitidoPorId: user?.id ? String(user.id) : '',
      }));
    } catch (error) {
      console.error('Error al precargar datos del paciente:', error);
    } finally {
      setPrecargando(false);
    }
  };

  const showMsg = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ ...FORM_INICIAL, fecha: getFechaLocal() });
    setEntrevistaEditando(null);
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      // Eliminar campos que no existen en la BD o son solo para UI
      const { remitidoPorNombre, acusadoDetenidoPresente, ...dataToSend } = formData;

      const payload = {
        ...dataToSend,
        // Convertir drogasPresente boolean a string "1" o null para la BD
        drogasPresente: formData.drogasPresente ? '1' : null,
        pacienteId: parseInt(pacienteId),
        usuarioId: parseInt(usuarioId),
        userIdActua: parseInt(usuarioId),
        remitidoPorId: formData.remitidoPorId ? parseInt(formData.remitidoPorId) : null,
      };

      if (entrevistaEditando) {
        await actualizarEntrevistaAdultos(entrevistaEditando, payload);
        showMsg('Entrevista actualizada exitosamente');
      } else {
        await crearEntrevistaAdultos(payload);
        showMsg('Entrevista guardada exitosamente');
      }

      setMostrarFormulario(false);
      resetForm();
      cargarDatos();
    } catch (error) {
      showMsg(error.response?.data?.message || 'Error al guardar la entrevista', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const toggleExpandedEntrevista = (id) => {
    setExpandedEntrevistas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    const [year, month, day] = fechaString.split('T')[0].split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      .toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const inputClass = "w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all";
  const textareaClass = "w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all resize-none";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-2 uppercase";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 text-xs font-medium">Cargando entrevistas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Snackbar */}
      {showSnackbar && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 bg-white ${
          snackbarSeverity === 'success' ? 'border-gray-100' : 'border-red-100'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${snackbarSeverity === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`} />
          <span className="text-xs font-medium text-gray-700">{snackbarMessage}</span>
          <button onClick={() => setShowSnackbar(false)} className="ml-2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* Botón nueva entrevista */}
      {puedeEditar && !mostrarFormulario && (
        <button
          onClick={async () => {
            await precargarDatosPaciente();
            setMostrarFormulario(true);
          }}
          disabled={precargando}
          className="w-full px-4 py-3 bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] text-white rounded-xl hover:from-[#6A1B9A] hover:to-[#5E1690] transition-all flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#7B1FA2]/20 disabled:opacity-70"
        >
          {precargando
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Cargando datos...</>
            : <><Plus className="w-5 h-5" />Nueva Entrevista Psicológica para Adultos</>
          }
        </button>
      )}

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Nueva Entrevista Psicológica para Adultos</h3>
            <button onClick={() => { setMostrarFormulario(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* I. DATOS GENERALES */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">I. DATOS GENERALES</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Fecha</label>
                <input type="date" value={formData.fecha} onChange={(e) => handleChange('fecha', e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Nombre completo</label>
                <input type="text" value={formData.nombre} readOnly className={`${inputClass} bg-gray-50 cursor-not-allowed`} />
              </div>
              <div>
                <label className={labelClass}>Edad</label>
                <input type="text" value={formData.edad} readOnly className={`${inputClass} bg-gray-50 cursor-not-allowed`} />
              </div>
              <div>
                <label className={labelClass}>Género</label>
                <input type="text" value={formData.genero} readOnly className={`${inputClass} bg-gray-50 cursor-not-allowed`} />
              </div>
            <div>
              <label className={labelClass}>Lugar de nacimiento</label>
              <input type="text" value={formData.lugarNacimiento} onChange={(e) => handleChange('lugarNacimiento', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fecha de nacimiento</label>
              <input type="date" value={formData.fechaNacimiento} readOnly className={`${inputClass} bg-gray-50 cursor-not-allowed`} />
            </div>
              <div>
                <label className={labelClass}>Domicilio actual</label>
                <input type="text" value={formData.domicilioActual} onChange={(e) => handleChange('domicilioActual', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input type="text" value={formData.telefono} readOnly className={`${inputClass} bg-gray-50 cursor-not-allowed`} />
              </div>
              <div>
                <label className={labelClass}>Estado Civil</label>
                <input type="text" value={formData.estadoCivil} onChange={(e) => handleChange('estadoCivil', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Religión</label>
                <input type="text" value={formData.religion} onChange={(e) => handleChange('religion', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Escolaridad</label>
                <input type="text" value={formData.escolaridad} onChange={(e) => handleChange('escolaridad', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ocupación</label>
                <input type="text" value={formData.ocupacion} onChange={(e) => handleChange('ocupacion', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>REMITIDO POR</label>
                <input
                  type="text"
                  value={formData.remitidoPorNombre}
                  readOnly
                  className={`${inputClass} bg-gray-50 cursor-not-allowed`}
                />
              </div>
            </div>
          </div>

          {/* II. MOTIVO DE CONSULTA */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">II. MOTIVO DE CONSULTA</h4>
            <textarea value={formData.motivoConsulta} onChange={(e) => handleChange('motivoConsulta', e.target.value)}
              rows={4} placeholder="Describa el motivo principal de la consulta..." className={textareaClass} />
          </div>

          {/* III. ANTECEDENTES */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">III. ANTECEDENTES DE LA SITUACIÓN</h4>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>¿Cuándo se sintió bien?, desarrollo de síntomas, antecedentes familiares</label>
                <textarea value={formData.antecedentesSituacion} onChange={(e) => handleChange('antecedentesSituacion', e.target.value)} rows={4} className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Funciones orgánicas: sueño, apetito, sed, defecación</label>
                <textarea value={formData.funcionesOrganicas} onChange={(e) => handleChange('funcionesOrganicas', e.target.value)} rows={3} className={textareaClass} />
              </div>
            </div>
          </div>

          {/* IV. HISTORIA FAMILIAR - PADRE */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">IV. HISTORIA FAMILIAR - PADRE</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Nombre del padre</label><input type="text" value={formData.nombrePadre} onChange={(e) => handleChange('nombrePadre', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Edad</label><input type="text" value={formData.edadPadre} onChange={(e) => handleChange('edadPadre', e.target.value)} className={inputClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Escolaridad y ocupación</label><input type="text" value={formData.escolaridadOcupacionPadre} onChange={(e) => handleChange('escolaridadOcupacionPadre', e.target.value)} className={inputClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Enfermedades que padece</label><textarea value={formData.enfermedadesPadre} onChange={(e) => handleChange('enfermedadesPadre', e.target.value)} rows={2} className={textareaClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Relación padre-paciente</label><textarea value={formData.relacionPadrePaciente} onChange={(e) => handleChange('relacionPadrePaciente', e.target.value)} rows={2} className={textareaClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Imposición de castigos</label><input type="text" value={formData.imposicionCastigosPadre} onChange={(e) => handleChange('imposicionCastigosPadre', e.target.value)} className={inputClass} /></div>
            </div>
          </div>

          {/* IV. HISTORIA FAMILIAR - MADRE */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">IV. HISTORIA FAMILIAR - MADRE</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Nombre de la madre</label><input type="text" value={formData.nombreMadre} onChange={(e) => handleChange('nombreMadre', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Edad</label><input type="text" value={formData.edadMadre} onChange={(e) => handleChange('edadMadre', e.target.value)} className={inputClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Escolaridad y ocupación</label><input type="text" value={formData.escolaridadOcupacionMadre} onChange={(e) => handleChange('escolaridadOcupacionMadre', e.target.value)} className={inputClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Enfermedades que padece</label><textarea value={formData.enfermedadesMadre} onChange={(e) => handleChange('enfermedadesMadre', e.target.value)} rows={2} className={textareaClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Relación madre-paciente</label><textarea value={formData.relacionMadrePaciente} onChange={(e) => handleChange('relacionMadrePaciente', e.target.value)} rows={2} className={textareaClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Imposición de castigos</label><input type="text" value={formData.imposicionCastigosMadre} onChange={(e) => handleChange('imposicionCastigosMadre', e.target.value)} className={inputClass} /></div>
            </div>
          </div>

          {/* IV. HISTORIA FAMILIAR - HERMANOS */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">IV. HISTORIA FAMILIAR - HERMANOS</h4>
            <div className="space-y-4">
              <div><label className={labelClass}>Relación con hermanos</label><textarea value={formData.relacionHermanos} onChange={(e) => handleChange('relacionHermanos', e.target.value)} rows={2} className={textareaClass} /></div>
              <div><label className={labelClass}>Antecedentes médicos y psiquiátricos en la familia</label><textarea value={formData.antecedentesMedicosPsiquiatricosFamilia} onChange={(e) => handleChange('antecedentesMedicosPsiquiatricosFamilia', e.target.value)} rows={3} className={textareaClass} /></div>
            </div>
          </div>

          {/* V. SÍNTOMAS NEURÓTICOS */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">V. SÍNTOMAS NEURÓTICOS</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SintomaToggle label="Pesadillas" campo="pesadillas" formData={formData} handleChange={handleChange} />
              <SintomaToggle label="Terror nocturno" campo="terrorNocturno" formData={formData} handleChange={handleChange} />
              <SintomaToggle label="Sonambulismo" campo="sonambulismo" formData={formData} handleChange={handleChange} />
              <SintomaToggle label="Enuresis" campo="enuresis" formData={formData} handleChange={handleChange} />
              <SintomaToggle label="Onicofagia (morderse las uñas)" campo="onicofagia" formData={formData} handleChange={handleChange} />
              <SintomaToggle label="Obsesiones-compulsiones" campo="obsesionesCompulsiones" formData={formData} handleChange={handleChange} />
              <SintomaToggle label="Fobias" campo="fobias" formData={formData} handleChange={handleChange} />
              <SintomaToggle label="Inquietud" campo="inquietud" formData={formData} handleChange={handleChange} />
              <SintomaToggle label="Miedo a estar solo" campo="miedoEstarSolo" formData={formData} handleChange={handleChange} />
            </div>
          </div>

          {/* VI. SALUD FÍSICA */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">VI. SALUD FÍSICA</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Infecciones</label><textarea value={formData.infecciones} onChange={(e) => handleChange('infecciones', e.target.value)} rows={2} className={textareaClass} /></div>
              <div><label className={labelClass}>Cefalea</label><textarea value={formData.cefalea} onChange={(e) => handleChange('cefalea', e.target.value)} rows={2} className={textareaClass} /></div>
              <div><label className={labelClass}>Convulsiones</label><textarea value={formData.convulsiones} onChange={(e) => handleChange('convulsiones', e.target.value)} rows={2} className={textareaClass} /></div>
              <div><label className={labelClass}>Enfermedades Respiratorias</label><textarea value={formData.enfermedadesRespiratorias} onChange={(e) => handleChange('enfermedadesRespiratorias', e.target.value)} rows={2} className={textareaClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Intervenciones Quirúrgicas</label><textarea value={formData.intervencionesQuirurgicas} onChange={(e) => handleChange('intervencionesQuirurgicas', e.target.value)} rows={2} className={textareaClass} /></div>
            </div>
          </div>

          {/* VII. SOCIALIZACIÓN */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">VII. SOCIALIZACIÓN</h4>
            <div className="space-y-4">
              <div><label className={labelClass}>Socialización (amigos, relaciones)</label><textarea value={formData.socializacion} onChange={(e) => handleChange('socializacion', e.target.value)} rows={3} className={textareaClass} /></div>
              <div><label className={labelClass}>Conducta en la universidad/trabajo</label><textarea value={formData.conductaUniversidadTrabajo} onChange={(e) => handleChange('conductaUniversidadTrabajo', e.target.value)} rows={3} className={textareaClass} /></div>
              <div><label className={labelClass}>Ocupación actual (detalles)</label><textarea value={formData.ocupacionActualDetalles} onChange={(e) => handleChange('ocupacionActualDetalles', e.target.value)} rows={2} className={textareaClass} /></div>
            </div>
          </div>

          {/* VIII. ANTECEDENTES PERSONALES */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">VIII. ANTECEDENTES PERSONALES</h4>
            <div className="space-y-4">
              <div><label className={labelClass}>Circunstancia del embarazo</label><textarea value={formData.circunstanciaEmbarazo} onChange={(e) => handleChange('circunstanciaEmbarazo', e.target.value)} rows={2} className={textareaClass} /></div>
              <div><label className={labelClass}>¿Fue planificado? Reacción de los padres</label><textarea value={formData.planificadoReaccionPadres} onChange={(e) => handleChange('planificadoReaccionPadres', e.target.value)} rows={2} className={textareaClass} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Tipo de parto</label><input type="text" value={formData.tipoParto} onChange={(e) => handleChange('tipoParto', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Recién nacido (condición)</label><input type="text" value={formData.recienNacido} onChange={(e) => handleChange('recienNacido', e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Lactancia</label><input type="text" value={formData.lactancia} onChange={(e) => handleChange('lactancia', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Desarrollo motor</label><textarea value={formData.desarrolloMotor} onChange={(e) => handleChange('desarrolloMotor', e.target.value)} rows={2} className={textareaClass} /></div>
              <div><label className={labelClass}>Control de esfínteres</label><input type="text" value={formData.controlEsfinteres} onChange={(e) => handleChange('controlEsfinteres', e.target.value)} className={inputClass} /></div>
            </div>
          </div>

          {/* IX. HISTORIAL SEXUAL */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">IX. HISTORIAL SEXUAL</h4>
            <div className="space-y-4">
              <div><label className={labelClass}>¿Cómo se adquirió la información sexual?</label><textarea value={formData.informacionSexualAdquirida} onChange={(e) => handleChange('informacionSexualAdquirida', e.target.value)} rows={2} className={textareaClass} /></div>
              <div><label className={labelClass}>Enfermedades venéreas</label><input type="text" value={formData.enfermedadesVenereas} onChange={(e) => handleChange('enfermedadesVenereas', e.target.value)} className={inputClass} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Periodo menstrual</label><input type="text" value={formData.periodoMenstrual} onChange={(e) => handleChange('periodoMenstrual', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Síntomas durante menstruación</label><input type="text" value={formData.sintomasMenstruacion} onChange={(e) => handleChange('sintomasMenstruacion', e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Opinión sobre noviazgo y matrimonio</label><textarea value={formData.opinionNoviazgoMatrimonio} onChange={(e) => handleChange('opinionNoviazgoMatrimonio', e.target.value)} rows={2} className={textareaClass} /></div>
              <div><label className={labelClass}>Experiencias de noviazgo y matrimonio</label><textarea value={formData.experienciasNoviazgoMatrimonio} onChange={(e) => handleChange('experienciasNoviazgoMatrimonio', e.target.value)} rows={2} className={textareaClass} /></div>
            </div>
          </div>

          {/* X. HÁBITOS Y ASPECTOS JUDICIALES */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">X. HÁBITOS Y ASPECTOS JUDICIALES</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <HabitoToggle label="Alcohol" campo="alcohol" formData={formData} handleChange={handleChange} />
              <HabitoToggle label="Tabaco" campo="tabaco" formData={formData} handleChange={handleChange} />
              <HabitoToggle label="Drogas" campo="drogas" formData={formData} handleChange={handleChange} multiline />
              <HabitoToggle label="¿Acusado, detenido o preso?" campo="acusadoDetenido" formData={formData} handleChange={handleChange} multiline />
            </div>
          </div>

          {/* XI. PERSONALIDAD PREVIA */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">XI. PERSONALIDAD PREVIA</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Seguridad en sí mismo</label><input type="text" value={formData.seguridadSiMismo} onChange={(e) => handleChange('seguridadSiMismo', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Toma de decisiones</label><input type="text" value={formData.tomaDecisiones} onChange={(e) => handleChange('tomaDecisiones', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Miedo al abandono</label><input type="text" value={formData.miedoAbandono} onChange={(e) => handleChange('miedoAbandono', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Confianza en otros</label><input type="text" value={formData.confianzaOtros} onChange={(e) => handleChange('confianzaOtros', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Actos impulsivos</label><input type="text" value={formData.actosImpulsivos} onChange={(e) => handleChange('actosImpulsivos', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Preocupación por rechazo/crítica</label><input type="text" value={formData.preocupacionRechazoCritica} onChange={(e) => handleChange('preocupacionRechazoCritica', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Preocupación por fracaso</label><input type="text" value={formData.preocupacionFracaso} onChange={(e) => handleChange('preocupacionFracaso', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Gusto por ser atractivo</label><input type="text" value={formData.gustoSerAtractivo} onChange={(e) => handleChange('gustoSerAtractivo', e.target.value)} className={inputClass} /></div>
            </div>
          </div>

          {/* XII. OBJETIVOS TERAPÉUTICOS */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">XII. OBJETIVOS TERAPÉUTICOS INICIALES</h4>
            <textarea value={formData.objetivosTerapeuticos} onChange={(e) => handleChange('objetivosTerapeuticos', e.target.value)}
              rows={4} placeholder="Defina los objetivos terapéuticos iniciales..." className={textareaClass} />
          </div>

          {/* XIII. OBSERVACIONES */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">XIII. OBSERVACIONES Y RECOMENDACIONES</h4>
            <textarea value={formData.observacionesRecomendaciones} onChange={(e) => handleChange('observacionesRecomendaciones', e.target.value)}
              rows={5} placeholder="Observaciones generales y recomendaciones..." className={textareaClass} />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setMostrarFormulario(false); resetForm(); }}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
              Cancelar
            </button>
            <button onClick={handleGuardar} disabled={guardando}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] rounded-xl hover:from-[#6A1B9A] hover:to-[#5E1690] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7B1FA2]/30 flex items-center gap-2">
              {guardando
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando...</>
                : <><Save className="w-4 h-4" />Guardar Entrevista</>}
            </button>
          </div>
        </div>
      )}

      {/* Listado de entrevistas */}
      <div className="space-y-3">
        {entrevistas.length === 0 && !mostrarFormulario && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No hay entrevistas registradas</p>
          </div>
        )}

        {entrevistas.map((entrevista) => (
          <div key={entrevista.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <button onClick={() => toggleExpandedEntrevista(entrevista.id)} className="flex items-center gap-4 flex-1 text-left">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{formatearFecha(entrevista.fecha)} — Entrevista Psicológica</h4>
                  <p className="text-xs text-gray-500">Entrevista para adultos</p>
                </div>
              </button>
              <button onClick={() => toggleExpandedEntrevista(entrevista.id)} className="p-2">
                {expandedEntrevistas[entrevista.id] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
            </div>

            {expandedEntrevistas[entrevista.id] && (
              <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">

                {/* I. DATOS GENERALES */}
                <div>
                  <h5 className="text-sm font-bold text-gray-900 mb-3">I. DATOS GENERALES</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="col-span-2"><span className="font-semibold text-gray-700">Nombre:</span><p className="text-gray-600">{entrevista.nombre || 'No especificado'}</p></div>
                    <div><span className="font-semibold text-gray-700">Edad:</span><p className="text-gray-600">{entrevista.edad || 'No especificado'}</p></div>
                    <div><span className="font-semibold text-gray-700">Género:</span><p className="text-gray-600">{entrevista.genero || 'No especificado'}</p></div>
                    <div><span className="font-semibold text-gray-700">Lugar de nacimiento:</span><p className="text-gray-600">{entrevista.lugarNacimiento || 'No especificado'}</p></div>
                    <div><span className="font-semibold text-gray-700">Fecha de nacimiento:</span><p className="text-gray-600">{entrevista.fechaNacimiento ? formatearFecha(entrevista.fechaNacimiento) : 'No especificado'}</p></div>                    <div><span className="font-semibold text-gray-700">Domicilio:</span><p className="text-gray-600">{entrevista.domicilioActual || 'No especificado'}</p></div>
                    <div><span className="font-semibold text-gray-700">Teléfono:</span><p className="text-gray-600">{entrevista.telefono || 'No especificado'}</p></div>
                    <div><span className="font-semibold text-gray-700">Estado Civil:</span><p className="text-gray-600">{entrevista.estadoCivil || 'No especificado'}</p></div>
                    <div><span className="font-semibold text-gray-700">Religión:</span><p className="text-gray-600">{entrevista.religion || 'No especificado'}</p></div>
                    <div><span className="font-semibold text-gray-700">Escolaridad:</span><p className="text-gray-600">{entrevista.escolaridad || 'No especificado'}</p></div>
                    <div><span className="font-semibold text-gray-700">Ocupación:</span><p className="text-gray-600">{entrevista.ocupacion || 'No especificado'}</p></div>
                    <div className="col-span-2">
                      <span className="font-semibold text-gray-700">REMITIDO POR:</span>
                      <p className="text-gray-600">
                        {entrevista.remitidoPor
                          ? `${entrevista.remitidoPor.nombres || ''} ${entrevista.remitidoPor.apellidos || ''}`.trim()
                          : 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* II. MOTIVO DE CONSULTA */}
                {entrevista.motivoConsulta && (
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 mb-2">II. MOTIVO DE CONSULTA</h5>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{entrevista.motivoConsulta}</p>
                  </div>
                )}

                {/* III. ANTECEDENTES */}
                {(entrevista.antecedentesSituacion || entrevista.funcionesOrganicas) && (
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 mb-3">III. ANTECEDENTES DE LA SITUACIÓN</h5>
                    {entrevista.antecedentesSituacion && <div className="mb-3"><span className="font-semibold text-gray-700 text-sm">Antecedentes:</span><p className="text-sm text-gray-600 whitespace-pre-wrap">{entrevista.antecedentesSituacion}</p></div>}
                    {entrevista.funcionesOrganicas && <div><span className="font-semibold text-gray-700 text-sm">Funciones Orgánicas:</span><p className="text-sm text-gray-600 whitespace-pre-wrap">{entrevista.funcionesOrganicas}</p></div>}
                  </div>
                )}

                {/* IV. HISTORIA FAMILIAR */}
                {(entrevista.nombrePadre || entrevista.nombreMadre || entrevista.relacionHermanos) && (
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 mb-3">IV. HISTORIA FAMILIAR</h5>
                    {entrevista.nombrePadre && (
                      <div className="mb-4">
                        <h6 className="text-xs font-bold text-gray-800 mb-2">PADRE</h6>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><span className="font-semibold text-gray-700">Nombre:</span><p className="text-gray-600">{entrevista.nombrePadre}</p></div>
                          <div><span className="font-semibold text-gray-700">Edad:</span><p className="text-gray-600">{entrevista.edadPadre || 'No especificado'}</p></div>
                          {entrevista.escolaridadOcupacionPadre && <div className="col-span-2"><span className="font-semibold text-gray-700">Escolaridad/Ocupación:</span><p className="text-gray-600">{entrevista.escolaridadOcupacionPadre}</p></div>}
                          {entrevista.enfermedadesPadre && <div className="col-span-2"><span className="font-semibold text-gray-700">Enfermedades:</span><p className="text-gray-600">{entrevista.enfermedadesPadre}</p></div>}
                          {entrevista.relacionPadrePaciente && <div className="col-span-2"><span className="font-semibold text-gray-700">Relación:</span><p className="text-gray-600">{entrevista.relacionPadrePaciente}</p></div>}
                        </div>
                      </div>
                    )}
                    {entrevista.nombreMadre && (
                      <div className="mb-4">
                        <h6 className="text-xs font-bold text-gray-800 mb-2">MADRE</h6>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><span className="font-semibold text-gray-700">Nombre:</span><p className="text-gray-600">{entrevista.nombreMadre}</p></div>
                          <div><span className="font-semibold text-gray-700">Edad:</span><p className="text-gray-600">{entrevista.edadMadre || 'No especificado'}</p></div>
                          {entrevista.escolaridadOcupacionMadre && <div className="col-span-2"><span className="font-semibold text-gray-700">Escolaridad/Ocupación:</span><p className="text-gray-600">{entrevista.escolaridadOcupacionMadre}</p></div>}
                          {entrevista.enfermedadesMadre && <div className="col-span-2"><span className="font-semibold text-gray-700">Enfermedades:</span><p className="text-gray-600">{entrevista.enfermedadesMadre}</p></div>}
                          {entrevista.relacionMadrePaciente && <div className="col-span-2"><span className="font-semibold text-gray-700">Relación:</span><p className="text-gray-600">{entrevista.relacionMadrePaciente}</p></div>}
                        </div>
                      </div>
                    )}
                    {entrevista.relacionHermanos && <div className="mb-3"><h6 className="text-xs font-bold text-gray-800 mb-2">HERMANOS</h6><p className="text-sm text-gray-600">{entrevista.relacionHermanos}</p></div>}
                    {entrevista.antecedentesMedicosPsiquiatricosFamilia && <div><span className="font-semibold text-gray-700 text-sm">Antecedentes Médicos/Psiquiátricos:</span><p className="text-sm text-gray-600 whitespace-pre-wrap">{entrevista.antecedentesMedicosPsiquiatricosFamilia}</p></div>}
                  </div>
                )}

                {/* V. SÍNTOMAS NEURÓTICOS */}
                {['pesadillas', 'terrorNocturno', 'sonambulismo', 'enuresis', 'onicofagia',
                  'obsesionesCompulsiones', 'fobias', 'inquietud', 'miedoEstarSolo'].some(c => entrevista[`${c}Presente`]) && (
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 mb-3">V. SÍNTOMAS NEURÓTICOS</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { campo: 'pesadillas', label: 'Pesadillas' },
                        { campo: 'terrorNocturno', label: 'Terror nocturno' },
                        { campo: 'sonambulismo', label: 'Sonambulismo' },
                        { campo: 'enuresis', label: 'Enuresis' },
                        { campo: 'onicofagia', label: 'Onicofagia' },
                        { campo: 'obsesionesCompulsiones', label: 'Obsesiones/Compulsiones' },
                        { campo: 'fobias', label: 'Fobias' },
                        { campo: 'inquietud', label: 'Inquietud' },
                        { campo: 'miedoEstarSolo', label: 'Miedo a estar solo' },
                      ].filter(s => entrevista[`${s.campo}Presente`]).map(s => (
                        <div key={s.campo} className="bg-white border border-purple-100 rounded-lg p-3 text-sm">
                          <span className="font-semibold text-[#7B1FA2]">{s.label}:</span>
                          <p className="text-gray-600 mt-1">{entrevista[`${s.campo}Detalle`] || 'Presente'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VI. SALUD FÍSICA */}
                {(entrevista.infecciones || entrevista.cefalea || entrevista.convulsiones || entrevista.enfermedadesRespiratorias || entrevista.intervencionesQuirurgicas) && (
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 mb-3">VI. SALUD FÍSICA</h5>
                    <div className="space-y-2 text-sm">
                      {entrevista.infecciones && <div><span className="font-semibold text-gray-700">Infecciones:</span><p className="text-gray-600">{entrevista.infecciones}</p></div>}
                      {entrevista.cefalea && <div><span className="font-semibold text-gray-700">Cefalea:</span><p className="text-gray-600">{entrevista.cefalea}</p></div>}
                      {entrevista.convulsiones && <div><span className="font-semibold text-gray-700">Convulsiones:</span><p className="text-gray-600">{entrevista.convulsiones}</p></div>}
                      {entrevista.enfermedadesRespiratorias && <div><span className="font-semibold text-gray-700">Enfermedades Respiratorias:</span><p className="text-gray-600">{entrevista.enfermedadesRespiratorias}</p></div>}
                      {entrevista.intervencionesQuirurgicas && <div><span className="font-semibold text-gray-700">Intervenciones Quirúrgicas:</span><p className="text-gray-600">{entrevista.intervencionesQuirurgicas}</p></div>}
                    </div>
                  </div>
                )}

                {/* VII. SOCIALIZACIÓN */}
                {(entrevista.socializacion || entrevista.conductaUniversidadTrabajo || entrevista.ocupacionActualDetalles) && (
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 mb-3">VII. SOCIALIZACIÓN</h5>
                    <div className="space-y-2 text-sm">
                      {entrevista.socializacion && <div><span className="font-semibold text-gray-700">Socialización:</span><p className="text-gray-600 whitespace-pre-wrap">{entrevista.socializacion}</p></div>}
                      {entrevista.conductaUniversidadTrabajo && <div><span className="font-semibold text-gray-700">Conducta Universidad/Trabajo:</span><p className="text-gray-600 whitespace-pre-wrap">{entrevista.conductaUniversidadTrabajo}</p></div>}
                      {entrevista.ocupacionActualDetalles && <div><span className="font-semibold text-gray-700">Ocupación Actual:</span><p className="text-gray-600 whitespace-pre-wrap">{entrevista.ocupacionActualDetalles}</p></div>}
                    </div>
                  </div>
                )}

                {/* VIII. ANTECEDENTES PERSONALES */}
                {(entrevista.circunstanciaEmbarazo || entrevista.planificadoReaccionPadres || entrevista.tipoParto || entrevista.recienNacido || entrevista.lactancia || entrevista.desarrolloMotor || entrevista.controlEsfinteres) && (
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 mb-3">VIII. ANTECEDENTES PERSONALES</h5>
                    <div className="space-y-2 text-sm">
                      {entrevista.circunstanciaEmbarazo && <div><span className="font-semibold text-gray-700">Circunstancia del embarazo:</span><p className="text-gray-600 whitespace-pre-wrap">{entrevista.circunstanciaEmbarazo}</p></div>}
                      {entrevista.planificadoReaccionPadres && <div><span className="font-semibold text-gray-700">¿Planificado?:</span><p className="text-gray-600 whitespace-pre-wrap">{entrevista.planificadoReaccionPadres}</p></div>}
                      {entrevista.tipoParto && <div><span className="font-semibold text-gray-700">Tipo de parto:</span><p className="text-gray-600">{entrevista.tipoParto}</p></div>}
                      {entrevista.recienNacido && <div><span className="font-semibold text-gray-700">Recién nacido:</span><p className="text-gray-600">{entrevista.recienNacido}</p></div>}
                      {entrevista.lactancia && <div><span className="font-semibold text-gray-700">Lactancia:</span><p className="text-gray-600">{entrevista.lactancia}</p></div>}
                      {entrevista.desarrolloMotor && <div><span className="font-semibold text-gray-700">Desarrollo motor:</span><p className="text-gray-600 whitespace-pre-wrap">{entrevista.desarrolloMotor}</p></div>}
                      {entrevista.controlEsfinteres && <div><span className="font-semibold text-gray-700">Control de esfínteres:</span><p className="text-gray-600">{entrevista.controlEsfinteres}</p></div>}
                    </div>
                  </div>
                )}

                {/* IX. HISTORIAL SEXUAL */}
                {(entrevista.informacionSexualAdquirida || entrevista.enfermedadesVenereas || entrevista.periodoMenstrual || entrevista.sintomasMenstruacion || entrevista.opinionNoviazgoMatrimonio || entrevista.experienciasNoviazgoMatrimonio) && (
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 mb-3">IX. HISTORIAL SEXUAL</h5>
                    <div className="space-y-2 text-sm">
                      {entrevista.informacionSexualAdquirida && <div><span className="font-semibold text-gray-700">Información sexual adquirida:</span><p className="text-gray-600 whitespace-pre-wrap">{entrevista.informacionSexualAdquirida}</p></div>}
                      {entrevista.enfermedadesVenereas && <div><span className="font-semibold text-gray-700">Enfermedades venéreas:</span><p className="text-gray-600">{entrevista.enfermedadesVenereas}</p></div>}
                      {entrevista.periodoMenstrual && <div><span className="font-semibold text-gray-700">Periodo menstrual:</span><p className="text-gray-600">{entrevista.periodoMenstrual}</p></div>}
                      {entrevista.sintomasMenstruacion && <div><span className="font-semibold text-gray-700">Síntomas menstruación:</span><p className="text-gray-600">{entrevista.sintomasMenstruacion}</p></div>}
                      {entrevista.opinionNoviazgoMatrimonio && <div><span className="font-semibold text-gray-700">Opinión noviazgo/matrimonio:</span><p className="text-gray-600 whitespace-pre-wrap">{entrevista.opinionNoviazgoMatrimonio}</p></div>}
                      {entrevista.experienciasNoviazgoMatrimonio && <div><span className="font-semibold text-gray-700">Experiencias:</span><p className="text-gray-600 whitespace-pre-wrap">{entrevista.experienciasNoviazgoMatrimonio}</p></div>}
                    </div>
                  </div>
                )}

                {/* X. HÁBITOS Y ASPECTOS JUDICIALES */}
                {(entrevista.alcoholPresente || entrevista.tabacoPresente || entrevista.drogasPresente || entrevista.acusadoDetenidoPreso) && (
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 mb-3">X. HÁBITOS Y ASPECTOS JUDICIALES</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { campo: 'alcohol', label: 'Alcohol', descripCampo: 'alcohol', checkPresente: true },
                        { campo: 'tabaco', label: 'Tabaco', descripCampo: 'tabaco', checkPresente: true },
                        { campo: 'drogas', label: 'Drogas', descripCampo: 'drogas', checkPresente: true },
                        { campo: 'acusadoDetenido', label: 'Acusado/Detenido/Preso', descripCampo: 'acusadoDetenidoPreso', checkPresente: false },
                      ].filter(h => {
                        if (h.checkPresente) {
                          return entrevista[`${h.campo}Presente`];
                        } else {
                          return entrevista[h.descripCampo];
                        }
                      }).map(h => (
                        <div key={h.campo} className="bg-white border border-purple-100 rounded-lg p-3 text-sm">
                          <span className="font-semibold text-[#7B1FA2]">{h.label}:</span>
                          <p className="text-gray-600 mt-1">{entrevista[h.descripCampo] || 'Presente'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* XI. PERSONALIDAD PREVIA */}
                {(entrevista.seguridadSiMismo || entrevista.tomaDecisiones || entrevista.miedoAbandono || entrevista.confianzaOtros || entrevista.actosImpulsivos || entrevista.preocupacionRechazoCritica || entrevista.preocupacionFracaso || entrevista.gustoSerAtractivo) && (
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 mb-3">XI. PERSONALIDAD PREVIA</h5>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {entrevista.seguridadSiMismo && <div><span className="font-semibold text-gray-700">Seguridad en sí mismo:</span><p className="text-gray-600">{entrevista.seguridadSiMismo}</p></div>}
                      {entrevista.tomaDecisiones && <div><span className="font-semibold text-gray-700">Toma de decisiones:</span><p className="text-gray-600">{entrevista.tomaDecisiones}</p></div>}
                      {entrevista.miedoAbandono && <div><span className="font-semibold text-gray-700">Miedo al abandono:</span><p className="text-gray-600">{entrevista.miedoAbandono}</p></div>}
                      {entrevista.confianzaOtros && <div><span className="font-semibold text-gray-700">Confianza en otros:</span><p className="text-gray-600">{entrevista.confianzaOtros}</p></div>}
                      {entrevista.actosImpulsivos && <div><span className="font-semibold text-gray-700">Actos impulsivos:</span><p className="text-gray-600">{entrevista.actosImpulsivos}</p></div>}
                      {entrevista.preocupacionRechazoCritica && <div><span className="font-semibold text-gray-700">Preocupación rechazo/crítica:</span><p className="text-gray-600">{entrevista.preocupacionRechazoCritica}</p></div>}
                      {entrevista.preocupacionFracaso && <div><span className="font-semibold text-gray-700">Preocupación fracaso:</span><p className="text-gray-600">{entrevista.preocupacionFracaso}</p></div>}
                      {entrevista.gustoSerAtractivo && <div><span className="font-semibold text-gray-700">Gusto por ser atractivo:</span><p className="text-gray-600">{entrevista.gustoSerAtractivo}</p></div>}
                    </div>
                  </div>
                )}

                {/* XII. OBJETIVOS TERAPÉUTICOS */}
                {entrevista.objetivosTerapeuticos && (
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 mb-2">XII. OBJETIVOS TERAPÉUTICOS INICIALES</h5>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{entrevista.objetivosTerapeuticos}</p>
                  </div>
                )}

                {/* XIII. OBSERVACIONES */}
                {entrevista.observacionesRecomendaciones && (
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 mb-2">XIII. OBSERVACIONES Y RECOMENDACIONES</h5>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{entrevista.observacionesRecomendaciones}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EntrevistaAdultos;