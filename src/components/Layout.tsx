import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { 
  Home, 
  PlusCircle, 
  BarChart3, 
  Users, 
  User, 
  LogOut,
  Wallet
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { role, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/add-expense', icon: PlusCircle, label: 'Add' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  if (role === 'admin') {
    navItems.splice(2, 0, { to: '/reports', icon: BarChart3, label: 'Reports' });
    navItems.splice(3, 0, { to: '/members', icon: Users, label: 'Family' });
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-0 lg:pl-60 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-60 fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white italic">F</div>
            <span className="text-xl font-bold tracking-tight text-white">FamilyLedger</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, idx) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500" 
                  : "text-slate-400 hover:bg-slate-800"
              )}
            >
              <span className="text-[10px] uppercase font-bold tracking-widest">
                {(idx + 1).toString().padStart(2, '0')} {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-xs border border-slate-500 text-white uppercase font-bold">
              {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm text-white font-medium truncate">{user?.displayName || 'User'}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter truncate">{role} / Active</span>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-auto p-1.5 text-slate-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 space-y-6 max-w-[1400px]">
        {children}
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 flex justify-around p-2 z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors rounded-xl",
              isActive ? "text-emerald-400" : "text-slate-500"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
