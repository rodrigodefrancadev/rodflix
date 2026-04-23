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
  Loader2,
  Info,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { catalogApi } from '../api/catalog';
import type { CatalogItem } from '../api/catalog';
import { adminApi } from '../api/admin';
import { VideoPlayer } from '../components/VideoPlayer';
import { TitleDetailsModal } from '../components/TitleDetailsModal';
import { watchedApi } from '../api/watched';

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

function CatalogCard({
  item,
  onClick,
  isWatched
}: {
  item: CatalogItem;
  onClick: (item: CatalogItem) => void;
  isWatched: boolean;
}) {
  const color = stringToColor(item.title);

  return (
    <div
      onClick={() => onClick(item)}
      className="group relative overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10 rfl-animate-slide-up bg-[#141414]"
      style={{ borderRadius: '0.5rem', aspectRatio: '2/3' }} // Using 2:3 for posters
    >
      {item.posterUrl ? (
        <img
          src={item.posterUrl}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-40"
        />
      ) : (
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, ${color}cc, ${color}44, #0a0a0a)`
        }} />
      )}

      <div className="absolute inset-0 p-4 flex flex-col justify-between rfl-glass-dark group-hover:bg-transparent transition-colors opacity-0 group-hover:opacity-100">
        <div className="flex justify-between items-start">
          <span className="rfl-badge-red text-[10px] py-0 px-1.5">{item.kind === 'film' ? 'Filme' : 'Série'}</span>
          {item.year && <span className="text-[10px] font-medium text-white/60">{item.year}</span>}
          {isWatched && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
              <Check className="w-3 h-3" />
              ASSISTIDO
            </div>
          )}
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
  const [selectedTitle, setSelectedTitle] = useState<CatalogItem | null>(null);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      const [catalogData, watchedData] = await Promise.all([
        catalogApi.getCatalog(),
        watchedApi.getWatched()
      ]);
      setItems(catalogData);
      setWatchedIds(new Set(watchedData.map(w => w.refId)));
    } catch (error) {
      console.error('Failed to fetch catalog or watched status', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWatched = async (refId: string, kind: 'FILM' | 'EPISODE') => {
    try {
      const isWatched = await watchedApi.toggleWatched(refId, kind);
      setWatchedIds(prev => {
        const next = new Set(prev);
        if (isWatched) next.add(refId);
        else next.delete(refId);
        return next;
      });
    } catch (error) {
      console.error('Failed to toggle watched status', error);
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

  const films = items.filter(i => 
    i.kind === 'film' && 
    (searchQuery === '' || i.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const series = items.filter(i => 
    i.kind === 'series' && 
    (searchQuery === '' || i.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredItems = items.filter(item => {
    const matchesFilter = activeFilter === 'all' ? true : item.kind === activeFilter;
    const matchesSearch = searchQuery === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
          <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'bg-black/40 border-white/20 px-3' : 'bg-transparent border-transparent'} border rounded-md h-10`}>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1 hover:text-white/80 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Títulos, pessoas, gêneros"
              className={`bg-transparent border-none outline-none text-sm transition-all duration-300 ${isSearchOpen ? 'w-48 ml-2 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus={isSearchOpen}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-1 hover:text-white transition-colors"
              >
                <X className="w-4 h-4 opacity-40 hover:opacity-100" />
              </button>
            )}
          </div>

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
              height: '80vh', paddingBottom: '8rem',
              background: `
                linear-gradient(to right, #0A0A0A 20%, rgba(10,10,10,0) 100%),
                linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0) 30%),
                url('${featuredItem.bannerUrl || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop'}') center/cover
              `,
            }}
          >
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="rfl-badge-red uppercase tracking-tighter font-black text-[10px]">Destaque</div>
                {featuredItem.year && (
                  <span className="text-xs font-bold text-white/60">{featuredItem.year}</span>
                )}
                {(featuredItem.kind === 'film' ? watchedIds.has(featuredItem.existingId) : (featuredItem.seasons[0]?.episodes[0] ? watchedIds.has(featuredItem.seasons[0].episodes[0].driveFileId) : false)) && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                    <Check className="w-3 h-3" />
                    ASSISTIDO
                  </div>
                )}
              </div>
              <h2 className="font-black mb-4 leading-tight uppercase tracking-tighter" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)' }}>
                {featuredItem.title}
              </h2>
              <p className="text-sm md:text-base mb-8 leading-relaxed line-clamp-3" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '35rem' }}>
                {featuredItem.description || 'Explore os títulos mais recentes e exclusivos sincronizados diretamente do seu Google Drive.'}
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => featuredItem.kind === 'film' ? handlePlay(featuredItem.driveFileId, featuredItem.title) : handlePlay(featuredItem.seasons[0]?.episodes[0]?.driveFileId, `${featuredItem.title} - S01E01`)}
                  className="rfl-btn-primary gap-2 h-12 px-8 text-lg font-bold"
                >
                  <Play className="w-5 h-5 fill-current" /> Assistir
                </button>
                <button
                  onClick={() => setSelectedTitle(featuredItem)}
                  className="rfl-btn-secondary gap-2 h-12 px-6 bg-white/20 hover:bg-white/30 text-white border-none"
                >
                  <Info className="w-5 h-5" /> Mais Informações
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
                        {films.map(item => (
                          <CatalogCard
                            key={item.existingId}
                            item={item}
                            onClick={setSelectedTitle}
                            isWatched={watchedIds.has(item.existingId)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {series.length > 0 && (
                    <section>
                      <h3 className="text-xl font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                        <Clapperboard className="w-5 h-5 text-red-500" /> Séries Exclusivas
                      </h3>
                      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                        {series.map(item => (
                          <CatalogCard
                            key={item.existingId}
                            item={item}
                            onClick={setSelectedTitle}
                            isWatched={item.seasons[0]?.episodes[0] ? watchedIds.has(item.seasons[0].episodes[0].driveFileId) : false}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                  {films.length === 0 && series.length === 0 && searchQuery !== '' && (
                    <div className="py-20 text-center text-white/20">
                      Nenhum título encontrado para "{searchQuery}".
                    </div>
                  )}
                </>
              ) : (
                <section>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                    {activeFilter === 'film' ? <Film className="w-6 h-6 text-red-500" /> : <Clapperboard className="w-6 h-6 text-red-500" />}
                    {activeFilter === 'film' ? 'Todos os Filmes' : 'Todas as Séries'}
                  </h3>
                  <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {filteredItems.map(item => (
                      <CatalogCard
                        key={item.existingId}
                        item={item}
                        onClick={setSelectedTitle}
                        isWatched={item.kind === 'film' ? watchedIds.has(item.existingId) : (item.seasons[0]?.episodes[0] ? watchedIds.has(item.seasons[0].episodes[0].driveFileId) : false)}
                      />
                    ))}
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

      {/* DETAILS MODAL */}
      {selectedTitle && (
        <TitleDetailsModal
          isOpen={!!selectedTitle}
          item={selectedTitle}
          onClose={() => setSelectedTitle(null)}
          onPlay={handlePlay}
          similarTitles={items.filter(i => i.existingId !== selectedTitle.existingId)}
          watchedIds={watchedIds}
          onToggleWatched={toggleWatched}
        />
      )}
    </div>
  );
}
