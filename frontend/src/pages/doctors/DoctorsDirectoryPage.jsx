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

  // Derive unique specialties from both registered specialties and doctors list
  const availableSpecialties = useMemo(() => {
    const list = new Set();
    specialties.forEach((s) => {
      if (s.name) list.add(s.name.trim());
    });
    doctors.forEach((d) => {
      if (d.specialty) list.add(d.specialty.trim());
    });
    return Array.from(list).sort();
  }, [specialties, doctors]);

  // Derive unique locations from doctors roster for quick selection
  const availableLocations = useMemo(() => {
    const locs = new Set();
    doctors.forEach((d) => {
      if (d.location) {
        locs.add(d.location.trim());
      }
    });
    return Array.from(locs).sort();
  }, [doctors]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value.trim()) {
      next.set(key, value.trim());
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  // Filter & Sort Logic with lenient normalization
  const filteredDoctors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const specQuery = selectedSpecialty.trim().toLowerCase();
    const locQuery = selectedLocation.trim().toLowerCase();

    return doctors.filter((doc) => {
      const docName = (doc.name || '').toLowerCase();
      const docSpecialty = (doc.specialty || '').toLowerCase();
      const docHospital = (doc.hospital || '').toLowerCase();
      const docLocation = (doc.location || '').toLowerCase();
      const docTitle = (doc.title || '').toLowerCase();

      // Search matches name, specialty, hospital, city, or title
      const matchesSearch =
        !query ||
        docName.includes(query) ||
        docSpecialty.includes(query) ||
        docHospital.includes(query) ||
        docLocation.includes(query) ||
        docTitle.includes(query);

      // Specialty exact or substring match
      const matchesSpecialty =
        !specQuery ||
        docSpecialty === specQuery ||
        docSpecialty.includes(specQuery);

      // Location match
      const matchesLocation =
        !locQuery ||
        docLocation.includes(locQuery);

      return matchesSearch && matchesSpecialty && matchesLocation;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (sortBy === 'fee-asc') return (Number(a.fee) || 0) - (Number(b.fee) || 0);
      if (sortBy === 'fee-desc') return (Number(b.fee) || 0) - (Number(a.fee) || 0);
      if (sortBy === 'experience') return (Number(b.experience) || 0) - (Number(a.experience) || 0);
      // 'recommended' - Featured first, then rating
      if (a.featured !== b.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    });
  }, [doctors, searchTerm, selectedSpecialty, selectedLocation, sortBy]);

  const clearFilters = () => {
    setSortBy('recommended');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(searchTerm || selectedSpecialty || selectedLocation || sortBy !== 'recommended');

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
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search input with clear button */}
          <div className="md:col-span-4 relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search doctor, specialty, clinic..."
              value={searchTerm}
              onChange={(e) => updateFilter('q', e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/15 outline-none transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => updateFilter('q', '')}
                className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Specialty filter */}
          <div className="md:col-span-3">
            <select
              value={selectedSpecialty}
              onChange={(e) => updateFilter('specialty', e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] outline-none transition-all cursor-pointer font-medium"
            >
              <option value="">All Specialties</option>
              {availableSpecialties.map((specName) => (
                <option key={specName} value={specName}>
                  {specName}
                </option>
              ))}
            </select>
          </div>

          {/* Location filter with datalist suggestions and clear button */}
          <div className="md:col-span-3 relative flex items-center">
            <MapPin className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              list="directory-locations"
              placeholder="Filter by city/state..."
              value={selectedLocation}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] outline-none transition-all placeholder:text-slate-400"
            />
            <datalist id="directory-locations">
              {availableLocations.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
            {selectedLocation && (
              <button
                type="button"
                onClick={() => updateFilter('location', '')}
                className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                title="Clear location"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] outline-none transition-all cursor-pointer font-medium"
            >
              <option value="recommended">Featured First</option>
              <option value="rating">Highest Rated</option>
              <option value="experience">Experience</option>
              <option value="fee-asc">Fee: Low to High</option>
              <option value="fee-desc">Fee: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filter Chips & Summary */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap text-slate-500">
            <span>
              Showing <span className="font-extrabold text-[#1E293B]">{filteredDoctors.length}</span> verified specialists
            </span>

            {/* Active filter badges */}
            {selectedSpecialty && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                Specialty: {selectedSpecialty}
                <button
                  type="button"
                  onClick={() => updateFilter('specialty', '')}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedLocation && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                Location: {selectedLocation}
                <button
                  type="button"
                  onClick={() => updateFilter('location', '')}
                  className="hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                Query: "{searchTerm}"
                <button
                  type="button"
                  onClick={() => updateFilter('q', '')}
                  className="hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
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
