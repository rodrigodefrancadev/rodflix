import { useState, useEffect } from 'react';
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
  XCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { catalogApi } from '../api/catalog';
import type { CatalogItem } from '../api/catalog';
import { adminApi } from '../api/admin';
import { VideoPlayer } from '../components/VideoPlayer';

// Helper to get a stable color from a string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#16a085', 
    '#d35400', '#7f8c8d', '#2c3e50', '#e67e22', '#2980b9'
  ];
  return colors[Math.abs(hash) % colors.length];
};

function CatalogCard({ item, onPlay }: { item: CatalogItem; onPlay: (id: string, title: string) => void }) {
  const color = stringToColor(item.title);
  
  const handlePlayClick = () => {
    if (item.kind === 'film') {
      onPlay(item.driveFileId, item.title);
    } else {
      // For series, play the first episode of the first season
      const firstEp = item.seasons[0]?.episodes[0];
      if (firstEp) {
        onPlay(firstEp.driveFileId, `${item.title} - S01E01`);
      }
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className="group relative overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10 rfl-animate-slide-up"
      style={{ borderRadius: '0.5rem', aspectRatio: '16/9' }}
    >
      <div className="absolute inset-0" style={{ 
        background: `linear-gradient(135deg, ${color}cc, ${color}44, #0a0a0a)` 
      }} />

      <div className="absolute inset-0 p-4 flex flex-col justify-between rfl-glass-dark group-hover:bg-transparent transition-colors">
        <div className="flex justify-between items-start">
          <span className="rfl-badge-red text-[10px] py-0 px-1.5">{item.kind === 'film' ? 'Filme' : 'Série'}</span>
          {item.year && <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.year}</span>}
        </div>
        <p className="font-bold text-sm leading-tight line-clamp-2" style={{ textShadow: '0 1px 8px rgba(0,0,0,1)' }}>{item.title}</p>
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-200"
        style={{ background: 'rgba(0,0,0,0.75)', opacity: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
      >
        <div className="flex items-center justify-center transition-transform active:scale-90" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', background: '#fff' }}>
          <Play className="w-4 h-4" style={{ color: '#000', fill: '#000', marginLeft: '2px' }} />
        </div>
        <div className="flex items-center justify-center transition-transform active:scale-90" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.5)', background: 'transparent' }}>
          <Plus className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}

export function CatalogPage() {
  const { user, logout, isAdmin } = useAuth();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'film' | 'series'>('all');
  const [playingVideo, setPlayingVideo] = useState<{ id: string; title: string } | null>(null);

  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      const data = await catalogApi.getCatalog();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch catalog', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await adminApi.syncCatalog();
      await fetchCatalog();
    } catch (error) {
      console.error('Sync failed', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredItems = items.filter(item => 
    activeFilter === 'all' ? true : item.kind === activeFilter
  );

  const films = items.filter(i => i.kind === 'film');
  const series = items.filter(i => i.kind === 'series');
  
  // Featured item
  const featuredItem = items[0];

  const handlePlay = (id: string, title: string) => {
    setPlayingVideo({ id, title });
  };

  return (
    <div className="min-h-screen text-white pb-20" style={{ backgroundColor: '#0A0A0A' }}>
      {/* PLAYER MODAL */}
      {playingVideo && (
        <VideoPlayer 
          fileId={playingVideo.id} 
          title={playingVideo.title} 
          onClose={() => setPlayingVideo(null)} 
        />
      )}

      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-4 flex items-center justify-between rfl-glass">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black uppercase tracking-widest select-none cursor-pointer" 
                onClick={() => setActiveFilter('all')}
                style={{ color: '#E50914' }}>
            RODFLIX
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`font-medium transition-all ${activeFilter === 'all' ? 'text-white scale-110' : 'text-white/50 hover:text-white'}`}
            >
              Início
            </button>
            <button 
              onClick={() => setActiveFilter('film')}
              className={`font-medium transition-all ${activeFilter === 'film' ? 'text-white scale-110' : 'text-white/50 hover:text-white'}`}
            >
              Filmes
            </button>
            <button 
              onClick={() => setActiveFilter('series')}
              className={`font-medium transition-all ${activeFilter === 'series' ? 'text-white scale-110' : 'text-white/50 hover:text-white'}`}
            >
              Séries
            </button>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1.5 font-medium transition-colors hover:opacity-80" style={{ color: '#E50914' }}>
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="rfl-btn-ghost p-2"><Search className="w-5 h-5" /></button>
          
          <div className="relative flex items-center gap-2 cursor-pointer group">
            <div className="flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{
              width: '2.2rem', height: '2.2rem', borderRadius: '0.375rem',
              background: 'linear-gradient(135deg, #E50914, #B20710)',
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" style={{ color: 'rgba(255,255,255,0.4)' }} />

            <div
              className="absolute rfl-glass rounded-xl p-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200"
              style={{ top: '3rem', right: 0, width: '12rem', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            >
              <div className="px-3 py-2 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs font-bold">{user?.name}</p>
                <p className="text-[10px] truncate opacity-40">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-white/5 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        {featuredItem ? (
          <section
            className="relative flex items-end px-6 rfl-animate-fade-in"
            style={{
              height: '70vh', paddingBottom: '6rem',
              background: `
                linear-gradient(to right, #0A0A0A 20%, rgba(10,10,10,0) 100%),
                linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0) 30%),
                url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop') center/cover
              `,
            }}
          >
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="rfl-badge-red uppercase tracking-tighter font-black text-[10px]">Especial</div>
                {featuredItem.year && (
                   <span className="text-xs font-bold text-white/60">{featuredItem.year}</span>
                )}
              </div>
              <h2 className="font-black mb-4 leading-tight uppercase tracking-tighter" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)' }}>
                {featuredItem.title}
              </h2>
              <p className="text-sm md:text-base mb-8 leading-relaxed line-clamp-3" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '30rem' }}>
                Explore os títulos mais recentes e exclusivos sincronizados diretamente do seu Google Drive.
              </p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => featuredItem.kind === 'film' ? handlePlay(featuredItem.driveFileId, featuredItem.title) : handlePlay(featuredItem.seasons[0]?.episodes[0]?.driveFileId, `${featuredItem.title} - S01E01`)}
                  className="rfl-btn-primary gap-2 h-12 px-8 text-lg font-bold"
                >
                  <Play className="w-5 h-5 fill-current" /> Assistir Agora
                </button>
                <button className="rfl-btn-secondary gap-2 h-12 px-6 bg-white/10 hover:bg-white/20">
                  <Plus className="w-5 h-5" /> Minha Lista
                </button>
              </div>
            </div>
          </section>
        ) : !isLoading && (
          <div className="h-[60vh] flex items-center justify-center flex-col gap-6 text-center">
             <XCircle className="w-20 h-20 text-white/10" />
             <div>
               <h2 className="text-2xl font-bold mb-2">Catálogo Vazio</h2>
               <p className="text-white/40 max-w-xs">Nenhum título foi encontrado no seu Google Drive. Sincronize agora para começar.</p>
             </div>
             {isAdmin && (
               <button onClick={handleSync} disabled={isSyncing} className="rfl-btn-primary gap-2">
                 {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                 Sincronizar Agora
               </button>
             )}
          </div>
        )}

        <div className="px-6 -mt-16 relative z-10 space-y-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* IF FILTERED OR ALL */}
              {activeFilter === 'all' ? (
                <>
                  {films.length > 0 && (
                    <section>
                      <h3 className="text-xl font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                        <Film className="w-5 h-5 text-red-500" /> Filmes Recentes
                      </h3>
                      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                        {films.map(item => <CatalogCard key={item.existingId} item={item} onPlay={handlePlay} />)}
                      </div>
                    </section>
                  )}

                  {series.length > 0 && (
                    <section>
                      <h3 className="text-xl font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                        <Clapperboard className="w-5 h-5 text-red-500" /> Séries Exclusivas
                      </h3>
                      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                        {series.map(item => <CatalogCard key={item.existingId} item={item} onPlay={handlePlay} />)}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <section>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                    {activeFilter === 'film' ? <Film className="w-6 h-6 text-red-500" /> : <Clapperboard className="w-6 h-6 text-red-500" />}
                    {activeFilter === 'film' ? 'Todos os Filmes' : 'Todas as Séries'}
                  </h3>
                  <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {filteredItems.map(item => <CatalogCard key={item.existingId} item={item} onPlay={handlePlay} />)}
                  </div>
                  {filteredItems.length === 0 && (
                     <div className="py-20 text-center text-white/20">
                        Nenhum item encontrado nesta categoria.
                     </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-white/5 py-12 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
          <span className="text-xl font-black uppercase tracking-widest text-red-600">RODFLIX</span>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-red-500">Ajuda</a>
            <a href="#" className="hover:text-red-500">Privacidade</a>
            <a href="#" className="hover:text-red-500">Termos</a>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest">© 2026 Rodflix Media Inc.</p>
        </div>
      </footer>
    </div>
  );
}
