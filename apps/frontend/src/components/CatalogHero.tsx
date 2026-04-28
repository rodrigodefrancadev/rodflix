import { Play, Info, Check } from 'lucide-react';
import type { CatalogItem } from '../api/catalog';
import { isItemWatched } from '../utils/catalog';

type CatalogHeroProps = {
  featuredItem: CatalogItem;
  watchedIds: Set<string>;
  handlePlay: (id: string, title: string) => void;
  setSelectedTitle: (item: CatalogItem) => void;
};

export function CatalogHero({
  featuredItem,
  watchedIds,
  handlePlay,
  setSelectedTitle,
}: CatalogHeroProps) {
  const isWatched = isItemWatched(featuredItem, watchedIds);

  const onPlayClick = () => {
    if (featuredItem.kind === 'film') {
      handlePlay(featuredItem.driveFileId, featuredItem.title);
    } else if (featuredItem.kind === 'series' && featuredItem.seasons[0]?.episodes[0]) {
      handlePlay(featuredItem.seasons[0].episodes[0].driveFileId, `${featuredItem.title} - S01E01`);
    }
  };

  return (
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
          {featuredItem.year && (
            <span className="text-xs font-bold text-white/60">{featuredItem.year}</span>
          )}
          {isWatched && (
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
            onClick={onPlayClick}
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
  );
}
