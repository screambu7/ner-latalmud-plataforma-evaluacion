'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Log para debugging
        console.error('[LOGIN] Error response:', {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        
        // B2-2: Mensaje genérico (no mencionar Magic Link)
        setError(data.error || `Error al iniciar sesión (${response.status})`);
        setLoading(false);
        return;
      }

      router.push(data.redirectUrl || '/evaluador-dashboard');
      router.refresh();
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
      {/* Fondo decorativo con colores de la paleta */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-1/4 -top-1/4 h-96 w-96 rounded-full bg-[color:var(--color-yellow)]/10 blur-3xl"></div>
        <div className="absolute -bottom-1/4 -left-1/4 h-96 w-96 rounded-full bg-[color:var(--color-orange)]/10 blur-3xl"></div>
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-yellow)]/20 border-2 border-[color:var(--color-yellow)]/30">
              <svg
                className="h-10 w-10 text-[color:var(--color-primary)]"
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
          <h1 className="mb-2 text-3xl font-bold text-[color:var(--color-text-primary)] tracking-tight">
            Ner LaTalmud
          </h1>
          <p className="text-[color:var(--color-text-secondary)] text-sm font-medium">
            Sistema de Diagnóstico Académico de Guemará
          </p>
        </div>

        {/* Card de Login */}
          <div className="rounded-2xl bg-[color:var(--color-background-white)] p-8 shadow-lg shadow-[color:var(--color-yellow)]/10 border border-[color:var(--color-border-light)]">
          <h2 className="mb-6 text-xl font-bold text-[color:var(--color-text-primary)] text-center">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="correo"
                className="mb-2 block text-sm font-semibold text-[color:var(--color-text-secondary)]"
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
                autoComplete="email"
                className="w-full rounded-lg border border-[color:var(--color-border-light)] bg-[color:var(--color-background-white)] px-4 py-3 text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-tertiary)] focus:border-[color:var(--color-yellow)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-yellow)]/20 transition-colors disabled:bg-[color:var(--color-background-light)] disabled:cursor-not-allowed"
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[color:var(--color-text-secondary)]"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-[color:var(--color-border-light)] bg-[color:var(--color-background-white)] px-4 py-3 pr-12 text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-tertiary)] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:bg-[color:var(--color-background-light)] disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-tertiary)] hover:text-[color:var(--color-text-secondary)] transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>


            {error && (
              <div className="rounded-lg bg-[color:var(--color-alert-error-bg)] border border-[color:var(--color-alert-error-border)] p-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-[color:var(--color-alert-error)]"
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
                  <p className="text-sm font-medium text-[color:var(--color-alert-error)]">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[color:var(--color-yellow)] px-4 py-3 text-[color:var(--color-primary)] font-bold shadow-lg shadow-[color:var(--color-yellow)]/30 hover:bg-[color:var(--color-yellow)]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[color:var(--color-border-medium)]"
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
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Mensaje informativo (B2-2: links removidos) */}
          <div className="mt-6 border-t border-[color:var(--color-border-light)] pt-4">
            <p className="text-center text-xs text-[color:var(--color-text-tertiary)]">
              El acceso es proporcionado por el administrador
            </p>
          </div>

          {/* Footer del card */}
          <div className="mt-6 border-t border-[color:var(--color-border-light)] pt-6">
            <p className="text-center text-xs text-[color:var(--color-text-tertiary)]">
              Acceso exclusivo para personal autorizado
            </p>
          </div>
        </div>

        {/* Footer de la página */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[color:var(--color-text-tertiary)]">
            © {new Date().getFullYear()} Ner LaTalmud. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
