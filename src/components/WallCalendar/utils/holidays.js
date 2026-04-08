// === FILE: holidays.js ===

/**
 * Hardcoded holiday data. Contains major Indian national holidays and international holidays.
 * In a real application, this would come from an API or a more comprehensive date library.
 */
const HOLIDAYS = [
  // 2026 Holidays
  { date: '2026-01-01', name: "New Year's Day", type: 'festival' },
  { date: '2026-01-26', name: 'Republic Day', type: 'national' },
  { date: '2026-02-14', name: "Valentine's Day", type: 'festival' },
  { date: '2026-03-03', name: 'Holi', type: 'festival' }, // Approx 2026 date
  { date: '2026-04-03', name: 'Good Friday', type: 'national' },
  { date: '2026-08-15', name: 'Independence Day', type: 'national' },
  { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'national' },
  { date: '2026-10-08', name: 'Diwali (Deepavali)', type: 'festival' }, // Approx 2026 date
  { date: '2026-12-25', name: 'Christmas', type: 'festival' },
  { date: '2026-12-31', name: "New Year's Eve", type: 'festival' },
  
  // A few dynamic/fixed date ones that repeat every year
  { date: '*-01-01', name: "New Year's Day", type: 'festival' },
  { date: '*-01-26', name: 'Republic Day', type: 'national' },
  { date: '*-08-15', name: 'Independence Day', type: 'national' },
  { date: '*-10-02', name: 'Gandhi Jayanti', type: 'national' },
  { date: '*-12-25', name: 'Christmas', type: 'festival' },
  { date: '*-12-31', name: "New Year's Eve", type: 'festival' }
];

/**
 * Looks up a holiday for a specific Date object.
 * Returns the holiday object { name, type } or null if none.
 */
export function getHoliday(date) {
  if (!date) return null;
  
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const y = date.getFullYear();
  
  const exactKey = `${y}-${m}-${d}`;
  const wildKey = `*-${m}-${d}`;
  
  // Match exact year first, then wildcard repeating holidays
  const holiday = HOLIDAYS.find(h => h.date === exactKey) || HOLIDAYS.find(h => h.date === wildKey);
  
  if (holiday) {
    return {
      name: holiday.name,
      type: holiday.type  // 'national' for red dot, 'festival' for gold dot
    };
  }
  
  return null;
}
