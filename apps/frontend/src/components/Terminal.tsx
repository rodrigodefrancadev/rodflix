import { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';

export interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
  timestamp: string;
}

interface TerminalProps {
  logs: LogEntry[];
  onClose?: () => void;
  isOpen: boolean;
}

export function Terminal({ logs, onClose, isOpen }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return '#22c55e';
      case 'warn': return '#eab308';
      case 'error': return '#ef4444';
      default: return '#a1a1aa';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-2xl z-[100] rfl-animate-slide-up">
      <div className="rfl-card overflow-hidden flex flex-col h-[400px]" style={{ padding: 0, backgroundColor: 'rgba(10,10,10,0.95)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50">
              <TerminalIcon className="w-3.5 h-3.5" />
              Sincronização em tempo real
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button className="p-1 hover:bg-white/10 rounded transition-colors text-white/30 hover:text-white">
              <Minimize2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1 hover:bg-red-500/20 rounded transition-colors text-white/30 hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LOGS */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1.5 scrollbar-thin scrollbar-thumb-white/10"
          style={{ backgroundColor: '#050505' }}
        >
          {logs.length === 0 && (
            <div className="text-white/20 italic">Aguardando logs...</div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-white/20 select-none">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
              <span style={{ color: getLogColor(log.type) }}>
                {log.type === 'success' && '✔ '}
                {log.type === 'error' && '✖ '}
                {log.type === 'warn' && '⚠ '}
                {log.message}
              </span>
            </div>
          ))}
        </div>
        
        {/* FOOTER */}
        <div className="px-4 py-2 border-t border-white/5 bg-white/2 flex items-center justify-between">
          <div className="text-[10px] text-white/20 uppercase tracking-tighter">
            Rodflix Build System v1.0
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-white/40 uppercase">Conectado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
