import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Shield, 
  ShieldAlert, 
  ChevronLeft,
  User as UserIcon,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { adminApi } from '../api/admin';
import type { User } from '../api/admin';

export function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncStatus, setSyncStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveUser(id);
      loadUsers();
    } catch (error) {
      console.error('Failed to approve user', error);
    }
  };

  const handleBlock = async (id: string) => {
    try {
      await adminApi.blockUser(id);
      loadUsers();
    } catch (error) {
      console.error('Failed to block user', error);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus(null);
      const result = await adminApi.syncCatalog();
      setSyncStatus({ 
        message: `Sincronização concluída! ${result.itemCount} itens processados (${result.newItems} novos).`, 
        type: 'success' 
      });
    } catch (error: any) {
      setSyncStatus({ 
        message: `Erro na sincronização: ${error.response?.data?.error || error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0A0A0A' }}>
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-4 flex items-center justify-between rfl-glass">
        <div className="flex items-center gap-4">
          <Link to="/catalog" className="rfl-btn-ghost p-2">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-xl font-black uppercase tracking-widest select-none" style={{ color: '#E50914' }}>
            RODFLIX <span className="text-white font-light text-sm ml-2">ADMIN</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
           <button 
            onClick={handleSync} 
            disabled={isSyncing} 
            className="rfl-btn-primary gap-2"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Catálogo'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6" style={{ paddingTop: '7rem' }}>
        
        {syncStatus && (
          <div className={`mb-8 rfl-animate-slide-up ${syncStatus.type === 'success' ? 'rfl-alert-success' : 'rfl-alert-error'}`}>
             {syncStatus.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
             <span>{syncStatus.message}</span>
          </div>
        )}

        {/* DASHBOARD SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rfl-card flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Usuários Totais</p>
              <p className="text-2xl font-black">{users.length}</p>
            </div>
          </div>
          <div className="rfl-card flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Aprovados</p>
              <p className="text-2xl font-black">{users.filter(u => u.approved).length}</p>
            </div>
          </div>
          <div className="rfl-card flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(229,9,20,0.1)' }}>
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Pendentes</p>
              <p className="text-2xl font-black">{users.filter(u => !u.approved).length}</p>
            </div>
          </div>
        </div>

        {/* USER LIST SECTION */}
        <div className="rfl-card" style={{ padding: '0' }}>
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              Gestão de Usuários
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Buscar usuário..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rfl-input"
                  style={{ width: '15rem', paddingLeft: '2.5rem', paddingBlock: '0.5rem' }}
                />
              </div>
              <button className="rfl-btn-secondary p-2">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th className="px-6 py-4 font-bold">Usuário</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Cadastro</th>
                  <th className="px-6 py-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-4 bg-white/5 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-white/30">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 font-bold">
                            {user.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{user.name}</p>
                            <p className="text-xs text-white/40">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.approved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                            <CheckCircle className="w-3 h-3" /> Aprovado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                            <XCircle className="w-3 h-3" /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.approved ? (
                            <button 
                              onClick={() => handleBlock(user.id)}
                              className="rfl-btn-secondary text-xs hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                              style={{ padding: '0.4rem 0.8rem' }}
                            >
                              Bloquear
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleApprove(user.id)}
                              className="rfl-btn-primary text-xs"
                              style={{ padding: '0.4rem 0.8rem' }}
                            >
                              Aprovar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
