import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, Send, Lock } from 'lucide-react';
import { getFichaPublica, enviarFichaPublica } from '../services/fichaSeguimientoPsicologiaService';
import { valoresVacios } from '../constants/fichaSeguimientoPsicologia';
import FichaPsicologiaFormBody from '../components/FichaSeguimiento/FichaPsicologiaFormBody';

// Pantalla contenedora (centrada, con branding) para estados especiales
const Pantalla = ({ icon: Icon, color, titulo, mensaje }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full p-8 text-center">
      <div className={`w-16 h-16 rounded-2xl ${color} mx-auto flex items-center justify-center mb-5`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">{titulo}</h1>
      <p className="text-sm text-gray-500 leading-relaxed">{mensaje}</p>
    </div>
  </div>
);

const FichaSeguimientoPsicologia = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [ficha, setFicha] = useState(null);
  const [error, setError] = useState(null);
  const [valores, setValores] = useState(valoresVacios());
  const [cabecera, setCabecera] = useState({
    docente_nombre: '',
    nivel_grado: '',
    institucion_educativa: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [yaCompletada, setYaCompletada] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await getFichaPublica(token);
        setFicha(data);
        if (data.estado === 'COMPLETADA') setYaCompletada(true);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? 'El enlace no es válido o la ficha no existe.'
            : 'No se pudo cargar la ficha. Intente nuevamente más tarde.'
        );
      } finally {
        setLoading(false);
      }
    };
    if (token) cargar();
  }, [token]);

  const handleEnviar = async () => {
    if (!cabecera.docente_nombre.trim()) {
      setError('Por favor ingrese el nombre del/de la docente.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await enviarFichaPublica(token, {
        docente_nombre: cabecera.docente_nombre.trim(),
        nivel_grado: cabecera.nivel_grado.trim(),
        institucion_educativa: cabecera.institucion_educativa.trim(),
        ...valores, // cada clave es una columna de la tabla
      });
      setEnviado(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err.response?.status === 409) {
        setYaCompletada(true);
      } else {
        setError('Ocurrió un error al enviar la ficha. Intente nuevamente.');
      }
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#7B1FA2] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Cargando ficha…</p>
        </div>
      </div>
    );
  }

  if (error && !ficha) {
    return <Pantalla icon={AlertCircle} color="bg-red-500" titulo="Enlace no disponible" mensaje={error} />;
  }

  if (enviado) {
    return (
      <Pantalla
        icon={CheckCircle2}
        color="bg-[#A3C644]"
        titulo="¡Ficha enviada correctamente!"
        mensaje="Gracias por completar el cuestionario de seguimiento. Su respuesta fue registrada y este enlace ya no podrá volver a utilizarse."
      />
    );
  }

  if (yaCompletada) {
    return (
      <Pantalla
        icon={Lock}
        color="bg-gray-400"
        titulo="Esta ficha ya fue completada"
        mensaje="El enlace ya fue utilizado y no puede volver a llenarse. Si necesita realizar cambios, comuníquese con el centro."
      />
    );
  }

  const Dato = ({ label, value }) => (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-white/60">{label}</span>
      <span className="text-[13px] font-semibold text-white leading-tight">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100/70">
      {/* Barra superior de marca */}
      <div className="h-1.5 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#A3C644]" />

      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
        {/* Encabezado compacto con logo */}
        <div className="bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] rounded-2xl px-4 py-3.5 sm:px-5 text-white mb-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white rounded-xl px-3 py-2 flex-shrink-0 shadow-sm">
              <img src="/logo-text-short.png" alt="Crecemos" className="h-11 sm:h-12 w-auto object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="!text-white text-sm sm:text-base font-bold leading-tight">Ficha de Seguimiento Escolar</h1>
              <p className="text-white/70 text-[11px] sm:text-xs">Psicología · Cuestionario para Maestros</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 pt-3 border-t border-white/15">
            <Dato label="Estudiante" value={ficha?.estudiante || '—'} />
            <Dato label="Edad" value={ficha?.edad != null ? `${ficha.edad} años` : '—'} />
            {ficha?.periodo_observacion && <Dato label="Periodo" value={ficha.periodo_observacion} />}
          </div>
        </div>

        {/* Indicaciones */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5 flex gap-3">
          <div className="w-1 rounded-full bg-[#A3C644] flex-shrink-0" />
          <p className="text-sm text-gray-600 leading-relaxed">
            Por favor responda a todos los reactivos. Indique el grado del problema según la escala
            (Nunca = 0, Sólo un poco = 1, Bastante = 2, Mucho = 3), marcando la opción que corresponda
            al comportamiento observado en el niño o la niña dentro del contexto escolar.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Datos de la docente */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 mb-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7B1FA2]" />
            Datos de la docente
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre de los maestros <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={cabecera.docente_nombre}
                onChange={(e) => setCabecera((p) => ({ ...p, docente_nombre: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/25 focus:border-[#7B1FA2]/40 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nivel y grado escolar</label>
              <input
                type="text"
                value={cabecera.nivel_grado}
                onChange={(e) => setCabecera((p) => ({ ...p, nivel_grado: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/25 focus:border-[#7B1FA2]/40 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre de la escuela</label>
              <input
                type="text"
                value={cabecera.institucion_educativa}
                onChange={(e) => setCabecera((p) => ({ ...p, institucion_educativa: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7B1FA2]/25 focus:border-[#7B1FA2]/40 transition"
              />
            </div>
          </div>
        </div>

        {/* Cuerpo del formulario */}
        <FichaPsicologiaFormBody valores={valores} setValores={setValores} />

        {/* Enviar */}
        <div className="sticky bottom-4 mt-6">
          <button
            onClick={handleEnviar}
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white font-semibold shadow-lg shadow-purple-900/20 transition-all disabled:opacity-60"
          >
            {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {enviando ? 'Enviando…' : 'Enviar ficha'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            Solo puede enviarse una vez. Revise sus respuestas antes de continuar.
          </p>
        </div>

        {/* Pie de página institucional */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center gap-2 text-center">
          <a href="https://www.crecemos.com.pe" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
            <img src="/logo-text-short.png" alt="Crecemos" className="h-10 w-auto object-contain" />
          </a>
          <a
            href="https://www.crecemos.com.pe"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-[#7B1FA2] hover:text-[#6A1B9A] hover:underline transition-colors"
          >
            Visitar www.crecemos.com.pe →
          </a>
          <p className="text-[11px] text-gray-300">© {new Date().getFullYear()} Crecemos. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default FichaSeguimientoPsicologia;
