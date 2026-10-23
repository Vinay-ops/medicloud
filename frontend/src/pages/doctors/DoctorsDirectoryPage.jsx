import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Stethoscope, MapPin, X, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DoctorCard } from '../../components/common/DoctorCard';
import { BookingModal } from '../../components/booking/BookingModal';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';

export const DoctorsDirectoryPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { doctors, specialties } = useApp();

  const searchTerm = searchParams.get('q') || '';
  const selectedSpecialty = searchParams.get('specialty') || '';
  const selectedLocation = searchParams.get('location') || '';
  const [sortBy, setSortBy] = useState('recommended');

  const [bookingDoctor, setBookingDoctor] = useState(null);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  // Filter & Sort Logic
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        !searchTerm ||
        (doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.specialty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.hospital || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialty =
        !selectedSpecialty || (doc.specialty || '').toLowerCase() === selectedSpecialty.toLowerCase();

      const matchesLocation =
        !selectedLocation || (doc.location || '').toLowerCase().includes(selectedLocation.toLowerCase());

      return matchesSearch && matchesSpecialty && matchesLocation;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (b.rating ?? -1) - (a.rating ?? -1);
      if (sortBy === 'fee-asc') return (a.fee ?? Number.MAX_SAFE_INTEGER) - (b.fee ?? Number.MAX_SAFE_INTEGER);
      if (sortBy === 'fee-desc') return (b.fee ?? -1) - (a.fee ?? -1);
      if (sortBy === 'experience') return (b.experience ?? -1) - (a.experience ?? -1);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [doctors, searchTerm, selectedSpecialty, selectedLocation, sortBy]);

  const clearFilters = () => {
    setSortBy('recommended');
    setSearchParams({});
  };

  const hasActiveFilters = searchTerm || selectedSpecialty || selectedLocation || sortBy !== 'recommended';

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0066FF] mb-1">
          <Stethoscope className="w-4 h-4" />
          <span>Clinical Specialists</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">Find Doctors & Specialists</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore certified medical practitioners, filter by location or department, and book direct slots.
        </p>
      </div>

      {/* Filter Controls Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search input */}
          <div className="md:col-span-4 relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by doctor, clinic, or keyword..."
              value={searchTerm}
              onChange={(e) => updateFilter('q', e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[#1E293B] text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/15 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Specialty filter */}
          <div className="md:col-span-3">
            <select
              value={selectedSpecialty}
              onChange={(e) => updateFilter('specialty', e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-[#1E293B] text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] outline-none transition-all cursor-pointer"
            >
              <option value="">All Specialties</option>
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.name}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location filter */}
          <div className="md:col-span-3 relative flex items-center">
            <MapPin className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by city/state..."
              value={selectedLocation}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[#1E293B] text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-[#1E293B] text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] outline-none transition-all cursor-pointer"
            >
              <option value="recommended">Featured First</option>
              <option value="rating">Highest Rated</option>
              <option value="experience">Experience</option>
              <option value="fee-asc">Fee: Low to High</option>
              <option value="fee-desc">Fee: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filter Chips & Count */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2 text-xs">
          <div className="text-slate-500">
            Showing <span className="font-extrabold text-[#1E293B]">{filteredDoctors.length}</span> verified specialists
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <motion.div
              key={doc.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <DoctorCard
                doctor={doc}
                onBook={(doctor) => setBookingDoctor(doctor)}
                onViewDetails={(doctor) => navigate(`/doctors/${doctor.id}`)}
              />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon={Filter}
              title="No doctors match your criteria"
              description="Try modifying search keywords or clearing specialty selections."
              actionLabel="Reset Search Filters"
              onAction={clearFilters}
            />
          </div>
        )}
      </motion.div>

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          isOpen={!!bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          doctor={bookingDoctor}
        />
      )}
    </div>
  );
};
