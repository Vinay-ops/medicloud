import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Mail, Lock, ArrowRight, ShieldCheck, HeartPulse, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, showToast } = useApp();

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email.trim(), password);
      showToast(`Welcome back, ${user.name}!`);
      const destination = location.state?.from || '/dashboard';
      navigate(destination, { replace: true });
    } catch (failure) {
      setError(failure.message || 'Authentication failed. Please verify credentials.');
      showToast(failure.message || 'Sign in failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Left Medical Brand Visual Showcase (Split-screen) */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="lg:w-1/2 bg-gradient-to-br from-[#0066FF] via-[#0052CC] to-[#06B6D4] p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden"
      >
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#06B6D4]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <HeartPulse className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center">
                Medi<span className="text-cyan-300">Cloud</span>
              </span>
              <span className="text-xs uppercase tracking-widest text-blue-100 font-semibold block">Health Intelligence</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 my-12 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            <span>HIPAA-Compliant & Verified Care</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Seamless Clinical Care & Appointment Management.
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Access board-certified medical specialists, reserve immediate live consultation slots, and track ongoing health records securely in real time.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/15">
              <div className="text-2xl font-bold">2,500+</div>
              <div className="text-xs text-blue-100">Active Consultations</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/15">
              <div className="text-2xl font-bold">99.8%</div>
              <div className="text-xs text-blue-100">Patient Satisfaction</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-blue-100 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} MediCloud Health Inc.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Encrypted Telehealth Network
          </span>
        </div>
      </motion.div>

      {/* Right Login Form Container */}
      <motion.div 
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16"
      >
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">Sign In to MediCloud</h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your credentials to access your live patient schedule and specialist directory.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              icon={Mail}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              required
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3 bg-[#0066FF] hover:bg-[#0052CC] shadow-md hover:shadow-lg transition-all rounded-xl text-base font-semibold"
              isLoading={isLoading}
              rightIcon={ArrowRight}
            >
              Sign In to Account
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500 pt-4 border-t border-[#E2E8F0]">
            Don't have an account yet?{' '}
            <Link to="/auth/register" className="font-semibold text-[#0066FF] hover:underline">
              Create a Patient Profile
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
