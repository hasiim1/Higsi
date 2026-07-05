'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useAuth, useProfile, useUserSettings } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { 
  Save, 
  Settings, 
  User, 
  Clock, 
  Database,
  CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: profile, refetch: refetchProfile } = useProfile(user?.id);
  const { data: settings, updateSettings, refetch: refetchSettings } = useUserSettings(user?.id);

  // Form states
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [theme, setTheme] = useState('dark');
  const [pomodoro, setPomodoro] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
    if (settings) {
      setTheme(settings.theme || 'dark');
      setPomodoro(settings.pomodoro_duration || 25);
      setShortBreak(settings.short_break_duration || 5);
      setLongBreak(settings.long_break_duration || 15);
    }
  }, [profile, settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');

    try {
      // Update profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name, avatar_url: avatarUrl })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Update timer settings
      await updateSettings({
        theme,
        pomodoro_duration: Number(pomodoro),
        short_break_duration: Number(shortBreak),
        long_break_duration: Number(longBreak)
      });

      refetchProfile();
      refetchSettings();
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  return (
    <div className="flex-1 bg-bg-dark flex flex-col pb-12">
      <Header title="Settings" subtitle="Tailor your study space. Adjust parameters and profiles." showSearch={false} />

      <form onSubmit={handleSave} className="px-6 md:px-8 mt-6 max-w-2xl mx-auto w-full space-y-6">
        
        {/* Profile Card Settings */}
        <div className="bg-card-dark border border-border-dark rounded-3xl p-6">
          <h3 className="font-outfit font-bold text-base text-text-primary mb-4 border-b border-border-dark pb-3 flex items-center gap-2">
            <User size={18} className="text-primary" />
            <span>Profile Configuration</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">User Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Avatar Image URL</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>
        </div>

        {/* Timer Config */}
        <div className="bg-card-dark border border-border-dark rounded-3xl p-6">
          <h3 className="font-outfit font-bold text-base text-text-primary mb-4 border-b border-border-dark pb-3 flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <span>Pomodoro Timer Intervals</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Focus (mins)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={pomodoro}
                onChange={(e) => setPomodoro(Number(e.target.value))}
                className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Short Break (mins)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={shortBreak}
                onChange={(e) => setShortBreak(Number(e.target.value))}
                className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Long Break (mins)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={longBreak}
                onChange={(e) => setLongBreak(Number(e.target.value))}
                className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>
        </div>

        {/* Workspace controls / database management */}
        <div className="bg-card-dark border border-border-dark rounded-3xl p-6">
          <h3 className="font-outfit font-bold text-base text-text-primary mb-4 border-b border-border-dark pb-3 flex items-center gap-2">
            <Database size={18} className="text-primary" />
            <span>Workspace & Sync State</span>
          </h3>

          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4.5 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm mb-1.5">
                <CheckCircle size={16} />
                <span>Production Database Connected</span>
              </div>
              <p className="text-xs text-text-secondary">
                Connected to Supabase. RLS policies protect your learning records.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={signOut}
                className="flex items-center justify-center gap-1.5 px-4 py-3 border border-border-dark hover:border-text-secondary text-text-secondary hover:text-text-primary rounded-xl text-xs font-bold transition cursor-pointer bg-bg-dark"
              >
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={status === 'saving'}
            className="flex items-center gap-1.5 px-6 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-primary-glow cursor-pointer"
          >
            {status === 'saved' ? <CheckCircle size={16} /> : <Save size={16} />}
            <span>{status === 'saving' ? 'Saving settings...' : status === 'saved' ? 'Settings Saved!' : 'Save All Changes'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
