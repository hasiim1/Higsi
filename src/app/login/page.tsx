'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '@/hooks/useData';
import { LogIn } from 'lucide-react';

const loginSchema = zod.object({
  email: zod.string().email({ message: 'Please enter a valid email address.' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginSchema = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginSchema) => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        setError(error.message);
      } else {
        router.replace('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize Google login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-card-dark border border-border-dark rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center font-outfit font-extrabold text-white text-2xl border-glow shadow-lg shadow-primary-glow mb-4">
            H
          </div>
          <h1 className="font-outfit font-bold text-3xl text-text-primary tracking-tight">Welcome to Higsi</h1>
          <p className="text-sm text-text-secondary mt-2">Manage your deep work and study sessions</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3.5 text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Email Address</label>
              <input
                type="email"
                {...register('email')}
                className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Password</label>
              <input
                type="password"
                {...register('password')}
                className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
            >
              <LogIn size={18} />
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>

            {/* Social logins */}
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-dark"></div>
              </div>
              <span className="relative px-3 text-xs uppercase tracking-widest text-text-muted bg-card-dark">Or continue with</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3.5 px-4 bg-bg-dark hover:bg-border-dark border border-border-dark text-text-primary rounded-xl font-bold transition flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            <div className="text-center text-sm text-text-secondary mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline font-semibold">
                Sign Up
              </Link>
            </div>
          </form>
      </div>
    </div>
  );
}
