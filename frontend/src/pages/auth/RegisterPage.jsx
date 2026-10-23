import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Mail, Lock, Phone, ArrowRight, ShieldCheck, HeartPulse, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerPatient, showToast } = useApp();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Female',
    bloodGroup: 'O+',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid email address';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSubmitError('');
    try {
      const result = await registerPatient(formData);
      if (result.token) {
        showToast('Registration successful! Directing to dashboard.');
        navigate('/dashboard', { replace: true });
        return;
      }
      if (result.needsConfirmation) {
        navigate('/verify-email', {
          replace: true,
          state: {
            email: formData.email.trim(),
            deliveryDestination: result.deliveryDestination,
          },
        });
      } else {
        navigate('/auth/login', {
          replace: true,
          state: { registered: true, email: formData.email.trim() },
        });
      }
    } catch (error) {
      setSubmitError(error.message || 'Registration failed. Please try again.');
      showToast(error.message || 'Registration failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Left Visual Branding Container */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="lg:w-5/12 bg-gradient-to-br from-[#0066FF] via-[#0052CC] to-[#06B6D4] p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden"
      >
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

        <div className="relative z-10 my-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            <span>Join 2,500+ Active Patients</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Comprehensive Medical Care At Your Fingertips.
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Register your profile once to effortlessly book specialist slots, manage clinic appointments, and review your vital health metrics.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs bg-white/10 rounded-xl p-3 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-cyan-300" />
              <span>Real-time instant appointment booking confirmations</span>
            </div>
            <div className="flex items-center gap-3 text-xs bg-white/10 rounded-xl p-3 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-cyan-300" />
              <span>Seamless video telemedicine & clinic consultations</span>
            </div>
            <div className="flex items-center gap-3 text-xs bg-white/10 rounded-xl p-3 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-cyan-300" />
              <span>Persistent patient health profile & document storage</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-blue-100">
          &copy; {new Date().getFullYear()} MediCloud Platform. All clinical records encrypted.
        </div>
      </motion.div>

      {/* Right Registration Form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="lg:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto"
      >
        <div className="w-full max-w-xl space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">Create Patient Account</h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete your patient profile to connect with leading specialists.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="e.g. John"
                error={errors.firstName}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="e.g. Doe"
                error={errors.lastName}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john.doe@example.com"
                icon={Mail}
                error={errors.email}
                required
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                icon={Phone}
                error={errors.phone}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
              />
              <Select
                label="Gender"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                options={['Female', 'Male', 'Non-Binary', 'Prefer not to say']}
              />
              <Select
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                options={['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
                icon={Lock}
                error={errors.password}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
                icon={Lock}
                error={errors.confirmPassword}
                required
              />
            </div>

            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
                >
                  {submitError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white shadow-md rounded-xl font-semibold text-base transition-all"
                isLoading={isLoading}
                rightIcon={ArrowRight}
              >
                Create Account & Go to Dashboard
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-slate-500 pt-4 border-t border-[#E2E8F0]">
            Already have a MediCloud account?{' '}
            <Link to="/auth/login" className="font-semibold text-[#0066FF] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
