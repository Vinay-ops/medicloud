import { describe, expect, it } from 'vitest';
import { getDateDayName, getNextAvailableDate, isAvailableDate } from './appointmentAvailability';

describe('appointment availability', () => {
  it('interprets date-only values consistently as UTC calendar dates', () => {
    expect(getDateDayName('2027-01-03')).toBe('Sunday');
    expect(isAvailableDate('2027-01-03', ['Monday', 'Wednesday', 'Friday'])).toBe(false);
  });

  it('selects the next configured working day', () => {
    expect(getNextAvailableDate(['Monday'], new Date('2027-01-03T12:00:00Z'))).toBe('2027-01-04');
  });
});
