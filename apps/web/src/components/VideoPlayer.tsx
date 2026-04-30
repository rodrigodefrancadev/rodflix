import { X, ArrowLeft } from 'lucide-react';

interface VideoPlayerProps {
  fileId: string;
  title: string;
  onClose: () => void;
}

export function VideoPlayer({ fileId, title, onClose }: VideoPlayerProps) {
  // Using Google Drive's native preview iframe as requested
  const iframeUrl = `https://drive.google.com/file/d/${fileId}/preview`;

  return (
    <div className="fixed inset-0 z-[101] bg-black flex flex-col rfl-animate-fade-in">
      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-10 p-6 flex items-center justify-between transition-opacity duration-300 hover:opacity-100 opacity-40 hover:bg-black/60"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="rfl-btn-ghost p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold tracking-tight">{title}</span>
        </div>
        <button onClick={onClose} className="rfl-btn-ghost p-2">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* IFRAME CONTAINER */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <iframe
          src={iframeUrl}
          className="w-full h-full border-none"
          title={title}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  );
}
