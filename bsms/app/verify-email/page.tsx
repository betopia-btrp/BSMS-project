'use client';
import Link from 'next/link';
import { Shield, Mail, CheckCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl mb-6">
          <Mail className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
        <p className="text-slate-400 mb-8">We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.</p>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl mb-6">
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-300">Account created successfully!</p>
          </div>
          <p className="text-slate-400 text-sm">Didn't receive the email? Check spam or</p>
          <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mt-1">Resend verification email</button>
        </div>

        <Link href="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg">
          Go to Login
        </Link>
      </div>
    </div>
  );
}
