import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { UserRole } from '../types';
import { PureFlowLogo } from './PureFlowLogo';

interface LoginPageProps {
  onLogin: (username: string, role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const resolveRole = (name: string): UserRole => {
    const normalized = name.trim().toLowerCase();
    if (normalized.includes('cashier') || normalized === 'staff') {
      return UserRole.CASHIER;
    }
    return UserRole.OWNER;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Please enter your username.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    setError('');
    onLogin(trimmed, resolveRole(trimmed));
  };

  const handleQuickFill = (presetUser: string) => {
    setUsername(presetUser);
    setPassword('pureflow360');
    setError('');
  };

  return (
    <div className="min-h-screen w-full pureflow-login-bg flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Subtle decorative radial light highlights matching the sky-blue backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#5C9CEB]/30 blur-3xl"
      />

      <main className="relative z-10 w-full max-w-[390px] flex flex-col items-center">
        {/* Centered PureFlow 360 Logo matching uploaded screenshot */}
        <div className="mb-8 drop-shadow-[0_12px_28px_rgba(33,96,178,0.16)] transition-transform duration-300">
          <PureFlowLogo size={244} />
        </div>

        {/* Frosted translucent sky-blue login card matching uploaded screenshot */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full pureflow-login-card rounded-[30px] px-7 py-8 sm:px-8 sm:py-9 flex flex-col gap-5"
        >
          <div>
            <label htmlFor="pf-username" className="sr-only">
              Username
            </label>
            <input
              id="pf-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              placeholder="Username"
              className="w-full h-12 rounded-full bg-[#73ACEC] px-6 text-[16px] font-bold text-white placeholder:text-white/95 placeholder:font-bold shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#73ACEC] transition-colors"
            />
          </div>

          <div className="relative">
            <label htmlFor="pf-password" className="sr-only">
              Password
            </label>
            <input
              id="pf-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Password"
              className="w-full h-12 rounded-full bg-[#73ACEC] pl-6 pr-12 text-[16px] font-bold text-white placeholder:text-white/95 placeholder:font-bold shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#73ACEC] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-[#12263A] hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
            >
              {showPassword ? <Unlock className="w-4 h-4 stroke-[2.2]" /> : <Lock className="w-4 h-4 stroke-[2.2]" />}
            </button>
          </div>

          {error && (
            <p role="alert" className="text-center text-xs font-semibold text-[#991B1B] bg-white/75 rounded-lg py-1.5 px-3">
              {error}
            </p>
          )}

          <div className="pt-1 flex justify-center">
            <button
              type="submit"
              className="w-[74%] h-12 rounded-full bg-[#14CFF0] hover:bg-[#0EC2E3] active:scale-[0.98] text-white font-display font-bold text-[15px] tracking-wide uppercase shadow-[0_8px_20px_-4px_rgba(20,207,240,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#85BAF5] transition-all cursor-pointer whitespace-nowrap"
            >
              LOG IN
            </button>
          </div>
        </form>

        {/* Quiet, unboxed quick-access helper below the card so the card remains visually identical to the screenshot */}
        <div className="mt-5 text-center text-xs text-[#1B4268]/85 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>Demo access:</span>
          <button
            type="button"
            onClick={() => handleQuickFill('owner')}
            className="font-semibold underline underline-offset-2 hover:text-[#0F2942] cursor-pointer"
          >
            Owner
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => handleQuickFill('cashier')}
            className="font-semibold underline underline-offset-2 hover:text-[#0F2942] cursor-pointer"
          >
            Cashier
          </button>
        </div>
      </main>
    </div>
  );
};
