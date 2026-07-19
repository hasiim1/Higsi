'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  StickyNote, 
  FileText, 
  BarChart2, 
  Timer, 
  Settings, 
  HelpCircle,
  Flame,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { useAuth, useProfile } from '@/hooks/useData';

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Notes', href: '/notes', icon: StickyNote },
    { name: 'Assignments', href: '/assignments', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Focus Session', href: '/focus', icon: Timer },
    { name: 'AI Assistant', href: '/assistant', icon: Sparkles },
  ];

  const bottomItems = [
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  const handleLinkClick = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-sidebar-dark border-b border-border-dark z-20 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-outfit font-extrabold text-white text-lg border-glow">
            H
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight text-text-primary">Higsi</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 text-text-secondary hover:text-text-primary transition"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-sidebar-dark border-r border-border-dark flex flex-col justify-between p-6 transition-transform duration-300 transform
        md:translate-x-0 md:static md:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Logo */}
        <div className="flex flex-col gap-8">
          <div className="hidden md:flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-outfit font-extrabold text-white text-xl border-glow">
              H
            </div>
            <span className="font-outfit font-bold text-2xl tracking-tight text-text-primary">Higsi</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition duration-200 group
                    ${isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary-glow border-glow' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-card-dark'
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-text-secondary group-hover:text-text-primary transition'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Panel */}
        <div className="flex flex-col gap-6">
          {/* Profile Card */}
          <Link 
            href="/profile" 
            className="bg-card-dark border border-border-dark hover:border-primary/40 rounded-2xl p-4 flex items-center gap-3 transition group cursor-pointer"
          >
            <img 
              src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60'} 
              alt={profile?.name || 'User'} 
              className="w-10 h-10 rounded-full object-cover border border-border-dark group-hover:border-primary transition"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-outfit font-semibold text-sm text-text-primary truncate group-hover:text-primary transition">{profile?.name || 'Loading...'}</h4>
              <p className="font-outfit font-bold text-[10px] text-primary tracking-wider uppercase mt-0.5">Scholarly Excellence</p>
            </div>
            {profile?.streak && (
              <div className="flex items-center gap-0.5 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-xs font-bold animate-pulse shrink-0">
                <Flame size={12} className="fill-current" />
                <span>{profile.streak}</span>
              </div>
            )}
          </Link>

          {/* Bottom Settings / Help */}
          <div className="flex flex-col gap-1">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition duration-200
                    ${isActive 
                      ? 'bg-card-dark text-text-primary border border-border-dark' 
                      : 'text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile menu */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
        />
      )}
    </>
  );
}
