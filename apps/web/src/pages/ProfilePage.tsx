import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { socialApi } from '../api/social';
import type { UserProfile } from '../api/social';
import { 
  Loader2, Calendar, Play, UserCircle, ArrowLeft, 
  ThumbsUp, Heart, ThumbsDown, Clapperboard, Film
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCatalog } from '../contexts/CatalogContext';
import { TitleDetailsModal } from '../components/TitleDetailsModal';
import { VideoPlayer } from '../components/VideoPlayer';
import type { CatalogItem } from '../api/catalog';

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const {
    items,
    watchedIds,
    toggleWatched,
    ratings,
    handleRate,
  } = useCatalog();

  const [selectedTitle, setSelectedTitle] = useState<CatalogItem | null>(null);
  const [playingVideo, setPlayingVideo] = useState<{ id: string; title: string } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const titleId = searchParams.get('title');
    if (titleId && items.length > 0) {
      const found = items.find(i => i.existingId === titleId);
      if (found) setSelectedTitle(found);
    } else if (!titleId) {
      setSelectedTitle(null);
    }
  }, [searchParams.get('title'), items]);

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

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      try {
        const data = await socialApi.getProfile(userId);
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Usuário não encontrado</h1>
        <button onClick={() => navigate('/members')} className="text-red-600 hover:underline">
          Voltar para membros
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* HEADER BACKGROUND */}
      <div className="h-64 w-full bg-gradient-to-b from-red-900/20 to-[#0A0A0A] relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-24 left-6 md:left-12 p-3 bg-black/40 backdrop-blur-xl rounded-full hover:bg-red-600 transition-all z-20"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10">
        {/* PROFILE HEADER */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
          <div className="relative group">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className="w-48 h-48 rounded-[40px] object-cover ring-8 ring-[#0A0A0A] shadow-2xl"
              />
            ) : (
              <div className="w-48 h-48 rounded-[40px] bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center ring-8 ring-[#0A0A0A] shadow-2xl">
                <UserCircle className="w-24 h-24 text-white/50" />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-red-600 p-3 rounded-2xl shadow-xl">
               {profile.role === 'ADMIN' ? <Heart className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left pb-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
              <h1 className="text-5xl font-black tracking-tighter uppercase">{profile.name}</h1>
              <span className="bg-white/10 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white/60">
                {profile.role}
              </span>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-6 text-white/40 font-medium mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Entrou em {format(new Date(profile.createdAt), "MMMM 'de' yyyy", { locale: ptBR })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                <span>{profile.watchedCount} títulos</span>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="text-lg text-white/60 leading-relaxed italic">
                {profile.bio || "Este membro ainda não adicionou uma bio ao seu perfil."}
              </p>
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <section className="mb-20">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
            <Play className="w-6 h-6 text-red-600" />
            Atividade Recente
          </h2>

          <div className="space-y-4">
            {profile.activity.length === 0 && (
              <div className="bg-[#141414] rounded-2xl p-12 text-center text-white/20 border border-white/5">
                Nenhuma atividade registrada ainda.
              </div>
            )}
            
            {profile.activity.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleSelectTitle({ existingId: item.catalogItemId } as CatalogItem)}
                className="bg-[#141414] border border-white/5 rounded-2xl p-4 md:p-6 flex items-center gap-6 hover:bg-white/[0.02] transition-all group cursor-pointer"
              >
                {/* POSTER / ICON */}
                <div className="w-16 h-24 md:w-20 md:h-28 flex-shrink-0 relative overflow-hidden rounded-lg bg-[#1a1a1a]">
                  {item.posterUrl ? (
                    <img 
                      src={item.posterUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      item.kind === 'series' ? 'bg-blue-600/20 text-blue-500' : 'bg-red-600/20 text-red-500'
                    }`}>
                      {item.kind === 'series' ? <Clapperboard className="w-8 h-8" /> : <Film className="w-8 h-8" />}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold group-hover:text-red-500 transition-colors">{item.title}</h3>
                    {item.rating === 'LIKE' && <ThumbsUp className="w-4 h-4 text-green-500" />}
                    {item.rating === 'LOVE' && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
                    {item.rating === 'DISLIKE' && <ThumbsDown className="w-4 h-4 text-gray-500" />}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-white/40">
                    <span className="uppercase font-black text-[10px] tracking-widest">
                      {item.kind === 'series' ? 'Série' : 'Filme'}
                    </span>
                    <span>•</span>
                    <span>{format(new Date(item.watchedAt), "dd 'de' MMM, HH:mm", { locale: ptBR })}</span>
                  </div>
                </div>

                {item.kind === 'series' && item.episodesWatched && item.totalEpisodes && (
                  <div className="text-right">
                    <div className="text-2xl font-black text-red-600">
                      {item.episodesWatched}<span className="text-white/20 text-lg">/{item.totalEpisodes}</span>
                    </div>
                    <div className="text-[10px] uppercase font-black text-white/40 tracking-tighter">
                      Episódios
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* PLAYER MODAL */}
      {playingVideo && (
        <VideoPlayer
          fileId={playingVideo.id}
          title={playingVideo.title}
          onClose={() => setPlayingVideo(null)}
        />
      )}

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
    </div>
  );
}
