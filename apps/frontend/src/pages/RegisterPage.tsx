import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { authApi } from '../api/auth';
import { AxiosError } from 'axios';

type Step = 'form' | 'success';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: searchParams.get('email') || '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('Preencha todos os campos.'); return; }
    if (form.password.length < 6) { setError('A senha precisa ter ao menos 6 caracteres.'); return; }
    if (form.password !== form.confirmPassword) { setError('As senhas não coincidem.'); return; }

    setIsLoading(true);
    try {
      await authApi.register({ name: form.name, email: form.email, password: form.password });
      setStep('success');
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      const msg = axiosErr.response?.data?.error;
      if (msg === 'User already exists') {
        setError('Este e-mail já está cadastrado. Tente fazer login.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const bgStyle = {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '3rem 1rem',
    background: `radial-gradient(ellipse 100% 60% at 50% 0%, rgba(229,9,20,0.12) 0%, transparent 60%), linear-gradient(to bottom, #0A0A0A, #141414)`,
  };

  if (step === 'success') {
    return (
      <div style={bgStyle}>
        <div className="fixed top-6 left-6 z-10">
          <Link to="/" className="text-xl font-black uppercase tracking-widest" style={{ color: '#E50914' }}>RODFLIX</Link>
        </div>
        <div className="rfl-animate-scale-in text-center" style={{ width: '100%', maxWidth: '22rem' }}>
          <div className="rfl-card">
            <CheckCircle2 className="mx-auto mb-6" style={{ width: '4rem', height: '4rem', color: '#4ade80' }} />
            <h1 className="text-2xl font-bold mb-3">Conta criada!</h1>
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Seu cadastro foi recebido. Um administrador irá revisar e aprovar sua conta em breve.
            </p>
            <div className="flex items-center gap-3 mb-8 text-sm" style={{
              padding: '1rem', borderRadius: '0.5rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.6)',
            }}>
              <Clock style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, color: 'rgba(255,255,255,0.3)' }} />
              <span>Você receberá acesso assim que sua conta for aprovada.</span>
            </div>
            <Link to="/login" className="rfl-btn-primary w-full" style={{ padding: '0.875rem', justifyContent: 'center' }}>
              Ir para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={bgStyle}>
      <div className="fixed top-6 left-6 z-10">
        <Link to="/" className="text-xl font-black uppercase tracking-widest" style={{ color: '#E50914' }}>RODFLIX</Link>
      </div>

      <div className="rfl-animate-scale-in" style={{ width: '100%', maxWidth: '22rem' }}>
        <div className="rfl-card">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mx-auto mb-5" style={{
              width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
              background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.3)',
            }}>
              <UserPlus className="w-6 h-6" style={{ color: '#E50914' }} />
            </div>
            <h1 className="text-2xl font-bold">Criar conta</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Solicite seu acesso ao Rodflix</p>
          </div>

          {error && (
            <div className="rfl-alert-error rfl-animate-fade-in" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ marginTop: '0.125rem' }} />
              <span>{error}</span>
            </div>
          )}

          <form id="register-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="rfl-label" htmlFor="register-name">Nome completo</label>
              <div className="relative">
                <User className="absolute w-4 h-4" style={{ left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input id="register-name" name="name" type="text" autoComplete="name"
                  value={form.name} onChange={handleChange} placeholder="Seu nome"
                  className="rfl-input rfl-input-padded" />
              </div>
            </div>

            <div>
              <label className="rfl-label" htmlFor="register-email">E-mail</label>
              <div className="relative">
                <Mail className="absolute w-4 h-4" style={{ left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input id="register-email" name="email" type="email" autoComplete="email"
                  value={form.email} onChange={handleChange} placeholder="seu@email.com"
                  className="rfl-input rfl-input-padded" />
              </div>
            </div>

            <div>
              <label className="rfl-label" htmlFor="register-password">Senha</label>
              <div className="relative">
                <Lock className="absolute w-4 h-4" style={{ left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input id="register-password" name="password" type="password" autoComplete="new-password"
                  value={form.password} onChange={handleChange} placeholder="Mínimo 6 caracteres"
                  className="rfl-input rfl-input-padded" />
              </div>
            </div>

            <div>
              <label className="rfl-label" htmlFor="register-confirm">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute w-4 h-4" style={{ left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input id="register-confirm" name="confirmPassword" type="password" autoComplete="new-password"
                  value={form.confirmPassword} onChange={handleChange} placeholder="Repita a senha"
                  className="rfl-input rfl-input-padded" />
              </div>
            </div>

            <button id="register-submit" type="submit" disabled={isLoading} className="rfl-btn-primary w-full" style={{ marginTop: '0.5rem', padding: '0.875rem' }}>
              {isLoading ? <span className="rfl-spinner" style={{ width: '1.25rem', height: '1.25rem' }} /> : 'Criar conta'}
            </button>
          </form>

          <div className="rfl-divider" style={{ margin: '1.5rem 0' }}>ou</div>

          <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Já tem conta?{' '}
            <Link to="/login" className="font-semibold transition-colors" style={{ color: '#E50914' }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
