// === FILE: DayCell.jsx ===
import React, { useCallback } from 'react';
import styles from '../WallCalendar.module.css';
import { isInRange } from '../utils/dateUtils';

/**
 * Individual day cell with all visual states:
 * - today ring
 * - selected start/end pill
 * - in-range highlight
 * - holiday dot with tooltip
 * - staggered inkDrop entrance animation
 * - full keyboard accessibility
 */
export default function DayCell({
  dayObj,
  index,
  selectedStart,
  selectedEnd,
  selectionPhase,
  hoveredDate,
  onDayClick,
  onMouseEnter,
  onMouseLeave,
  onKeyDown,
}) {
  const { date, dayOfMonth, isCurrentMonth, isToday, isWeekend, isSunday, holiday } = dayObj;

  // Determine effective end for preview (during 'selecting' phase, use hovered date)
  const effectiveEnd = selectionPhase === 'selecting' && hoveredDate ? hoveredDate : selectedEnd;

  const isSelected =
    (selectedStart && date.getTime() === selectedStart.getTime()) ||
    (selectedEnd && date.getTime() === selectedEnd.getTime());

  const isStart = selectedStart && date.getTime() === selectedStart.getTime();
  const isEnd = effectiveEnd && date.getTime() === effectiveEnd.getTime();

  const inRange = isInRange(date, selectedStart, effectiveEnd);

  // Build className string
  let wrapperClasses = [styles.dayCellWrapper];
  if (!isCurrentMonth) wrapperClasses.push(styles.isOtherMonth);
  if (isWeekend && !isSelected) wrapperClasses.push(styles.isWeekend);
  if (isToday) wrapperClasses.push(styles.isToday);
  if (inRange) wrapperClasses.push(styles.inRange);
  if (isStart) wrapperClasses.push(styles.selectionStart);
  if (isEnd) wrapperClasses.push(styles.selectionEnd);

  let contentClasses = [styles.dayContent, styles.staggerEnter];
  if (isSelected) contentClasses.push(styles.selected);

  // Format full date for aria-label
  const fullLabel = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const ariaLabel = `${fullLabel}${isSelected ? ', selected' : ''}${holiday ? `, ${holiday.name}` : ''}${isToday ? ', today' : ''}`;

  const handleClick = useCallback(() => {
    onDayClick(date);
  }, [date, onDayClick]);

  const handleMouseEnter = useCallback(() => {
    onMouseEnter(date);
  }, [date, onMouseEnter]);

  return (
    <div
      className={wrapperClasses.join(' ')}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={onKeyDown}
      role="gridcell"
      tabIndex={isCurrentMonth ? 0 : -1}
      aria-selected={isSelected}
      aria-label={ariaLabel}
      data-tooltip={holiday ? holiday.name : undefined}
      style={{ '--day-index': index }}
    >
      <time
        dateTime={date.toISOString().split('T')[0]}
        className={contentClasses.join(' ')}
        style={{
          animationDelay: `calc(${index} * 15ms)`,
        }}
      >
        {dayOfMonth}
      </time>

      {/* Holiday dot */}
      {holiday && isCurrentMonth && (
        <span
          className={`${styles.holidayDot} ${holiday.type === 'national' ? styles.holidayNational : styles.holidayFestival}`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
