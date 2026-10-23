// Utility formatters for MediCloud

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // Avoid UTC timezone off-by-one conversion for YYYY-MM-DD
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

export const getStatusConfig = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return {
        label: 'Confirmed',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500'
      };
    case 'pending':
      return {
        label: 'Pending Approval',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500'
      };
    case 'completed':
      return {
        label: 'Completed',
        bg: 'bg-blue-50 text-[#0066FF] border-blue-200',
        dot: 'bg-[#0066FF]'
      };
    case 'cancelled':
    case 'rejected':
      return {
        label: 'Cancelled',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500'
      };
    case 'active':
      return {
        label: 'Active Provider',
        bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        dot: 'bg-cyan-500'
      };
    case 'inactive':
      return {
        label: 'Inactive',
        bg: 'bg-slate-100 text-slate-600 border-slate-200',
        dot: 'bg-slate-400'
      };
    default:
      return {
        label: status || 'Unknown',
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400'
      };
  }
};
