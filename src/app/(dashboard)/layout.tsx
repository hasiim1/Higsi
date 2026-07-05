'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/hooks/useData';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-dark text-text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin timer-glow"></div>
          <span className="font-outfit text-sm font-semibold tracking-wider text-text-secondary uppercase">Initializing Workspace</span>
        </div>
      </div>
    );
  }

  // Render nothing while redirecting unauthenticated users
  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-bg-dark text-text-primary overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        {children}
      </div>
    </div>
  );
}
