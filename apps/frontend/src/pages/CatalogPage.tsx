import { useState } from 'react';
import {
  Film,
  Search,
  Clapperboard,
  RefreshCw,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import type { CatalogItem } from '../api/catalog';
import { VideoPlayer } from '../components/VideoPlayer';
import { TitleDetailsModal } from '../components/TitleDetailsModal';

import { CatalogCard } from '../components/CatalogCard';
import { CatalogHeader } from '../components/CatalogHeader';
import { CatalogHero } from '../components/CatalogHero';
import { Footer } from '../components/Footer';
import { isItemWatched } from '../utils/catalog';

export function CatalogPage() {
  const { user, logout, isAdmin } = useAuth();
  const {
    isLoading,
    isSyncing,
    activeFilter,
    watchedIds,
    searchQuery,
    handleSync,
    toggleWatched,
    films,
    series,
    filteredItems,
    featuredItem,
    ratings,
    handleRate,
  } = useCatalog();

  // Local UI states
  const [playingVideo, setPlayingVideo] = useState<{ id: string; title: string } | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<CatalogItem | null>(null);

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
      <CatalogHeader
        isAdmin={isAdmin}
        user={user}
        logout={logout}
      />

      <main>
        {/* HERO */}
        {searchQuery.trim() === '' && (
          featuredItem ? (
            <CatalogHero
              featuredItem={featuredItem}
              watchedIds={watchedIds}
              handlePlay={handlePlay}
              setSelectedTitle={setSelectedTitle}
            />
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
          )
        )}

        <div className={`px-6 ${searchQuery.trim() === '' ? '-mt-16' : 'pt-24'} relative z-10 space-y-12`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
            </div>
          ) : (
            <>
              {searchQuery.trim() !== '' ? (
                <section className="rfl-animate-fade-in">
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <Search className="w-6 h-6 text-red-500" />
                    Resultados para "{searchQuery}"
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-6">
                    {filteredItems.map(item => (
                      <CatalogCard
                        key={item.existingId}
                        item={item}
                        onClick={setSelectedTitle}
                        isWatched={isItemWatched(item, watchedIds)}
                      />
                    ))}
                  </div>
                  {filteredItems.length === 0 && (
                    <div className="py-20 text-center text-white/20">
                      Nenhum título encontrado para "{searchQuery}".
                    </div>
                  )}
                </section>
              ) : (
                <>
                  {/* IF FILTERED OR ALL */}
                  {activeFilter === 'all' ? (
                    <>
                      {films.length > 0 && (
                        <section>
                          <h3 className="text-xl font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                            <Film className="w-5 h-5 text-red-500" /> Catálogo
                          </h3>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
                            {films.map(item => (
                              <CatalogCard
                                key={item.existingId}
                                item={item}
                                onClick={setSelectedTitle}
                                isWatched={isItemWatched(item, watchedIds)}
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
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
                            {series.map(item => (
                              <CatalogCard
                                key={item.existingId}
                                item={item}
                                onClick={setSelectedTitle}
                                isWatched={isItemWatched(item, watchedIds)}
                              />
                            ))}
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
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-6">
                        {filteredItems.map(item => (
                          <CatalogCard
                            key={item.existingId}
                            item={item}
                            onClick={setSelectedTitle}
                            isWatched={isItemWatched(item, watchedIds)}
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
            </>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <Footer />

      {/* DETAILS MODAL */}
      {selectedTitle && (
        <TitleDetailsModal
          isOpen={!!selectedTitle}
          item={selectedTitle}
          onClose={() => setSelectedTitle(null)}
          onPlay={handlePlay}
          watchedIds={watchedIds}
          onToggleWatched={toggleWatched}
          onSelectSimilar={setSelectedTitle}
          rating={ratings[selectedTitle.existingId] || null}
          onRate={(type) => handleRate(selectedTitle.existingId, type)}
        />
      )}
    </div>
  );
}
