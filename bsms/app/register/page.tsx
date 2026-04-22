'use client';
import Link from 'next/link';
import { Shield, Lock, UserCog } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/30 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Account Access</h1>
          <p className="text-slate-400">BSMS accounts are issued by an administrator</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="space-y-5 text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <UserCog className="mt-0.5 h-5 w-5 text-indigo-300" />
                <div>
                  <p className="text-sm font-semibold text-white">Admin-managed accounts only</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Residents, owners, guards, and staff cannot create accounts directly from this page.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 text-violet-300" />
                <div>
                  <p className="text-sm font-semibold text-white">How to get access</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Contact your building administrator. They will create your BSMS account and share your login details.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500"
            >
              Back to Sign In
            </Link>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Need help with access? Please contact your admin.
        </p>
      </div>
    </div>
  );
}
