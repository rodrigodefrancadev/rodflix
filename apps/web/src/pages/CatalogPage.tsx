import { useState, useEffect } from 'react';
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
import { useSearchParams } from 'react-router-dom';
import { notificationApi, type Notification } from '../api/notification';

import { CatalogCard } from '../components/CatalogCard';
import { CatalogHeader } from '../components/CatalogHeader';
import { CatalogHero } from '../components/CatalogHero';
import { Footer } from '../components/Footer';
import { CatalogSkeleton } from '../components/CatalogSkeleton';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  useEffect(() => {
    notificationApi.getActive().then(notification => {
      if (notification) {
        setActiveNotification(notification);
      }
    }).catch(console.error);
  }, []);

  const handleMarkNotificationSeen = async () => {
    if (activeNotification) {
      try {
        await notificationApi.markSeen(activeNotification.id);
        setActiveNotification(null);
      } catch (err) {
        console.error('Failed to mark notification as seen', err);
      }
    }
  };

  // Sync selectedTitle with URL
  useEffect(() => {
    const titleId = searchParams.get('title');
    if (titleId && !isLoading) {
      const found = films.find(i => i.existingId === titleId) || series.find(i => i.existingId === titleId);
      if (found) {
        setSelectedTitle(found);
      } else {
        // If not found in current list (maybe search is active), we could fetch it, 
        // but for now let's just clear the param or wait.
      }
    } else if (!titleId) {
      setSelectedTitle(null);
    }
  }, [searchParams.get('title'), isLoading, films, series]);

  const handleSelectTitle = (item: CatalogItem | null) => {
    if (item) {
      setSearchParams({ title: item.existingId }, { replace: false });
    } else {
      searchParams.delete('title');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const handlePlay = (id: string, title: string) => {
    setPlayingVideo({ id, title });
  };

  if (isLoading) return <CatalogSkeleton />;

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
              setSelectedTitle={handleSelectTitle}
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
                        onClick={handleSelectTitle}
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
                                onClick={handleSelectTitle}
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
                                onClick={handleSelectTitle}
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
                            onClick={handleSelectTitle}
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
        </div>
      </main>

      {/* FOOTER */}
      <Footer />

      {/* DETAILS MODAL */}
      {selectedTitle && (
        <TitleDetailsModal
          isOpen={!!selectedTitle}
          item={selectedTitle}
          onClose={() => handleSelectTitle(null)}
          onPlay={handlePlay}
          watchedIds={watchedIds}
          onToggleWatched={toggleWatched}
          onSelectSimilar={handleSelectTitle}
          rating={ratings[selectedTitle.existingId] || null}
          onRate={(type) => handleRate(selectedTitle.existingId, type)}
        />
      )}

      {/* NOTIFICATION ALERT */}
      {activeNotification && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 px-4 rfl-animate-fade-in">
          <div className="bg-[#141414] rounded-2xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(229,9,20,0.15)] border border-white/10 rfl-animate-slide-up text-center">
            <h2 className="text-3xl font-black mb-4 uppercase tracking-wider text-white">
              {activeNotification.title}
            </h2>
            <div className="w-16 h-1 bg-red-600 mx-auto mb-6 rounded-full"></div>
            <p className="text-white/80 text-lg leading-relaxed mb-8 whitespace-pre-wrap">
              {activeNotification.content}
            </p>
            <button
              onClick={handleMarkNotificationSeen}
              className="rfl-btn-primary w-full text-lg py-4 shadow-lg shadow-red-500/20"
            >
              Estou ciente. Não mostrar mais.
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
