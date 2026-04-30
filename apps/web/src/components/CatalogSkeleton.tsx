import { Loader2 } from 'lucide-react';

export function CatalogSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* HERO SKELETON */}
      <div className="relative w-full aspect-[21/9] bg-[#1a1a1a] animate-pulse">
        <div className="absolute bottom-20 left-12 space-y-4 w-1/3">
          <div className="h-16 bg-white/5 rounded-lg w-full" />
          <div className="h-6 bg-white/5 rounded-lg w-3/4" />
          <div className="flex gap-4">
            <div className="h-12 bg-white/10 rounded w-32" />
            <div className="h-12 bg-white/10 rounded w-32" />
          </div>
        </div>
      </div>

      {/* ROWS SKELETON */}
      <div className="px-12 -mt-20 relative z-10 space-y-12 pb-20">
        {[1, 2, 3].map((row) => (
          <div key={row} className="space-y-4">
            <div className="h-8 bg-white/5 rounded w-48 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((card) => (
                <div key={card} className="aspect-video bg-[#1a1a1a] rounded-md animate-pulse">
                   <div className="w-full h-full bg-gradient-to-br from-white/0 to-white/[0.02]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* INITIAL LOADER OVERLAY */}
      <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none">
        <Loader2 className="w-10 h-10 text-white/20 animate-spin mb-4" />
        <p className="text-white/20 font-bold uppercase tracking-widest text-[10px]">Carregando Rodflix...</p>
      </div>
    </div>
  );
}
