import { useState, useEffect, useRef } from 'react';
import {
  X, Play, ThumbsUp,
  Check, ThumbsDown, Heart, Loader2
} from 'lucide-react';
import { catalogApi, type CatalogItem, type Season, type TitleDetails } from '../api/catalog';

interface TitleDetailsModalProps {
  item: CatalogItem;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (id: string, title: string) => void;
  watchedIds: Set<string>;
  onToggleWatched: (refId: string, kind: 'FILM' | 'EPISODE') => void;
  onSelectSimilar?: (item: CatalogItem) => void;
  rating?: 'LIKE' | 'LOVE' | 'DISLIKE' | null;
  onRate?: (type: 'LIKE' | 'LOVE' | 'DISLIKE' | null) => void;
}

export function TitleDetailsModal({
  item,
  isOpen,
  onClose,
  onPlay,
  watchedIds,
  onToggleWatched,
  onSelectSimilar,
  rating,
  onRate
}: TitleDetailsModalProps) {
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [details, setDetails] = useState<TitleDetails | null>(null);
  const [similarTitles, setSimilarTitles] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRatingMenu, setShowRatingMenu] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Scroll to top when item changes
      modalRef.current?.parentElement?.scrollTo({ top: 0, behavior: 'smooth' });

      const loadData = async () => {
        try {
          setIsLoading(true);
          const [detailsData, similarData] = await Promise.all([
            catalogApi.getDetails(item.existingId),
            catalogApi.getSimilar(item.existingId)
          ]);
          setDetails(detailsData);
          setSimilarTitles(similarData);
          if (detailsData.kind === 'series' && detailsData.seasons) {
            setSelectedSeason(detailsData.seasons[0]);
          }
        } catch (error) {
          console.error('Failed to load title details', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    } else {
      document.body.style.overflow = 'auto';
      setDetails(null);
      setSimilarTitles([]);
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, item.existingId]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handlePlayMain = () => {
    if (item.kind === 'film') {
      onPlay(item.driveFileId, item.title);
    } else {
      const seriesSeasons = details?.seasons || (item.kind === 'series' ? item.seasons : []);
      const firstEp = selectedSeason?.episodes[0] || seriesSeasons[0]?.episodes[0];
      if (firstEp) {
        onPlay(firstEp.driveFileId, `${item.title} - S${String(selectedSeason?.number || 1).padStart(2, '0')}E${String(firstEp.order).padStart(2, '0')}`);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto pt-10 pb-20 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-[#181818] rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        style={{ minHeight: '80vh' }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[110] p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* HERO / BANNER */}
        <div className="relative aspect-video w-full">
          <img
            src={item.bannerUrl || item.posterUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/30" />

          <div className="absolute bottom-10 left-12 right-12">
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter drop-shadow-lg">{item.title}</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayMain}
                className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded hover:bg-white/90 transition-colors"
              >
                <Play className="w-6 h-6 fill-black" />
                Assistir
              </button>

              {/* Botão Marcar como Visto/Não Visto */}
              <button
                onClick={() => onToggleWatched(item.kind === 'film' ? item.existingId : (selectedSeason?.episodes[0]?.driveFileId || ''), item.kind === 'film' ? 'FILM' : 'EPISODE')}
                className="flex flex-col items-center gap-1 min-w-[90px] p-2 rounded hover:bg-white/10 transition-colors group/watch"
              >
                <div className={`p-2 rounded-full border transition-colors ${watchedIds.has(item.kind === 'film' ? item.existingId : (selectedSeason?.episodes[0]?.driveFileId || '')) ? 'bg-green-600 border-green-500 text-white' : 'border-white/40 text-white opacity-40 group-hover/watch:opacity-100'}`}>
                  <Check className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tighter transition-opacity ${watchedIds.has(item.kind === 'film' ? item.existingId : (selectedSeason?.episodes[0]?.driveFileId || '')) ? 'text-green-500' : 'opacity-50 group-hover/watch:opacity-100'}`}>
                  {watchedIds.has(item.kind === 'film' ? item.existingId : (selectedSeason?.episodes[0]?.driveFileId || '')) ? 'Assistido' : 'Marcar visto'}
                </span>
              </button>

              {/* Botão Avaliar */}
              <div className="relative">
                <button
                  onClick={() => setShowRatingMenu(!showRatingMenu)}
                  className="flex flex-col items-center gap-1 min-w-[90px] p-2 rounded hover:bg-white/10 transition-colors group/rating"
                >
                  <div className={`p-2 rounded-full border transition-colors backdrop-blur-md ${rating ? 'bg-white text-black border-white' : 'border-white/40 text-white opacity-40 group-hover/rating:opacity-100'}`}>
                    {rating === 'LIKE' && <ThumbsUp className="w-5 h-5 fill-black" />}
                    {rating === 'LOVE' && <Heart className="w-5 h-5 fill-red-500 text-red-500" />}
                    {rating === 'DISLIKE' && <ThumbsDown className="w-5 h-5 fill-black" />}
                    {!rating && <ThumbsUp className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-tighter transition-opacity ${rating ? 'text-white' : 'opacity-50 group-hover/rating:opacity-100'}`}>
                    {!rating ? 'Avaliar' : (rating === 'LIKE' ? 'Gostei' : (rating === 'LOVE' ? 'Amei' : 'Não Gostei'))}
                  </span>
                </button>

                {showRatingMenu && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-[#2b2b2b] p-2 rounded-2xl flex items-center gap-2 shadow-xl animate-in slide-in-from-bottom-2 fade-in">
                    <button
                      onClick={() => { onRate?.(rating === 'DISLIKE' ? null : 'DISLIKE'); setShowRatingMenu(false); }}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors hover:bg-white/10 group/dislike"
                    >
                      <div className={`p-2 rounded-full transition-transform group-hover/dislike:scale-110 ${rating === 'DISLIKE' ? 'bg-white text-black' : 'text-white/50'}`}>
                        <ThumbsDown className={`w-6 h-6 ${rating === 'DISLIKE' ? 'fill-black' : ''}`} />
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-tight ${rating === 'DISLIKE' ? 'text-white' : 'text-white/40'}`}>Não Gostei</span>
                    </button>

                    <button
                      onClick={() => { onRate?.(rating === 'LIKE' ? null : 'LIKE'); setShowRatingMenu(false); }}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors hover:bg-white/10 group/like"
                    >
                      <div className={`p-2 rounded-full transition-transform group-hover/like:scale-110 ${rating === 'LIKE' ? 'bg-white text-black' : 'text-white/50'}`}>
                        <ThumbsUp className={`w-6 h-6 ${rating === 'LIKE' ? 'fill-black' : ''}`} />
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-tight ${rating === 'LIKE' ? 'text-white' : 'text-white/40'}`}>Gostei</span>
                    </button>

                    <button
                      onClick={() => { onRate?.(rating === 'LOVE' ? null : 'LOVE'); setShowRatingMenu(false); }}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors hover:bg-white/10 group/love"
                    >
                      <div className={`p-2 rounded-full transition-transform group-hover/love:scale-110 ${rating === 'LOVE' ? 'bg-white' : 'text-white/50'}`}>
                        <Heart className={`w-6 h-6 ${rating === 'LOVE' ? 'fill-red-500 text-red-500' : ''}`} />
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-tight ${rating === 'LOVE' ? 'text-white' : 'text-white/40'}`}>Amei</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-12 py-8 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-white/20 animate-spin" />
              <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Carregando detalhes...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                {/* LEFT: Info */}
                <div className="md:col-span-2 space-y-6">
                  <div className="flex items-center gap-3 text-sm font-bold">
                    {details?.ageRating && (
                      <span className={`px-1.5 py-0.5 border text-[10px] rounded ${details.ageRating === 'L' ? 'bg-green-600 border-green-500' :
                        details.ageRating === '10' ? 'bg-blue-600 border-blue-500' :
                          details.ageRating === '12' ? 'bg-yellow-600 border-yellow-500' :
                            details.ageRating === '14' ? 'bg-orange-600 border-orange-500' :
                              details.ageRating === '16' ? 'bg-red-600 border-red-500' :
                                'bg-black border-white/40'
                        }`}>
                        {details.ageRating}
                      </span>
                    )}
                    <span>{details?.year || item.year}</span>
                    {details?.duration && <span>{details.duration}</span>}
                    <span className="px-1.5 py-0.5 border border-white/40 text-[10px] rounded tracking-widest">HD</span>
                  </div>

                  <p className="text-lg leading-relaxed text-white/90">
                    {details?.description || item.description || 'Nenhuma descrição disponível para este título.'}
                  </p>
                </div>

                {/* RIGHT: Cast/Details */}
                <div className="text-sm space-y-4">
                  {details?.cast && (
                    <div>
                      <span className="text-white/40">Elenco: </span>
                      <span className="text-white/80">{details.cast}</span>
                    </div>
                  )}
                  {details?.director && (
                    <div>
                      <span className="text-white/40">Direção: </span>
                      <span className="text-white/80">{details.director}</span>
                    </div>
                  )}
                  {details?.genres && (
                    <div>
                      <span className="text-white/40">Gêneros: </span>
                      <span className="text-white/80">{details.genres}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* EPISODES (for series) */}
              {item.kind === 'series' && (
                <div className="pb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">Episódios</h3>
                    <select
                      value={selectedSeason?.number}
                      onChange={(e) => {
                        const seriesSeasons = details?.seasons || item.seasons;
                        setSelectedSeason(seriesSeasons.find(s => s.number === Number(e.target.value)) || null);
                      }}
                      className="bg-[#242424] border border-white/20 px-4 py-2 rounded text-sm font-bold focus:outline-none"
                    >
                      {(details?.seasons || item.seasons).map(s => (
                        <option key={s.number} value={s.number}>Temporada {s.number}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    {selectedSeason?.episodes.map((ep, i) => (
                      <div
                        key={i}
                        onClick={() => onPlay(ep.driveFileId, `${item.title} - S${String(selectedSeason.number).padStart(2, '0')}E${String(ep.order).padStart(2, '0')}`)}
                        className="group flex items-center gap-6 p-4 rounded-lg hover:bg-[#333] transition-colors cursor-pointer border-b border-white/5"
                      >
                        <span className="text-2xl font-bold text-white/40 group-hover:text-white w-8 text-center">{ep.order}</span>
                        <div className="relative w-40 aspect-video rounded overflow-hidden bg-white/5">
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
                            <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold">{ep.title || `Episódio ${ep.order}`}</h4>
                            <span className="text-sm text-white/40">45m</span>
                          </div>
                          <p className="text-xs text-white/40 line-clamp-2">
                            Sinopse do episódio não disponível. Assista agora para descobrir o que acontece nesta emocionante jornada.
                          </p>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWatched(ep.driveFileId, 'EPISODE');
                            }}
                            className="flex flex-col items-center gap-1 min-w-[70px] group/btn"
                          >
                            <div className={`p-1.5 rounded-full border transition-colors ${watchedIds.has(ep.driveFileId) ? 'bg-green-600 border-green-500 text-white' : 'border-white/20 text-white/40 group-hover/btn:text-white group-hover/btn:border-white/60'}`}>
                              <Check className={`w-3.5 h-3.5 ${watchedIds.has(ep.driveFileId) ? 'opacity-100' : 'opacity-20 group-hover/btn:opacity-100'}`} />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 group-hover/btn:opacity-100">
                              {watchedIds.has(ep.driveFileId) ? 'Visto' : 'Ver'}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SIMILAR TITLES */}
              {similarTitles.length > 0 && (
                <div className="pb-12">
                  <h3 className="text-2xl font-bold mb-6">Títulos Semelhantes</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {similarTitles.map((similar) => (
                      <div
                        key={similar.existingId}
                        onClick={() => {
                          if (onSelectSimilar) {
                            onSelectSimilar(similar);
                          } else {
                            onClose();
                          }
                        }}
                        className="bg-[#2f2f2f] rounded overflow-hidden group cursor-pointer hover:bg-[#3f3f3f] transition-colors"
                      >
                        <div className="aspect-video relative">
                          <img src={similar.bannerUrl || similar.posterUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold truncate max-w-[80%]">{similar.title}</span>
                            <span className="text-xs text-white/40">{similar.year}</span>
                          </div>
                          <p className="text-[10px] text-white/60 line-clamp-3">
                            {similar.description || 'Se você gostou deste título, certamente vai se interessar por esta recomendação exclusiva.'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
