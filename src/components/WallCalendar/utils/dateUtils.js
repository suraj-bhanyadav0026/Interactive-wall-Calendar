// === FILE: dateUtils.js ===

/**
 * Calculates the ISO 8601 week number for a given date.
 * ISO weeks start on Monday, and the first week of the year is the week
 * containing the first Thursday of the year.
 */
export function getISOWeekNumber(date) {
  const target = new Date(date.valueOf());
  // ISO week starts on Monday, so shift days: Thursday is 4, etc.
  const dayNr = (date.getDay() + 6) % 7;
  // Set the target to the Thursday of this week
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  
  // Find the first Thursday of the year
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  
  // Calculate the difference in weeks
  return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
}

/**
 * Returns an array of day objects for the calendar grid.
 * Ensures the calendar always starts on a Monday and shows exactly 6 weeks (42 days)
 * to maintain consistent height.
 */
export function getCalendarDays(year, month, getHoliday) {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Day of week of the 1st of the month (0 = Sunday, 1 = Monday, ...)
  let startDayOfWeek = firstDayOfMonth.getDay();
  // Adjust to make Monday = 0, Sunday = 6
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  
  const days = [];
  
  // Calculate the start date of the calendar grid (could be in the previous month)
  const startDate = new Date(year, month, 1 - startDayOfWeek);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Always push 42 days (6 rows of 7 days) to ensure calendar height stays consistent
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    currentDate.setHours(0, 0, 0, 0);
    
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isSunday = dayOfWeek === 0;
    const isCurrentMonth = currentDate.getMonth() === month && currentDate.getFullYear() === year;
    
    days.push({
      date: currentDate,
      dayOfMonth: currentDate.getDate(),
      isCurrentMonth,
      isToday: currentDate.getTime() === today.getTime(),
      isWeekend,
      isSunday,
      weekNumber: dayOfWeek === 1 ? getISOWeekNumber(currentDate) : null, // Only store week number on Mondays
      holiday: getHoliday ? getHoliday(currentDate) : null
    });
  }
  
  return days;
}

/**
 * Checks if a given date falls within a selected range.
 */
export function isInRange(date, start, end) {
  if (!start || !end) return false;
  const d = date.getTime();
  const s = start.getTime();
  const e = end.getTime();
  return d >= Math.min(s, e) && d <= Math.max(s, e);
}

/**
 * Formats a date range into a readable string like "Apr 15 – 22, 2026"
 */
export function formatDateRange(start, end) {
  if (!start && !end) return "";
  
  const optionsMonth = { month: 'short' };
  const getMonthAbbr = (d) => d.toLocaleDateString('en-US', optionsMonth);
  
  if (start && !end) {
    return `${getMonthAbbr(start)} ${start.getDate()}, ${start.getFullYear()}`;
  }
  
  // Ensure start is before end
  const s = start.getTime() <= end.getTime() ? start : end;
  const e = start.getTime() <= end.getTime() ? end : start;
  
  const startMonth = getMonthAbbr(s);
  const endMonth = getMonthAbbr(e);
  
  if (s.getFullYear() !== e.getFullYear()) {
    return `${startMonth} ${s.getDate()}, ${s.getFullYear()} – ${endMonth} ${e.getDate()}, ${e.getFullYear()}`;
  } else if (s.getMonth() !== e.getMonth()) {
    return `${startMonth} ${s.getDate()} – ${endMonth} ${e.getDate()}, ${s.getFullYear()}`;
  } else if (s.getDate() !== e.getDate()) {
    return `${startMonth} ${s.getDate()} – ${e.getDate()}, ${s.getFullYear()}`;
  } else {
    return `${startMonth} ${s.getDate()}, ${s.getFullYear()}`;
  }
}

/**
 * Calculates the number of working days in a range, excluding weekends and holidays.
 */
export function countWorkingDays(start, end, getHoliday) {
  if (!start || !end) return 0;
  
  const s = start.getTime() <= end.getTime() ? start : end;
  const e = start.getTime() <= end.getTime() ? end : start;
  
  let workingDays = 0;
  let current = new Date(s);
  current.setHours(0, 0, 0, 0);
  
  const endLimit = new Date(e);
  endLimit.setHours(0, 0, 0, 0);
  
  while (current <= endLimit) {
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = getHoliday && getHoliday(current) !== null;
    
    if (!isWeekend && !isHoliday) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return workingDays;
}
