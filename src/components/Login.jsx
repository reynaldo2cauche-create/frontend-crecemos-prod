import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, LogIn, AlertCircle, CalendarCheck, Users, ShieldCheck } from 'lucide-react';
import { login } from '../services/authService';

const Login = () => {
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
      const response = await login({ username: usuario, password: contrasena });
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/intranet/lista-pacientes');
    } catch (err) {
      console.error('Error en login:', err);
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden cx-admin-bg p-4 sm:p-6">
      {/* Orbes suaves coherentes con el fondo lila de la intranet */}
      <div className="cx-float pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#7B1FA2]/[0.10] blur-3xl" />
      <div className="cx-float-2 pointer-events-none absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-[#A3C644]/[0.14] blur-3xl" />

      <div className="relative w-full max-w-4xl">
        <div className="cx-login-in relative grid grid-cols-1 overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_90px_-40px_rgba(90,40,130,0.55)] ring-1 ring-black/[0.04] lg:grid-cols-2">
          {/* ─────── IZQUIERDA — Marca / foto ─────── */}
          <div className="relative flex flex-col items-center justify-center gap-6 overflow-hidden border-b border-gray-100 bg-white p-8 text-center sm:p-10 lg:border-b-0 lg:border-r">
            {/* Orbes internos muy suaves para dar un toque de vida */}
            <div className="cx-float pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#7B1FA2]/[0.08] blur-3xl" />
            <div className="cx-float-2 pointer-events-none absolute -bottom-16 -right-12 h-60 w-60 rounded-full bg-[#A3C644]/[0.12] blur-3xl" />

            <div className="relative rounded-3xl bg-gradient-to-br from-[#faf6fe] to-[#f3fae4] p-5 shadow-[0_18px_45px_-18px_rgba(123,31,162,0.40)] ring-1 ring-[#7B1FA2]/10">
              <img src="/logo-inicio-sesion.png" alt="Centro Crecemos" className="w-40 sm:w-44" />
            </div>

            <div className="relative">
              <h2 className="text-xl font-extrabold leading-tight text-[#3B0F63] sm:text-2xl">
                Centro Integral de Terapias
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Gestiona pacientes, agenda, asistencias y reportes — todo en un solo lugar.
              </p>
            </div>

            {/* Highlights */}
            <div className="relative flex flex-col gap-2.5 text-left">
              {[
                { Icon: CalendarCheck, text: 'Agenda clínica y reprogramaciones' },
                { Icon: Users, text: 'Pacientes y terapeutas organizados' },
                { Icon: ShieldCheck, text: 'Acceso seguro por rol' },
              ].map(({ Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[#7B1FA2]/10">
                    <Icon className="h-4 w-4 text-[#7B1FA2]" />
                  </span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* ─────── DERECHA — Formulario ─────── */}
          <div className="flex flex-col justify-center bg-white p-8 sm:p-10">
          <div className="cx-rise mb-6" style={{ animationDelay: '.1s' }}>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#A3C644]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#5a7a0f]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A3C644]" />
              Bienvenido de nuevo
            </span>
            <h1 className="text-2xl font-extrabold leading-tight text-[#3B0F63]">Iniciar sesión</h1>
            <p className="mt-1.5 text-sm text-gray-500">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            {/* Usuario */}
            <div className="cx-rise" style={{ animationDelay: '.18s' }}>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Usuario</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B1FA2]" />
                <input
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  disabled={loading}
                  placeholder="Tu usuario"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-[#A3C644] focus:outline-none focus:ring-2 focus:ring-[#A3C644] disabled:opacity-60"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="cx-rise" style={{ animationDelay: '.26s' }}>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Contraseña</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B1FA2]" />
                <input
                  type={mostrarContrasena ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  disabled={loading}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-11 text-sm shadow-sm transition-all focus:border-[#A3C644] focus:outline-none focus:ring-2 focus:ring-[#A3C644] disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena((v) => !v)}
                  disabled={loading}
                  aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#7B1FA2]"
                >
                  {mostrarContrasena ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Botón */}
            <div className="cx-rise" style={{ animationDelay: '.34s' }}>
              <button
                type="submit"
                disabled={loading}
                className="cx-glow cx-shine mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] py-3.5 text-sm font-bold text-white transition-all disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Iniciando sesión…
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Iniciar sesión
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Pie — equilibra el espacio y da cierre */}
          <div className="cx-rise mt-8 flex items-center gap-3 text-xs text-gray-400" style={{ animationDelay: '.42s' }}>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <ShieldCheck className="h-3.5 w-3.5 text-[#A3C644]" />
              Conexión segura
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
