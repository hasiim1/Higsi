'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { useAuth, useProfile } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { 
  User, 
  Camera, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Flame, 
  Calendar,
  X
} from 'lucide-react';

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: profile, refetch } = useProfile(user?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // UX states
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Image size must be less than 2MB.');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      showToast('error', 'File must be an image.');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw new Error('Please ensure you have created a public storage bucket named "avatars" in Supabase.');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      showToast('success', 'Profile image uploaded successfully.');
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!name.trim()) {
      showToast('error', 'Display Name is required.');
      return;
    }

    // Basic username format check
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (username && !usernameRegex.test(username)) {
      showToast('error', 'Username must be 3-20 characters and contain only letters, numbers, or underscores.');
      return;
    }

    setSaving(true);

    try {
      // If username changed, check for uniqueness in DB
      if (username && username !== profile?.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.toLowerCase())
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingUser) {
          showToast('error', 'This username is already taken.');
          setSaving(false);
          return;
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name,
          username: username.toLowerCase().trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl || null,
          last_active: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      showToast('success', 'Profile saved successfully!');
      
      // Invalidate queries to refresh sidebar profile picture & name
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      refetch();
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'An error occurred while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Joined recently';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="flex-1 bg-bg-dark flex flex-col pb-12 relative min-h-screen">
      <Header title="My Profile" subtitle="Manage your scholarly persona. Customize details and upload profile photos." showSearch={false} />

      {/* Floating Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-2xl border transition-all duration-300 transform translate-x-0 animate-fade-in ${
              toast.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' 
                : 'bg-red-950/90 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircle size={18} className="text-emerald-500" />
              ) : (
                <AlertCircle size={18} className="text-red-500" />
              )}
              <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-text-muted hover:text-text-primary transition ml-3 shrink-0 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="px-6 md:px-8 mt-6 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar and Info Header Card */}
          <div className="bg-card-dark border border-border-dark rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
              {/* Profile Image & Upload Overlay */}
              <div 
                onClick={triggerFileInput}
                className="relative w-24 h-24 rounded-full border border-border-dark hover:border-primary overflow-hidden cursor-pointer group transition shrink-0"
              >
                <img 
                  src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60'} 
                  alt={name || 'User'} 
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition duration-300">
                  <Camera size={18} className="text-white mb-1" />
                  <span className="text-[9px] text-white font-bold uppercase tracking-wider">Upload</span>
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <Loader2 size={24} className="text-primary animate-spin" />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />

              <div className="text-center sm:text-left">
                <h2 className="font-outfit font-bold text-2xl text-text-primary tracking-tight">
                  {name || 'Loading Name...'}
                </h2>
                {username && (
                  <p className="text-sm text-primary font-semibold font-outfit mt-0.5">
                    @{username}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full font-bold">
                    <Flame size={14} className="fill-current text-primary animate-pulse" />
                    <span>{profile?.streak || 1} Day Streak</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Joined {formatDate(profile?.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Details Card */}
          <div className="bg-card-dark border border-border-dark rounded-3xl p-6 space-y-4">
            <h3 className="font-outfit font-bold text-base text-text-primary border-b border-border-dark pb-3 flex items-center gap-2">
              <User size={18} className="text-primary" />
              <span>Identity Details</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Full Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. Alex Rivera"
                  className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Username (Lower-case alphanumeric)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted font-outfit">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alex_rivera"
                    className="w-full bg-bg-dark border border-border-dark rounded-xl pl-8 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition font-outfit"
                  />
                </div>
                <p className="text-[10px] text-text-muted mt-1">Used to identify your learning persona locally and in logs.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Academic Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={200}
                  placeholder="I am a second-year computer science major focused on deep neural networks and cognitive science..."
                  className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary transition h-28 resize-none leading-relaxed"
                />
                <div className="flex justify-between items-center text-[10px] text-text-muted mt-1">
                  <span>Describe your study goals and scholarly objectives.</span>
                  <span>{bio.length}/200</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl text-sm font-bold transition shadow-lg shadow-primary-glow cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
