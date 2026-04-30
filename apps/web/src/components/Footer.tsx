export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
        <span className="text-xl font-black uppercase tracking-widest text-red-600">RODFLIX</span>
        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-red-500">Ajuda</a>
          <a href="#" className="hover:text-red-500">Privacidade</a>
          <a href="#" className="hover:text-red-500">Termos</a>
        </div>
        <p className="text-[10px] uppercase font-bold tracking-widest">© 2026 Rodflix Media Inc.</p>
      </div>
    </footer>
  );
}
