import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-netflix-black text-white w-full">
      <header className="px-[4%] py-5 flex items-center justify-between sticky top-0 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm z-50">
        <h1 className="text-netflix-red text-3xl font-black uppercase tracking-wider">RODFLIX</h1>
        <nav className="flex gap-4 items-center">
          <button className="text-sm font-semibold hover:text-gray-300 transition-colors">Entrar</button>
          <button className="bg-netflix-red text-white px-4 py-1.5 rounded font-bold hover:bg-red-700 transition-colors">Admin</button>
        </nav>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}

function LandingRoute() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-3xl mx-auto px-4">
      <h2 className="text-4xl md:text-5xl font-black mb-4">Filmes, séries e muito mais, sem limites</h2>
      <p className="text-lg md:text-xl mb-8">Acesso exclusivo. Cadastre-se e aguarde a aprovação.</p>
      
      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-lg">
        <input 
          type="email" 
          placeholder="Email" 
          className="flex-1 bg-black/50 border border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
        />
        <button className="bg-netflix-red text-white px-8 py-3 rounded font-bold text-lg hover:bg-red-700 transition-colors whitespace-nowrap">
          Vamos lá &gt;
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout><LandingRoute /></MainLayout>} />
        {/* Protected routes will go here */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
