import { Play, Plus, Check } from 'lucide-react';
import type { CatalogItem } from '../api/catalog';
import { stringToColor } from '../utils/colors';

type CatalogCardProps = {
  item: CatalogItem;
  onClick: (item: CatalogItem) => void;
  isWatched: boolean;
};

export function CatalogCard({ item, onClick, isWatched }: CatalogCardProps) {
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
