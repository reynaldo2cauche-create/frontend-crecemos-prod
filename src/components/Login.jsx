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
    <div className="flex min-h-screen w-full">
      {/* ─────────── IZQUIERDA — Panel de marca (desktop) ─────────── */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#7B1FA2] via-[#9C27B0] to-[#531572] p-12 lg:flex">
        {/* Orbes / textura */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-[28rem] w-[28rem] rounded-full bg-[#A3C644]/20 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-16 h-40 w-40 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute left-16 bottom-24 h-24 w-24 rounded-full border border-white/10" />

        <div className="relative z-10 flex max-w-md flex-col items-center text-center">
          <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-black/20">
            <img src="/logo-inicio-sesion.png" alt="Centro Crecemos" className="w-48" />
          </div>

          <h2 className="mt-10 text-3xl font-extrabold leading-tight text-white">
            Centro Integral de Terapias
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Gestiona pacientes, agenda, asistencias y reportes — todo en un solo lugar.
          </p>

          <div className="mt-8 flex flex-col gap-3 text-left">
            {[
              { Icon: CalendarCheck, text: 'Agenda clínica y reprogramaciones' },
              { Icon: Users, text: 'Pacientes y terapeutas organizados' },
              { Icon: ShieldCheck, text: 'Acceso seguro por rol' },
            ].map(({ Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                  <Icon className="h-4 w-4 text-white" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────── DERECHA — Formulario ─────────── */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#faf6fe] via-white to-[#f2ecfa] p-6 sm:p-10 lg:w-1/2">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#7B1FA2]/[0.06] blur-3xl lg:hidden" />

        <div className="relative w-full max-w-md">
          {/* Logo en móvil */}
          <div className="mb-6 flex justify-center lg:hidden">
            <img src="/logo-inicio-sesion.png" alt="Centro Crecemos" className="w-40" />
          </div>

          <div className="rounded-3xl bg-white/90 p-8 shadow-[0_24px_70px_-24px_rgba(123,31,162,0.35)] ring-1 ring-white/70 backdrop-blur-xl sm:p-10">
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold leading-tight text-[#2D0A4E]">Iniciar sesión</h1>
              <p className="mt-1 text-sm text-gray-400">Ingresa tus credenciales para continuar</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
              {/* Usuario */}
              <div>
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
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-[#7B1FA2] focus:outline-none focus:ring-4 focus:ring-[#7B1FA2]/15 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
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
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-11 text-sm shadow-sm transition-all focus:border-[#7B1FA2] focus:outline-none focus:ring-4 focus:ring-[#7B1FA2]/15 disabled:opacity-60"
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
              <button
                type="submit"
                disabled={loading}
                className="cx-glow mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
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
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Centro Integral de Terapias · Crecemos
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
