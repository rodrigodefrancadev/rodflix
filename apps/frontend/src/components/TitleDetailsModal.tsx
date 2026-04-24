import { useState, useEffect, useRef } from 'react';
import {
  X, Play, Plus, ThumbsUp, Share2,
  ChevronDown, Info, Calendar, Clock,
  PlayCircle, Download, Check, ThumbsDown, Heart
} from 'lucide-react';
import type { CatalogItem, Season, Episode } from '../api/catalog';

interface TitleDetailsModalProps {
  item: CatalogItem;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (id: string, title: string) => void;
  similarTitles?: CatalogItem[];
  watchedIds: Set<string>;
  onToggleWatched: (refId: string, kind: 'FILM' | 'EPISODE') => void;
  onSelectSimilar?: (item: CatalogItem) => void;
  rating?: 'LIKE' | 'LOVE' | 'DISLIKE' | null;
  onRate?: (type: 'LIKE' | 'LOVE' | 'DISLIKE' | null) => void;
}

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZjljNDAwZWRlZjBhMGZlN2JiODQyZGU4ZTI1NThkNiIsIm5iZiI6MTc3NjkxNDY1MC4yMjIwMDAxLCJzdWIiOiI2OWU5OTBkYWYxY2FjNTY1OTIzMzQyN2MiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Yvw1EDk5G2eDeLq_o4ENx7h3PHWzpIsKvZ6bT8Tdzc0';

/**
 * Normalize international age ratings to Brazilian CLASSIND standard.
 * CLASSIND: L, 10, 12, 14, 16, 18
 */
function normalizeCertification(cert: string | null): string | null {
  if (!cert) return null;

  // Already in CLASSIND format
  const classind = ['L', '10', '12', '14', '16', '18'];
  if (classind.includes(cert)) return cert;

  const map: Record<string, string> = {
    // MPAA (US)
    'G': 'L',
    'PG': '10',
    'PG-13': '12',
    'R': '16',
    'NC-17': '18',
    'NR': 'L',
    'UR': 'L',
    // UK BBFC
    'U': 'L',
    '12': '12',
    '12A': '12',
    '15': '14',
    '18': '18',
    'R18': '18',
    // Numeric generics
    '0': 'L',
    '6': 'L',
    '7': 'L',
    '8': '10',
    '9': '10',
    '11': '12',
    '13': '12',
    '17': '16',
  };

  return map[cert] ?? cert;
}

function getGenreIds(tmdbData: any): number[] {
  if (!tmdbData) return [];
  if (Array.isArray(tmdbData.genre_ids)) return tmdbData.genre_ids;
  if (Array.isArray(tmdbData.genres)) return tmdbData.genres.map((g: any) => g.id);
  return [];
}

