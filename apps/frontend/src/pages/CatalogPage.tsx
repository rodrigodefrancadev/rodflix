import { Link } from 'react-router-dom';
import {
  Film,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Play,
  Plus,
  Clapperboard,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const placeholderTitles = [
  { id: 1, title: 'O Poderoso Chefão', type: 'Filme', year: '1972', color: '#c0392b' },
  { id: 2, title: 'Interstellar', type: 'Filme', year: '2014', color: '#2980b9' },
  { id: 3, title: 'Breaking Bad', type: 'Série', year: '2008', color: '#27ae60' },
  { id: 4, title: 'Pulp Fiction', type: 'Filme', year: '1994', color: '#8e44ad' },
  { id: 5, title: 'Dark', type: 'Série', year: '2017', color: '#16a085' },
  { id: 6, title: 'Inception', type: 'Filme', year: '2010', color: '#d35400' },
  { id: 7, title: 'Chernobyl', type: 'Série', year: '2019', color: '#7f8c8d' },
  { id: 8, title: '2001: A Space Odyssey', type: 'Filme', year: '1968', color: '#2c3e50' },
];

function CatalogCard({ title, type, year, color }: { title: string; type: string; year: string; color: string }) {
  return (
    <div
      className="group relative overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10"
      style={{ borderRadius: '0.5rem', aspectRatio: '16/9' }}
    >
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${color}cc, ${color}44, #0a0a0a)` }} />

      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="rfl-badge-red text-xs">{type}</span>
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{year}</span>
        </div>
        <p className="font-bold text-sm leading-tight" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{title}</p>
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-200"
        style={{ background: 'rgba(0,0,0,0.6)', opacity: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
      >
        <button className="flex items-center justify-center transition-colors" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', background: '#fff' }}>
          <Play className="w-4 h-4" style={{ color: '#000', fill: '#000', marginLeft: '2px' }} />
        </button>
        <button className="flex items-center justify-center transition-colors" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.5)', background: 'transparent' }}>
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function CatalogPage() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#141414' }}>
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-4 flex items-center justify-between rfl-glass">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black uppercase tracking-widest select-none" style={{ color: '#E50914' }}>
            RODFLIX
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#" className="font-medium hover:opacity-70 transition-opacity">Início</a>
            <a href="#" className="transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.5)' }}>Filmes</a>
            <a href="#" className="transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.5)' }}>Séries</a>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1.5 font-medium transition-colors" style={{ color: '#E50914' }}>
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="rfl-btn-ghost p-2"><Search className="w-5 h-5" /></button>
          <button className="rfl-btn-ghost p-2"><Bell className="w-5 h-5" /></button>

          {/* User dropdown */}
          <div className="relative flex items-center gap-2 cursor-pointer group">
            <div className="flex items-center justify-center text-sm font-bold text-white" style={{
              width: '2rem', height: '2rem', borderRadius: '0.375rem',
              background: 'linear-gradient(135deg, #E50914, #B20710)',
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="hidden md:block text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />

            <div
              className="absolute rfl-glass rounded-xl p-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200"
              style={{ top: '3rem', right: 0, width: '12rem', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            >
              <div className="px-3 py-2 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{user?.name}</p>
                <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ paddingTop: '5rem' }}>
        {/* HERO */}
        <section
          className="relative flex items-end px-6 mb-10"
          style={{
            height: '55vh', paddingBottom: '4rem',
            background: `
              linear-gradient(to right, rgba(0,0,0,0.85) 40%, transparent 100%),
              linear-gradient(to top, #141414 0%, transparent 40%),
              linear-gradient(135deg, #c0392b88, #2c3e5088)
            `,
          }}
        >
          <div style={{ maxWidth: '28rem' }}>
            <div className="rfl-badge-red mb-4">Em destaque</div>
            <h2 className="font-black mb-4 leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
              O Poderoso<br />Chefão
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '22rem' }}>
              A saga da família Corleone, um dos clãs mais poderosos do crime organizado americano.
            </p>
            <div className="flex items-center gap-3">
              <button className="rfl-btn-primary gap-2"><Play className="w-4 h-4 fill-current" /> Assistir</button>
              <button className="rfl-btn-secondary gap-2"><Plus className="w-4 h-4" /> Minha lista</button>
            </div>
          </div>
        </section>

        {/* ADMIN SYNC NOTICE */}
        {isAdmin && (
          <section className="px-6 mb-8">
            <div className="flex items-center justify-between p-4 rounded-xl" style={{
              background: 'rgba(229,9,20,0.08)', border: '1px solid rgba(229,9,20,0.2)',
            }}>
              <div className="flex items-center gap-3">
                <Clapperboard className="w-5 h-5" style={{ color: '#E50914' }} />
                <div>
                  <p className="text-sm font-semibold">Catálogo do Google Drive</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Sincronize o catálogo com sua pasta do Drive</p>
                </div>
              </div>
              <button className="rfl-btn-secondary gap-2" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                <RefreshCw className="w-4 h-4" /> Sincronizar
              </button>
            </div>
          </section>
        )}

        {/* CATALOG ROWS */}
        <section className="px-6 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Em destaque</h3>
            <button className="rfl-btn-ghost text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Ver tudo <ChevronDown className="w-3 h-3" style={{ transform: 'rotate(-90deg)' }} />
            </button>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {placeholderTitles.slice(0, 4).map((t) => <CatalogCard key={t.id} {...t} />)}
          </div>
        </section>

        <section className="px-6 mb-16">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Séries populares</h3>
            <button className="rfl-btn-ghost text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Ver tudo <ChevronDown className="w-3 h-3" style={{ transform: 'rotate(-90deg)' }} />
            </button>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {placeholderTitles.slice(4).map((t) => <CatalogCard key={t.id} {...t} />)}
          </div>
        </section>

        {/* Empty state */}
        <div className="px-6 pb-16 text-center">
          <div className="max-w-md mx-auto p-8 rounded-2xl" style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Film className="mx-auto mb-4" style={{ width: '2.5rem', height: '2.5rem', color: 'rgba(255,255,255,0.2)' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              O catálogo real será carregado após a sincronização com o Google Drive.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
