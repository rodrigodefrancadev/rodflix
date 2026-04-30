import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Star, Shield, Users, ChevronRight, Film } from 'lucide-react';

const features = [
  {
    icon: Film,
    title: 'Curadoria exclusiva',
    desc: 'Um catálogo selecionado com os melhores títulos, atualizado diretamente pelo administrador.',
  },
  {
    icon: Shield,
    title: 'Acesso restrito',
    desc: 'Apenas membros aprovados têm acesso. Privacidade e exclusividade em primeiro lugar.',
  },
  {
    icon: Star,
    title: 'Experiência premium',
    desc: 'Interface limpa, rápida e elegante. Foco total no que importa: os filmes.',
  },
  {
    icon: Users,
    title: 'Comunidade seleta',
    desc: 'Faça parte de um grupo de pessoas que compartilham o mesmo bom gosto cinematográfico.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setIsLoading(false);
    navigate(`/register?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#141414' }}>
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-4 flex items-center justify-between rfl-nav-gradient">
        <span className="text-2xl font-black uppercase tracking-widest select-none" style={{ color: '#E50914' }}>
          RODFLIX
        </span>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rfl-btn-ghost text-sm">Entrar</Link>
          <Link to="/register" className="rfl-btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
            Cadastrar
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 0%, rgba(229,9,20,0.18) 0%, transparent 60%),
            linear-gradient(to bottom, #0A0A0A 0%, #141414 100%)
          `,
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto rfl-animate-slide-up">
          <div className="rfl-badge-red mb-6 mx-auto w-fit">
            <Play className="w-3 h-3 mr-1 fill-current" />
            Streaming exclusivo
          </div>

          <h1 className="text-5xl font-black leading-tight mb-6 tracking-tight" style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)' }}>
            Filmes e séries,{' '}
            <span className="rfl-text-gradient">sem limites</span>
          </h1>

          <p className="text-lg mb-12 max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Uma plataforma exclusiva para os que foram convidados. Cadastre-se e aguarde a aprovação para acessar o catálogo completo.
          </p>

          <form onSubmit={handleCta} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              id="hero-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              className="rfl-input flex-1"
            />
            <button type="submit" disabled={isLoading} className="rfl-btn-primary" style={{ whiteSpace: 'nowrap' }}>
              {isLoading ? (
                <span className="rfl-spinner" style={{ width: '1rem', height: '1rem' }} />
              ) : (
                <>Começar <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Acesso sujeito à aprovação do administrador.
          </p>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 rfl-animate-bounce" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.25rem' }}>
          ↓
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
            Por que o Rodflix?
          </h2>
          <p className="text-center mb-16 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Uma experiência de streaming pensada para quem valoriza qualidade e exclusividade.
          </p>

          <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rfl-card-hover group">
                <div className="flex items-start gap-5">
                  <div
                    className="flex-shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{
                      width: '3rem', height: '3rem', borderRadius: '0.75rem',
                      background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.25)',
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: '#E50914' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section className="py-20 px-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Pronto para entrar?</h2>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Crie sua conta agora e faça parte do clube.</p>
          <Link to="/register" className="rfl-btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }}>
            Criar minha conta
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © {new Date().getFullYear()} Rodflix. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
