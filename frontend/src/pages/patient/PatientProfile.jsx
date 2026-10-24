import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Heart,
  AlertTriangle,
  Save,
  CheckCircle2,
  Calendar,
  Lock,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

export const PatientProfile = () => {
  const { currentUser, updateProfile, showToast } = useApp();

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    dateOfBirth: currentUser?.dateOfBirth || '',
    gender: currentUser?.gender || 'Female',
    bloodGroup: currentUser?.bloodGroup || 'O+',
    address: currentUser?.address || '',
    insuranceProvider: currentUser?.insuranceProvider || '',
    policyNumber: currentUser?.policyNumber || '',
    allergies: currentUser?.allergies?.join(', ') || '',
    emergencyName: currentUser?.emergencyContact?.name || '',
    emergencyPhone: currentUser?.emergencyContact?.phone || '',
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'medical', 'insurance'

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        insuranceProvider: formData.insuranceProvider,
        policyNumber: formData.policyNumber,
        allergies: formData.allergies.split(',').map((s) => s.trim()).filter(Boolean),
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
        },
      });
      showToast('Profile settings saved successfully!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Profile Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#0066FF] to-[#06B6D4] text-white text-3xl font-black grid place-items-center shadow-md">
            {currentUser?.name?.slice(0, 1) || 'P'}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight mt-1">
              {currentUser?.name || 'Patient Profile'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
              {currentUser?.email && <span>{currentUser.email}</span>}
              {currentUser?.phone && (
                <>
                  <span>•</span>
                  <span>{currentUser.phone}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active Coverage
          </span>
        </div>
      </motion.div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-[#0066FF] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Information</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('medical')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'medical'
              ? 'bg-[#0066FF] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Vitals & Medical History</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('insurance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'insurance'
              ? 'bg-[#0066FF] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Insurance & Emergency</span>
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'general' && (
            <motion.div
              key="general"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <h3 className="text-base font-bold text-[#1E293B]">General Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Legal Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Residential Street Address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="e.g. 450 Lexington Ave, New York, NY"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'medical' && (
            <motion.div
              key="medical"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <h3 className="text-base font-bold text-[#1E293B]">Clinical Demographics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Gender Identity"
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

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Known Allergies (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => handleChange('allergies', e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, Pollen"
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-300 p-3 focus:bg-white focus:border-[#0066FF] outline-none"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'insurance' && (
            <motion.div
              key="insurance"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <h3 className="text-base font-bold text-[#1E293B]">Insurance Policy & Emergency Contacts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Insurance Provider"
                  value={formData.insuranceProvider}
                  onChange={(e) => handleChange('insuranceProvider', e.target.value)}
                  placeholder="e.g. BlueCross BlueShield"
                />
                <Input
                  label="Policy / Group Number"
                  value={formData.policyNumber}
                  onChange={(e) => handleChange('policyNumber', e.target.value)}
                  placeholder="e.g. BC-99281-X7"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Emergency Contact Name"
                  value={formData.emergencyName}
                  onChange={(e) => handleChange('emergencyName', e.target.value)}
                  placeholder="e.g. Robert Jenkins (Spouse)"
                />
                <Input
                  label="Emergency Contact Phone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                  placeholder="+1 (555) 345-9876"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Changes persist to your account in real time.
          </p>
          <Button
            type="submit"
            variant="primary"
            leftIcon={Save}
            isLoading={saving}
            className="bg-[#0066FF] hover:bg-[#0052CC] font-bold shadow-md rounded-xl px-6"
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
