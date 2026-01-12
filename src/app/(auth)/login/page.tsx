'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLinkSent(false);

    try {
      const response = await fetch('/api/auth/request-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al solicitar link de acceso');
        setLoading(false);
        return;
      }

      // Mostrar mensaje de éxito
      setLinkSent(true);
      setLoading(false);
    } catch (err) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center bg-paper p-6"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-1/4 -top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-1/4 -left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-10 w-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-[#0d151b] tracking-tight">
            Ner LaTalmud
          </h1>
          <p className="text-slate-600 text-sm font-medium">
            Sistema de Diagnóstico Académico de Guemará
          </p>
        </div>

        {/* Card de Login */}
        <div className="rounded-2xl bg-white p-8 shadow-lg shadow-primary/10 border border-neutral-100">
          <h2 className="mb-6 text-xl font-bold text-[#0d151b] text-center">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="correo"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Correo electrónico
              </label>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:bg-slate-50 disabled:cursor-not-allowed"
                placeholder="tu@correo.com"
              />
            </div>

            {linkSent && (
              <div className="rounded-lg bg-green-50 border border-green-100 p-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-sm font-medium text-green-700">
                    Si el correo existe en nuestro sistema, recibirás un link de acceso en breve.
                    {process.env.NODE_ENV === 'development' && ' (Revisa la consola del servidor para el link)'}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-white font-semibold shadow-lg shadow-primary/30 hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Enviando link...
                </span>
              ) : (
                'Enviar Link de Acceso'
              )}
            </button>
          </form>

          {/* Links adicionales */}
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:underline font-medium"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="border-t border-neutral-100 pt-4">
              <p className="text-center text-xs text-slate-500 mb-3">
                ¿No tienes una cuenta?
              </p>
              <a
                href="/signup"
                className="block w-full text-center rounded-lg border-2 border-primary px-4 py-2 text-primary font-semibold hover:bg-primary/5 active:scale-[0.98] transition-all"
              >
                Crear cuenta
              </a>
            </div>
          </div>

          {/* Footer del card */}
          <div className="mt-6 border-t border-neutral-100 pt-6">
            <p className="text-center text-xs text-slate-500">
              Acceso exclusivo para personal autorizado
            </p>
          </div>
        </div>

        {/* Footer de la página */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Ner LaTalmud. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
