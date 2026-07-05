'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '@/hooks/useData';
import { UserPlus } from 'lucide-react';

const signupSchema = zod.object({
  name: zod.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: zod.string().email({ message: 'Please enter a valid email address.' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type SignupSchema = zod.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupSchema) => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, data.name);
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.replace('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
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
          <h1 className="font-outfit font-bold text-3xl text-text-primary tracking-tight">Create Account</h1>
          <p className="text-sm text-text-secondary mt-2">Start your structured study journey today</p>
        </div>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl p-5 text-center">
            <h3 className="font-outfit font-semibold text-lg mb-1">Registration Successful!</h3>
            <p className="text-sm text-text-secondary">Please check your email to confirm your registration. Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3.5 text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Full Name</label>
              <input
                type="text"
                {...register('name')}
                className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition"
                placeholder="Alex Rivera"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

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
              <UserPlus size={18} />
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
            </button>

            <div className="text-center text-sm text-text-secondary mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