export function TitleDetailsModal({
  item,
  isOpen,
  onClose,
  onPlay,
  similarTitles = [],
  watchedIds,
  onToggleWatched,
  onSelectSimilar,
  rating,
  onRate
}: TitleDetailsModalProps) {
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(
    item.kind === 'series' ? item.seasons[0] : null
  );
  const [fullTmdb, setFullTmdb] = useState<any>(item.tmdbRaw || null);
  const [showRatingMenu, setShowRatingMenu] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (item.kind === 'series') setSelectedSeason(item.seasons[0]);
      setFullTmdb(item.tmdbRaw || null);
      
      // Scroll to top when item changes
      modalRef.current?.parentElement?.scrollTo({ top: 0, behavior: 'smooth' });

      // Fetch full details from TMDB if we have an id but no credits yet
      const tmdbId = item.tmdbRaw?.id;
      const hasCredits = !!item.tmdbRaw?.credits;
      if (tmdbId && !hasCredits) {
        const endpoint = item.kind === 'film' ? `movie/${tmdbId}` : `tv/${tmdbId}`;
        const appendTo = item.kind === 'film' ? 'credits,release_dates' : 'credits,content_ratings';
        fetch(`https://api.themoviedb.org/3/${endpoint}?language=pt-BR&append_to_response=${appendTo}`, {
          headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: 'application/json' },
        })
          .then(r => r.json())
          .then(data => setFullTmdb((prev: any) => ({ ...prev, ...data })))
          .catch(() => {/* silent */ });
      }
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, item]);

  if (!isOpen) return null;

  // Extract extra metadata from fullTmdb
  const cast = fullTmdb?.credits?.cast?.slice(0, 5).map((c: any) => c.name).join(', ') || null;
  const director = fullTmdb?.credits?.crew?.find((c: any) => c.job === 'Director')?.name
    || fullTmdb?.created_by?.[0]?.name
    || null;
  const genres = fullTmdb?.genres?.map((g: any) => g.name).join(' • ') || null;
  const tmdbRating = fullTmdb?.vote_average ? fullTmdb.vote_average.toFixed(1) : null;
  const duration = fullTmdb?.runtime
    ? `${Math.floor(fullTmdb.runtime / 60)}h ${fullTmdb.runtime % 60}m`
    : null;

  // Age certification: look for BR first, fallback US, then normalize to CLASSIND
  const ageCert: string | null = (() => {
    if (item.kind === 'film') {
      const results = fullTmdb?.release_dates?.results ?? [];
      const brEntry = results.find((r: any) => r.iso_3166_1 === 'BR');
      const usEntry = results.find((r: any) => r.iso_3166_1 === 'US');
      const raw = brEntry?.release_dates?.[0]?.certification
        || usEntry?.release_dates?.[0]?.certification
        || null;
      return normalizeCertification(raw);
    } else {
      const results = fullTmdb?.content_ratings?.results ?? [];
      const brEntry = results.find((r: any) => r.iso_3166_1 === 'BR');
      const usEntry = results.find((r: any) => r.iso_3166_1 === 'US');
      const raw = brEntry?.rating || usEntry?.rating || null;
      return normalizeCertification(raw);
    }
  })();

  const currentGenreIds = getGenreIds(item.tmdbRaw);
  const rankedSimilarTitles = similarTitles
    .map(similar => {
      const similarGenreIds = getGenreIds(similar.tmdbRaw);
      const score = similarGenreIds.reduce((acc: number, id: number) => {
        return acc + (currentGenreIds.includes(id) ? 1 : 0);
      }, 0);
      return { similar, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handlePlayMain = () => {
    if (item.kind === 'film') {
      onPlay(item.driveFileId, item.title);
    } else {
      const firstEp = selectedSeason?.episodes[0] || item.seasons[0]?.episodes[0];
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
              <div className="relative" onMouseLeave={() => setShowRatingMenu(false)}>
                <button 
                  onMouseEnter={() => setShowRatingMenu(true)}
                  onClick={() => setShowRatingMenu(!showRatingMenu)}
                  className={`flex items-center justify-center w-12 h-12 rounded-full border transition-colors backdrop-blur-md ${rating ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                >
                  {rating === 'LIKE' && <ThumbsUp className="w-5 h-5 fill-black" />}
                  {rating === 'LOVE' && <Heart className="w-5 h-5 fill-red-500 text-red-500" />}
                  {rating === 'DISLIKE' && <ThumbsDown className="w-5 h-5 fill-black" />}
                  {!rating && <ThumbsUp className="w-5 h-5" />}
                </button>

                {showRatingMenu && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-[#2b2b2b] p-1.5 rounded-full flex items-center gap-1 shadow-xl animate-in slide-in-from-bottom-2 fade-in">
                    <button 
                      onClick={() => { onRate?.('DISLIKE'); setShowRatingMenu(false); }}
                      className={`p-3 rounded-full transition-transform hover:scale-110 hover:bg-white/10 ${rating === 'DISLIKE' ? 'text-white' : 'text-white/50'}`}
                      title="Não Gostei"
                    >
                      <ThumbsDown className={`w-6 h-6 ${rating === 'DISLIKE' ? 'fill-white' : ''}`} />
                    </button>
                    <button 
                      onClick={() => { onRate?.('LIKE'); setShowRatingMenu(false); }}
                      className={`p-3 rounded-full transition-transform hover:scale-110 hover:bg-white/10 ${rating === 'LIKE' ? 'text-white' : 'text-white/50'}`}
                      title="Gostei"
                    >
                      <ThumbsUp className={`w-6 h-6 ${rating === 'LIKE' ? 'fill-white' : ''}`} />
                    </button>
                    <button 
                      onClick={() => { onRate?.('LOVE'); setShowRatingMenu(false); }}
                      className={`p-3 rounded-full transition-transform hover:scale-110 hover:bg-white/10 ${rating === 'LOVE' ? 'text-red-500' : 'text-white/50'}`}
                      title="Gostei Muito"
                    >
                      <Heart className={`w-6 h-6 ${rating === 'LOVE' ? 'fill-red-500' : ''}`} />
                    </button>
                    {rating && (
                       <div className="w-px h-6 bg-white/20 mx-1"></div>
                    )}
                    {rating && (
                      <button 
                        onClick={() => { onRate?.(null); setShowRatingMenu(false); }}
                        className="p-2 rounded-full transition-transform hover:scale-110 hover:bg-white/10 text-white/50"
                        title="Remover Avaliação"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-12 py-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* LEFT: Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3 text-sm font-bold">
              {ageCert && <span className="px-1.5 py-0.5 border border-white/40 text-[10px] rounded">{ageCert}</span>}
              {item.year && <span>{item.year}</span>}
              {duration && <span>{duration}</span>}
              <span className="px-1.5 py-0.5 border border-white/40 text-[10px] rounded tracking-widest">HD</span>
            </div>

            <p className="text-lg leading-relaxed text-white/90">
              {item.description || 'Nenhuma descrição disponível para este título.'}
            </p>
          </div>

          {/* RIGHT: Cast/Details */}
          <div className="text-sm space-y-4">
            {cast && (
              <div>
                <span className="text-white/40">Elenco: </span>
                <span className="text-white/80">{cast}</span>
              </div>
            )}
            {director && (
              <div>
                <span className="text-white/40">Direção: </span>
                <span className="text-white/80">{director}</span>
              </div>
            )}
            {genres && (
              <div>
                <span className="text-white/40">Gêneros: </span>
                <span className="text-white/80">{genres}</span>
              </div>
            )}
          </div>
        </div>

        {/* EPISODES (for series) */}
        {item.kind === 'series' && (
          <div className="px-12 pb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Episódios</h3>
              <select
                value={selectedSeason?.number}
                onChange={(e) => setSelectedSeason(item.seasons.find(s => s.number === Number(e.target.value)) || null)}
                className="bg-[#242424] border border-white/20 px-4 py-2 rounded text-sm font-bold focus:outline-none"
              >
                {item.seasons.map(s => (
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
                    {/* Placeholder for episode thumbnail */}
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
        <div className="px-12 pb-12">
          <h3 className="text-2xl font-bold mb-6">Títulos Semelhantes</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {rankedSimilarTitles.map(({ similar, score }) => (
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
                  <div className="absolute top-2 right-2 text-xs font-bold px-1 bg-black/40 rounded">HD</div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-green-500">{similar.title}</span>
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
      </div>
    </div>
  );
}
