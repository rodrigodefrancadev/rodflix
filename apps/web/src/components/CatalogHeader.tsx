import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, X, ChevronDown, LogOut, Menu, Users, UserCircle } from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';

type UserLocal = {
  name: string;
  email: string;
  [key: string]: any;
};

type CatalogHeaderProps = {
  isAdmin: boolean;
  user: UserLocal | null;
  logout: () => void;
};

export function CatalogHeader({ isAdmin, user, logout }: CatalogHeaderProps) {
  const {
    activeFilter,
    setActiveFilter,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
  } = useCatalog();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 md:px-6 py-4 flex items-center justify-between rfl-glass">
      <div className="flex items-center gap-4 md:gap-8">
        {/* Mobile Hamburger Button */}
        <button 
          className="md:hidden text-white hover:text-white/80 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <span
          className="text-xl font-black uppercase tracking-widest select-none cursor-pointer"
          onClick={() => setActiveFilter('all')}
          style={{ color: '#E50914' }}
        >
          RODFLIX
        </span>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <button
            onClick={() => setActiveFilter('all')}
            className={`font-medium transition-all ${activeFilter === 'all' ? 'text-white scale-110' : 'text-white/50 hover:text-white'}`}
          >
            Início
          </button>
          <button
            onClick={() => setActiveFilter('film')}
            className={`font-medium transition-all ${activeFilter === 'film' ? 'text-white scale-110' : 'text-white/50 hover:text-white'}`}
          >
            Filmes
          </button>
          <button
            onClick={() => setActiveFilter('series')}
            className={`font-medium transition-all ${activeFilter === 'series' ? 'text-white scale-110' : 'text-white/50 hover:text-white'}`}
          >
            Séries
          </button>
          <Link
            to="/members"
            className="flex items-center gap-1.5 font-medium text-white/50 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4" />
            Membros
          </Link>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1.5 font-medium transition-colors hover:opacity-80" style={{ color: '#E50914' }}>
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'bg-black/40 border-white/20 px-3' : 'bg-transparent border-transparent'} border rounded-md h-10`}>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-1 hover:text-white/80 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="Buscar títulos..."
            className={`bg-transparent border-none outline-none text-sm transition-all duration-300 ${isSearchOpen ? 'w-24 sm:w-48 ml-2 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus={isSearchOpen}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 hover:text-white transition-colors"
            >
              <X className="w-4 h-4 opacity-40 hover:opacity-100" />
            </button>
          )}
        </div>

        {/* User Menu */}
        <div className="relative flex items-center gap-2 cursor-pointer group">
          <div className="flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{
            width: '2.2rem', height: '2.2rem', borderRadius: '0.375rem',
            background: 'linear-gradient(135deg, #E50914, #B20710)',
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 hidden sm:block" style={{ color: 'rgba(255,255,255,0.4)' }} />

          <div
            className="absolute rfl-glass rounded-xl p-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200"
            style={{ top: '3rem', right: 0, width: '12rem', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
          >
            <div className="px-3 py-2 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-xs font-bold">{user?.name}</p>
              <p className="text-[10px] truncate opacity-40">{user?.email}</p>
            </div>
            {user?.id && (
              <Link
                to={`/profile/${user.id}`}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-white/5 hover:text-red-500 transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                Meu Perfil
              </Link>
            )}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-white/5 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#141414]/95 backdrop-blur-md border-b border-white/10 flex flex-col md:hidden animate-in slide-in-from-top-2">
          <button
            onClick={() => { setActiveFilter('all'); setIsMobileMenuOpen(false); }}
            className={`text-left font-bold text-lg p-4 border-b border-white/5 ${activeFilter === 'all' ? 'text-white' : 'text-white/50'}`}
          >
            Início
          </button>
          <button
            onClick={() => { setActiveFilter('film'); setIsMobileMenuOpen(false); }}
            className={`text-left font-bold text-lg p-4 border-b border-white/5 ${activeFilter === 'film' ? 'text-white' : 'text-white/50'}`}
          >
            Filmes
          </button>
          <button
            onClick={() => { setActiveFilter('series'); setIsMobileMenuOpen(false); }}
            className={`text-left font-bold text-lg p-4 border-b border-white/5 ${activeFilter === 'series' ? 'text-white' : 'text-white/50'}`}
          >
            Séries
          </button>
          <Link
            to="/members"
            className="flex items-center gap-2 text-left font-bold text-lg p-4 border-b border-white/5 text-white/50 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Users className="w-5 h-5" />
            Membros
          </Link>
          {isAdmin && (
            <Link 
              to="/admin" 
              className="flex items-center gap-2 font-bold text-lg text-red-500 p-4 hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ShieldCheck className="w-5 h-5" />
              Painel Admin
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
