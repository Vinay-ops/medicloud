const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getDateDayName = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return DAY_NAMES[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
};

export const isAvailableDate = (dateString, availableDays = []) => (
  availableDays.length === 0 || availableDays.includes(getDateDayName(dateString))
);

export const getNextAvailableDate = (availableDays = [], startDate = new Date()) => {
  const candidate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1));
  for (let offset = 0; offset < 14; offset += 1) {
    const dateString = candidate.toISOString().slice(0, 10);
    if (isAvailableDate(dateString, availableDays)) return dateString;
    candidate.setUTCDate(candidate.getUTCDate() + 1);
  }
  return candidate.toISOString().slice(0, 10);
};
