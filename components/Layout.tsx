
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  const NavItem = ({ to, label, icon }: { to: string, label: string, icon: string }) => {
    const active = path === to;
    return (
      <Link to={to} className={`flex flex-col items-center justify-center space-y-1 transition-colors ${active ? 'text-purple-400' : 'text-slate-400 hover:text-white'}`}>
        <span className="text-xl">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        {active && <div className="w-1 h-1 rounded-full bg-purple-400 mt-1"></div>}
      </Link>
    );
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-20 bg-slate-950 text-slate-50">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-8 glass-panel border-r border-slate-800 z-50">
        <div className="mb-12">
          <div className="w-10 h-10 anime-gradient rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">A</div>
        </div>
        <div className="flex-1 flex flex-col space-y-10">
          <NavItem to="/" label="Studio" icon="🎨" />
          <NavItem to="/gallery" label="Vault" icon="🖼️" />
          <NavItem to="/music" label="Audio" icon="🎵" />
          <NavItem to="/profile" label="Profile" icon="👤" />
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 glass-panel border-t border-slate-800 flex items-center justify-around px-4 z-50">
        <NavItem to="/" label="Studio" icon="🎨" />
        <NavItem to="/gallery" label="Vault" icon="🖼️" />
        <NavItem to="/music" label="Audio" icon="🎵" />
        <NavItem to="/profile" label="Profile" icon="👤" />
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
