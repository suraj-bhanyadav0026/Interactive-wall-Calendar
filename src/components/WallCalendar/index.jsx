// === FILE: WallCalendar/index.jsx ===
import React, { useRef, useCallback, useState, useEffect } from 'react';
import styles from './WallCalendar.module.css';
import { useCalendarState } from './hooks/useCalendarState';
import { formatDateRange, getCalendarDays } from './utils/dateUtils';
import { getHoliday } from './utils/holidays';
import SpiralBinding from './sub-components/SpiralBinding';
import HeroImage from './sub-components/HeroImage';
import DayCell from './sub-components/DayCell';
import NotesPanel from './sub-components/NotesPanel';

const MONTH_FULL = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const WEEKDAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

// ─── Theme Definitions ───────────────────────────────────────────────────────
const THEME_COLORS = {
  light: { bg: '#faf8f3', border: '#d4c9b0' },
  dark:  { bg: '#1a1a2a', border: '#3a3a5a' },
  sepia: { bg: '#f5edd6', border: '#c4a882' },
};

// ─── Mini Month Preview ───────────────────────────────────────────────────────
function MiniMonthPreview({ year, month }) {
  const days = getCalendarDays(year, month, getHoliday);
  return (
    <div style={{ opacity: 0.55, transform: 'scale(0.85)', transformOrigin: 'top center' }}>
      <div style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.65rem',
        fontWeight: 700,
        textAlign: 'center',
        color: 'var(--ink-light)',
        letterSpacing: '0.1em',
        marginBottom: '4px',
      }}>
        {MONTH_FULL[month].toUpperCase()}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        fontSize: '0.6rem',
        textAlign: 'center',
        color: 'var(--ink-light)',
      }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ fontWeight: 700, paddingBottom: '2px' }}>{d[0]}</div>
        ))}
        {days.map((d, i) => (
          <div
            key={i}
            style={{
              color: d.isCurrentMonth ? 'var(--ink)' : 'var(--ink-muted)',
              fontWeight: d.isToday ? 700 : 400,
              padding: '1px 0',
            }}
          >
            {d.dayOfMonth}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Range Stats Strip ────────────────────────────────────────────────────────
function RangeStats({ stats, selectedStart, selectedEnd }) {
  if (!stats || !selectedStart || !selectedEnd) return null;
  return (
    <div className={styles.statsStrip}>
      <strong>{stats.totalDays} day{stats.totalDays !== 1 ? 's' : ''} selected</strong>
      {' · '}
      <span>{stats.workDays} working day{stats.workDays !== 1 ? 's' : ''}</span>
      {' · '}
      <span>{stats.weekends} weekend day{stats.weekends !== 1 ? 's' : ''}</span>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function WallCalendar() {
  const state = useCalendarState();
  const {
    currentMonth, currentYear, isFlipping, calendarDays,
    theme, setTheme,
    selectedStart, selectedEnd, selectionPhase, hoveredDate,
    setHoveredDate, handleDayClick,
    nextMonth, prevMonth, goToToday,
    showWeekNumbers, setShowWeekNumbers,
    notes, activeNoteText, setActiveNoteText, saveNote, deleteNote, loadNote,
    currentHeroImage, rangeStats,
  } = state;

  // Touch gesture state for swipe to navigate
  const touchStartX = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) nextMonth();
      else prevMonth();
    }
    touchStartX.current = null;
  }, [nextMonth, prevMonth]);

  // Keyboard navigation inside grid
  const focusedCellIndex = useRef(null);
  const gridRef = useRef(null);

  const handleGridKeyDown = useCallback((e, date) => {
    if (e.key === 'Escape') {
      state.setSelectedStart && state.setSelectedStart(null);
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDayClick(date);
    }
  }, [handleDayClick, state]);

  const [animClass, setAnimClass] = useState('');
  const prevMonthRef = useRef(currentMonth);

  useEffect(() => {
    if (prevMonthRef.current !== currentMonth) {
      setAnimClass(styles.isFlippingIn);
      const t = setTimeout(() => setAnimClass(''), 250);
      prevMonthRef.current = currentMonth;
      return () => clearTimeout(t);
    }
  }, [currentMonth]);

  // Prev / next month values for mini-preview
  const prevMonthVal = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYearVal  = currentMonth === 0 ? currentYear - 1 : currentYear;
  const nextMonthVal = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYearVal  = currentMonth === 11 ? currentYear + 1 : currentYear;

  return (
    <div
      className={styles.calendarContainer}
      data-theme={theme}
      style={{ '--font-sans': "'Inter', sans-serif", '--font-serif': "'Playfair Display', serif" }}
    >
      {/* Screen-reader live region */}
      <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', left: '-9999px' }}>
        {`Showing ${MONTH_FULL[currentMonth]} ${currentYear}`}
      </div>

      <div
        className={`${styles.calendarCard} ${isFlipping ? styles.isFlippingOut : animClass}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 1. Spiral Binding */}
        <SpiralBinding count={28} />

        {/* 2. Hero Image */}
        <HeroImage
          imageUrl={currentHeroImage}
          month={currentMonth}
          year={currentYear}
          theme={theme}
        />

        {/* 3. Tools Strip: nav + theme + settings */}
        <div className={styles.toolsStrip}>
          {/* Left: navigation */}
          <div className={styles.navGroup}>
            <button
              className={styles.iconButton}
              onClick={prevMonth}
              aria-label="Previous month"
              title="Previous month"
            >
              ‹
            </button>
            <button
              className={styles.todayButton}
              onClick={goToToday}
              aria-label="Go to today"
            >
              Today
            </button>
            <button
              className={styles.iconButton}
              onClick={nextMonth}
              aria-label="Next month"
              title="Next month"
            >
              ›
            </button>
          </div>

          {/* Center: mini month previews */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <MiniMonthPreview year={prevYearVal} month={prevMonthVal} />
            <MiniMonthPreview year={nextYearVal} month={nextMonthVal} />
          </div>

          {/* Right: theme swatches + week number toggle */}
          <div className={styles.themeGroup}>
            <button
              className={styles.themeSwatch}
              style={{ background: '#faf8f3' }}
              data-active={theme === 'light'}
              onClick={() => setTheme('light')}
              title="Light theme"
              aria-label="Switch to light theme"
            />
            <button
              className={styles.themeSwatch}
              style={{ background: '#1a1a2a' }}
              data-active={theme === 'dark'}
              onClick={() => setTheme('dark')}
              title="Dark theme"
              aria-label="Switch to dark theme"
            />
            <button
              className={styles.themeSwatch}
              style={{ background: '#f5edd6', border: '2px solid #c4a882' }}
              data-active={theme === 'sepia'}
              onClick={() => setTheme('sepia')}
              title="Sepia theme"
              aria-label="Switch to sepia theme"
            />
            <button
              onClick={() => setShowWeekNumbers(p => !p)}
              title="Toggle week numbers"
              aria-label="Toggle week numbers"
              style={{
                background: showWeekNumbers ? 'var(--ink)' : 'transparent',
                color: showWeekNumbers ? 'var(--paper)' : 'var(--ink)',
                border: '1px solid rgba(128,128,128,0.3)',
                borderRadius: '4px',
                padding: '2px 7px',
                fontSize: '0.7rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                lineHeight: '1.6',
              }}
            >
              W#
            </button>
          </div>
        </div>

        {/* 4. Main Layout: Notes + Grid */}
        <div className={styles.mainLayout}>
          <NotesPanel
            notes={notes}
            activeNoteText={activeNoteText}
            setActiveNoteText={setActiveNoteText}
            saveNote={saveNote}
            deleteNote={deleteNote}
            loadNote={loadNote}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            currentMonth={currentMonth}
            currentYear={currentYear}
          />

          <div className={styles.calendarGridColumn}>
            {/* 4a. Selected range label */}
            {selectedStart && (
              <div style={{
                fontSize: '0.8rem',
                fontFamily: 'var(--font-sans)',
                color: 'var(--accent)',
                fontWeight: 600,
                marginBottom: '8px',
                minHeight: '20px',
              }}>
                {selectionPhase === 'selecting'
                  ? `📍 Click end date — started: ${formatDateRange(selectedStart, null)}`
                  : selectedEnd
                  ? `📅 ${formatDateRange(selectedStart, selectedEnd)}`
                  : `📍 ${formatDateRange(selectedStart, null)} — now click an end date`
                }
              </div>
            )}

            {/* 4b. Weekday Headers */}
            <div
              role="row"
              className={`${styles.weekdaysHeader} ${showWeekNumbers ? styles.withWeekNumbers : ''}`}
            >
              {showWeekNumbers && <div aria-hidden="true" style={{ textAlign: 'center' }}>Wk</div>}
              {WEEKDAYS.map(d => (
                <div key={d} aria-label={d}>{d}</div>
              ))}
            </div>

            {/* 4c. Days Grid */}
            <div
              role="grid"
              ref={gridRef}
              aria-label={`Calendar for ${MONTH_FULL[currentMonth]} ${currentYear}`}
              className={`${styles.daysGrid} ${showWeekNumbers ? styles.withWeekNumbers : ''}`}
            >
              {calendarDays.map((dayObj, i) => {
                const isRowStart = i % 7 === 0;
                const weekNum = isRowStart ? dayObj.weekNumber || '' : null;

                return (
                  <React.Fragment key={dayObj.date.toISOString()}>
                    {showWeekNumbers && isRowStart && (
                      <div className={styles.weekNumber} role="rowheader" aria-label={`Week ${weekNum}`}>
                        {weekNum}
                      </div>
                    )}
                    <DayCell
                      dayObj={dayObj}
                      index={i}
                      selectedStart={selectedStart}
                      selectedEnd={selectedEnd}
                      selectionPhase={selectionPhase}
                      hoveredDate={hoveredDate}
                      onDayClick={handleDayClick}
                      onMouseEnter={setHoveredDate}
                      onMouseLeave={() => setHoveredDate(null)}
                      onKeyDown={(e) => handleGridKeyDown(e, dayObj.date)}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. Range Statistics Strip */}
        <RangeStats
          stats={rangeStats}
          selectedStart={selectedStart}
          selectedEnd={selectedEnd}
        />

        {/* 6. Footer */}
        <div style={{
          textAlign: 'center',
          padding: '10px',
          fontSize: '0.7rem',
          color: 'var(--ink-muted)',
          fontFamily: 'var(--font-sans)',
          borderTop: '1px solid rgba(128,128,128,0.08)',
          letterSpacing: '0.06em',
        }}>
          ← → Arrow keys to move · Enter to select · Esc to clear · Swipe to navigate
        </div>
      </div>
    </div>
  );
}
