'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[SIGNUP-CLIENT] Formulario enviado');
    setError('');

    // Validaciones
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.correo.trim()) {
      setError('El correo electrónico es requerido');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    console.log('[SIGNUP-CLIENT] Iniciando petición a /api/auth/signup');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          correo: formData.correo,
          password: formData.password,
        }),
      });

      console.log('[SIGNUP-CLIENT] Respuesta recibida:', response.status, response.statusText);

      // Leer el texto primero para poder usarlo tanto para JSON como para texto
      const responseText = await response.text();
      let data;
      
      try {
        // Intentar parsear como JSON
        data = JSON.parse(responseText);
      } catch (parseError) {
        // Si no es JSON válido, usar el texto directamente
        console.error('[SIGNUP-CLIENT] Error al parsear JSON:', parseError);
        setError(`Error del servidor: ${responseText || 'Respuesta inválida'}`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        console.error('[SIGNUP-CLIENT] Error en respuesta:', data);
        setError(data.error || 'Error al crear la cuenta');
        setLoading(false);
        return;
      }

      console.log('[SIGNUP-CLIENT] Signup exitoso');
      // Mostrar pantalla de éxito en lugar de redirigir
      setSuccessEmail(formData.correo);
      setSuccess(true);
      setLoading(false);
    } catch (err: unknown) {
      console.error('[SIGNUP-CLIENT] Error en catch:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión. Por favor, intenta nuevamente.';
      setError(errorMessage);
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
            Crear nueva cuenta
          </p>
        </div>

        {/* Card de Sign Up */}
        <div className="rounded-2xl bg-[color:var(--color-background-white)] p-8 shadow-lg shadow-[color:var(--color-yellow)]/10 border border-[color:var(--color-border-light)]">
          {success ? (
            /* Pantalla de éxito */
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--color-alert-success-bg)]">
                  <svg
                    className="h-12 w-12 text-[color:var(--color-alert-success)]"
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
                </div>
              </div>
              <h2 className="mb-4 text-2xl font-bold text-[color:var(--color-text-primary)]">
                ¡Cuenta creada exitosamente!
              </h2>
              <p className="mb-6 text-[color:var(--color-text-secondary)] text-sm leading-relaxed">
                Revisa tu correo electrónico <span className="font-semibold text-[color:var(--color-text-primary)]">{successEmail}</span> para acceder con el link de inicio de sesión.
              </p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full rounded-lg bg-[color:var(--color-yellow)] px-4 py-3 text-[color:var(--color-primary)] font-bold shadow-lg shadow-[color:var(--color-yellow)]/30 hover:bg-[color:var(--color-yellow)]/90 active:scale-[0.98] transition-all"
                >
                  Volver al inicio de sesión
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setSuccessEmail('');
                    setFormData({
                      nombre: '',
                      correo: '',
                      password: '',
                      confirmPassword: '',
                    });
                    setError('');
                  }}
                  className="block w-full rounded-lg border-2 border-[color:var(--color-border-light)] px-4 py-3 text-[color:var(--color-text-secondary)] font-semibold hover:bg-[color:var(--color-background-light)] active:scale-[0.98] transition-all"
                >
                  Crear otra cuenta
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-xl font-bold text-[color:var(--color-text-primary)] text-center">
                Registrarse
              </h2>

              <form 
            onSubmit={handleSubmit} 
            className="space-y-5"
            noValidate
          >
            <div>
              <label
                htmlFor="nombre"
                className="mb-2 block text-sm font-semibold text-[color:var(--color-text-secondary)]"
              >
                Nombre completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full rounded-lg border border-[color:var(--color-border-light)] bg-[color:var(--color-background-white)] px-4 py-3 text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-tertiary)] focus:border-[color:var(--color-yellow)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-yellow)]/20 transition-colors disabled:bg-[color:var(--color-background-light)] disabled:cursor-not-allowed"
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <label
                htmlFor="correo"
                className="mb-2 block text-sm font-semibold text-[color:var(--color-text-secondary)]"
              >
                Correo electrónico
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-[color:var(--color-border-light)] bg-[color:var(--color-background-white)] px-4 py-3 pr-12 text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-tertiary)] focus:border-[color:var(--color-yellow)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-yellow)]/20 transition-colors disabled:bg-[color:var(--color-background-light)] disabled:cursor-not-allowed"
                  placeholder="Mínimo 6 caracteres"
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-[color:var(--color-text-secondary)]"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-[color:var(--color-border-light)] bg-[color:var(--color-background-white)] px-4 py-3 pr-12 text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-tertiary)] focus:border-[color:var(--color-yellow)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-yellow)]/20 transition-colors disabled:bg-[color:var(--color-background-light)] disabled:cursor-not-allowed"
                  placeholder="Repite tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-tertiary)] hover:text-[color:var(--color-text-secondary)] transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
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
                  Creando cuenta...
                </span>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          {/* Link a login */}
          <div className="mt-6 border-t border-[color:var(--color-border-light)] pt-6">
            <p className="text-center text-xs text-[color:var(--color-text-tertiary)] mb-3">
              ¿Ya tienes una cuenta?
            </p>
            <Link
              href="/login"
              className="block w-full text-center rounded-lg border-2 border-[color:var(--color-border-light)] px-4 py-2 text-[color:var(--color-text-secondary)] font-semibold hover:bg-[color:var(--color-background-light)] active:scale-[0.98] transition-all"
            >
              Iniciar sesión
            </Link>
          </div>
            </>
          )}
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
