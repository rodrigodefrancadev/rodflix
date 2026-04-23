import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AxiosError } from 'axios';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Preencha todos os campos.'); return; }
    try {
      await login({ email: form.email, password: form.password });
      navigate('/catalog', { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      const msg = axiosErr.response?.data?.error;
      if (msg === 'User not yet approved by moderator') {
        setError('Sua conta ainda não foi aprovada pelo administrador. Aguarde o contato.');
      } else if (msg === 'Invalid credentials') {
        setError('E-mail ou senha incorretos. Tente novamente.');
      } else {
        setError('Erro ao fazer login. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `radial-gradient(ellipse 100% 60% at 50% 0%, rgba(229,9,20,0.12) 0%, transparent 60%), linear-gradient(to bottom, #0A0A0A, #141414)`,
      }}
    >
      <div className="fixed top-6 left-6 z-10">
        <Link to="/" className="text-xl font-black uppercase tracking-widest" style={{ color: '#E50914' }}>
          RODFLIX
        </Link>
      </div>

      <div className="w-full rfl-animate-scale-in" style={{ maxWidth: '22rem' }}>
        <div className="rfl-card">
          <div className="mb-8 text-center">
            <div
              className="flex items-center justify-center mx-auto mb-5"
              style={{
                width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
                background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.3)',
              }}
            >
              <LogIn className="w-6 h-6" style={{ color: '#E50914' }} />
            </div>
            <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Entre na sua conta para continuar</p>
          </div>

          {error && (
            <div className="rfl-alert-error mb-6 rfl-animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ marginTop: '0.125rem' }} />
              <span>{error}</span>
            </div>
          )}

          <form id="login-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="rfl-label" htmlFor="login-email">E-mail</label>
              <div className="relative">
                <Mail className="absolute w-4 h-4" style={{ left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input
                  id="login-email" name="email" type="email" autoComplete="email"
                  value={form.email} onChange={handleChange} placeholder="seu@email.com"
                  className="rfl-input rfl-input-padded"
                />
              </div>
            </div>

            <div>
              <label className="rfl-label" htmlFor="login-password">Senha</label>
              <div className="relative">
                <Lock className="absolute w-4 h-4" style={{ left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input
                  id="login-password" name="password" type="password" autoComplete="current-password"
                  value={form.password} onChange={handleChange} placeholder="••••••••"
                  className="rfl-input rfl-input-padded"
                />
              </div>
            </div>

            <button id="login-submit" type="submit" disabled={isLoading} className="rfl-btn-primary w-full" style={{ marginTop: '0.5rem', padding: '0.875rem' }}>
              {isLoading ? <span className="rfl-spinner" style={{ width: '1.25rem', height: '1.25rem' }} /> : 'Entrar'}
            </button>
          </form>

          <div className="rfl-divider" style={{ margin: '1.5rem 0' }}>ou</div>

          <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Ainda não tem conta?{' '}
            <Link to="/register" className="font-semibold transition-colors" style={{ color: '#E50914' }}>
              Cadastre-se
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
          O acesso é sujeito à aprovação do administrador.
        </p>
      </div>
    </div>
  );
}
