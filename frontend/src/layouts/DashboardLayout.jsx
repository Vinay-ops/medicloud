import React, { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarCheck,
  Stethoscope,
  User,
  LogOut,
  Menu,
  X,
  HeartPulse,
  Bell,
  FileText,
  Users,
  Calendar,
  ClipboardList,
  ChevronLeft,
  Settings,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ToastContainer } from '../components/common/ToastContainer';

export const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { currentRole, currentUser, logout, appointments } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Active upcoming appointments count for notification indicator
  const upcomingCount = appointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'pending'
  ).length;

  // Role-based navigation links
  const getNavLinks = () => {
    if (currentRole === 'doctor') {
      return [
        { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
        { label: 'My Patients', path: '/doctor/patients', icon: Users },
        { label: 'Schedule', path: '/doctor/schedule', icon: Calendar },
      ];
    }
    if (currentRole === 'admin') {
      return [
        { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Manage Doctors', path: '/admin/doctors', icon: Stethoscope },
        { label: 'Appointments', path: '/admin/appointments', icon: ClipboardList },
      ];
    }
    // Patient (default)
    return [
      { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Find Doctors', path: '/doctors', icon: Stethoscope },
      { label: 'Appointments', path: '/appointments', icon: CalendarCheck, badge: upcomingCount > 0 ? upcomingCount : null },
      { label: 'Documents', path: '/documents', icon: FileText },
      { label: 'Profile', path: '/profile', icon: User },
    ];
  };

  const navLinks = getNavLinks();

  const handleLogout = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1E293B]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0066FF] to-[#06B6D4] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-extrabold tracking-tight text-[#1E293B]">
                  Medi<span className="text-[#0066FF]">Cloud</span>
                </span>
                <span className="text-[10px] text-[#06B6D4] font-bold tracking-wider uppercase">
                  Health Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role badge */}
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize bg-blue-50 text-[#0066FF] border border-blue-200/70">
              {currentRole || 'Patient'}
            </span>

            <Link
              to="/appointments"
              className="relative p-2.5 rounded-xl text-slate-500 hover:text-[#0066FF] hover:bg-blue-50 transition-colors"
              title="Appointments"
            >
              <Bell className="w-5 h-5" />
              {upcomingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0066FF] ring-2 ring-white" />
              )}
            </Link>

            <div className="h-6 w-px bg-slate-200" />

            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0066FF] to-[#06B6D4] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {currentUser?.name?.slice(0, 1) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#1E293B] truncate max-w-[120px]">
                  {currentUser?.name || 'User'}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-screen-2xl w-full mx-auto">
        {/* Desktop Collapsing Sidebar - fixed/sticky in viewport without scrolling */}
        <motion.aside
          animate={{ width: isCollapsed ? 76 : 240 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="hidden lg:flex flex-col justify-between bg-white border-r border-[#E2E8F0] py-5 px-3 shrink-0 shadow-xs sticky top-[68px] h-[calc(100vh-68px)] overflow-hidden select-none"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between px-2">
              {!isCollapsed && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Navigation
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-auto"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && item.path !== '/doctor/dashboard' && item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50/50 text-[#0066FF] border border-blue-200/70 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-[#0066FF]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0066FF] text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-1">
            <button
              type="button"
              onClick={handleLogout}
              title={isCollapsed ? 'Sign Out' : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </motion.aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl px-4 py-5"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#0066FF] text-white flex items-center justify-center font-bold">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-[#1E293B]">MediCloud</span>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 space-y-1">
                  {navLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || (item.path !== '/dashboard' && item.path !== '/doctor/dashboard' && item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-50 text-[#0066FF] font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${isActive ? 'text-[#0066FF]' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0066FF] text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileSidebarOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Routed Page Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navLinks.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && item.path !== '/doctor/dashboard' && item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-semibold relative ${
                isActive ? 'text-[#0066FF]' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="mt-0.5">{item.label.split(' ')[0]}</span>
              {item.badge && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#0066FF]" />
              )}
            </Link>
          );
        })}
      </div>

      <ToastContainer />
    </div>
  );
};
