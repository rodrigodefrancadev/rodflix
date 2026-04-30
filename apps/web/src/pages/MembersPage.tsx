import { useState, useEffect } from 'react';
import { socialApi } from '../api/social';
import type { MemberSummary } from '../api/social';
import { Loader2, Users, Calendar, Play, UserCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function MembersPage() {
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await socialApi.getMembers();
        setMembers(data);
      } catch (error) {
        console.error('Failed to load members', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMembers();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <p className="text-white/40 font-medium tracking-widest uppercase text-xs">Carregando membros...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/catalog')}
          className="flex items-center gap-2 text-white/40 hover:text-red-600 transition-all font-bold uppercase tracking-widest text-xs mb-8 group"
        >
          <div className="p-2 bg-white/5 rounded-full group-hover:bg-red-600/20 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Voltar para o Catálogo
        </button>

        <header className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
            <Users className="w-10 h-10 text-red-600" />
            Comunidade Rodflix
          </h1>
          <p className="text-white/40 mt-2 max-w-xl">
            Conheça os entusiastas do cinema que fazem parte da nossa rede exclusiva.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members.map((member) => (
            <div 
              key={member.id}
              className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden hover:border-red-600/50 transition-all duration-500 group"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  {member.avatarUrl ? (
                    <img 
                      src={member.avatarUrl} 
                      alt={member.name} 
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/5 group-hover:ring-red-600/30 transition-all"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-900/40 flex items-center justify-center ring-2 ring-white/5 group-hover:ring-red-600/30 transition-all">
                      <UserCircle className="w-8 h-8 text-red-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-bold text-lg group-hover:text-red-500 transition-colors">{member.name}</h2>
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                      member.role === 'ADMIN' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/60'
                    }`}>
                      {member.role === 'ADMIN' ? 'Administrador' : 'Membro'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-white/40 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Membro há {formatDistanceToNow(new Date(member.createdAt), { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/40 text-sm">
                    <Play className="w-4 h-4" />
                    <span>{member.watchedCount} títulos assistidos</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/profile/${member.id}`)}
                  className="w-full bg-white/5 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all duration-300 uppercase tracking-widest text-xs"
                >
                  Ver Perfil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
