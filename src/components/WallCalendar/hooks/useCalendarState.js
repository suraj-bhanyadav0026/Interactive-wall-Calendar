// === FILE: useCalendarState.js ===
import { useState, useMemo, useCallback, useReducer } from 'react';
import { getCalendarDays, countWorkingDays } from '../utils/dateUtils';
import { getHoliday } from '../utils/holidays';
import { useLocalStorage } from './useLocalStorage';

// Pre-defined hero images per month — using reliable Unsplash photo IDs
const MONTH_IMAGES = [
  "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=800&q=80", // Jan - snow mountains
  "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80", // Feb - hearts
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80", // Mar - flowers field
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80", // Apr - cherry blossom
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80", // May - spring meadow
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", // Jun - beach
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80", // Jul - aerial ocean
  "https://images.unsplash.com/photo-1504700610630-ac6aba3536d3?auto=format&fit=crop&w=800&q=80", // Aug - sunflowers
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80", // Sep - autumn
  "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=800&q=80", // Oct - fall leaves
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80", // Nov - foggy forest
  "https://images.unsplash.com/photo-1418985991508-e47386d96a71?auto=format&fit=crop&w=800&q=80"  // Dec - winter snow
];

const NOTE_COLORS = ['#2563eb', '#e85d26', '#16a34a', '#9333ea', '#ca8a04'];

export function useCalendarState() {
  const currentDate = new Date();
  
  // Basic display state
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [isFlipping, setIsFlipping] = useState(false);
  const [showWeekNumbers, setShowWeekNumbers] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useLocalStorage('wall-calendar-theme', 'light');
  
  // Selection state
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [selectionPhase, setSelectionPhase] = useState('idle'); // 'idle' | 'selecting'
  const [hoveredDate, setHoveredDate] = useState(null);
  
  // Notes state
  const [notes, setNotes] = useLocalStorage('wall-calendar-notes', []);
  const [activeNoteText, setActiveNoteText] = useState('');
  
  // Handlers for month navigation
  const nextMonth = useCallback(() => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentMonth(prev => {
        if (prev === 11) {
          setCurrentYear(y => y + 1);
          return 0;
        }
        return prev + 1;
      });
      setIsFlipping(false);
    }, 250); // half of flip dur
  }, []);

  const prevMonth = useCallback(() => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentMonth(prev => {
        if (prev === 0) {
          setCurrentYear(y => y - 1);
          return 11;
        }
        return prev - 1;
      });
      setIsFlipping(false);
    }, 250);
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    if (currentMonth !== today.getMonth() || currentYear !== today.getFullYear()) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
        setIsFlipping(false);
      }, 250);
    }
  }, [currentMonth, currentYear]);

  // Day Interaction Handlers
  const handleDayClick = useCallback((date) => {
    // If clicking an already selected range that has both start and end, clear it
    if (selectionPhase === 'idle' && selectedStart && selectedEnd &&
        date >= Math.min(selectedStart, selectedEnd) && 
        date <= Math.max(selectedStart, selectedEnd)) {
      setSelectedStart(null);
      setSelectedEnd(null);
      return;
    }

    if (selectionPhase === 'idle') {
      setSelectedStart(date);
      setSelectedEnd(null);
      setSelectionPhase('selecting');
    } else if (selectionPhase === 'selecting') {
      if (date.getTime() < selectedStart.getTime()) {
        setSelectedEnd(selectedStart);
        setSelectedStart(date);
      } else {
        setSelectedEnd(date);
      }
      setSelectionPhase('idle');
      setHoveredDate(null);
    }
  }, [selectionPhase, selectedStart, selectedEnd]);

  // Handle note operations
  const saveNote = useCallback(() => {
    if (!activeNoteText.trim()) return;
    
    // Convert Dates to ISO strings for storage safely
    const startStr = selectedStart ? selectedStart.toISOString() : null;
    const endStr = selectedEnd ? selectedEnd.toISOString() : null;
    
    const newNote = {
      id: crypto.randomUUID(),
      startDate: startStr,
      endDate: endStr,
      text: activeNoteText.trim(),
      createdAt: new Date().toISOString(),
      label: startStr && endStr ? 'Selected Range' : `${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} (general)`,
      color: NOTE_COLORS[notes.length % NOTE_COLORS.length]
    };
    
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteText('');
  }, [activeNoteText, selectedStart, selectedEnd, currentYear, currentMonth, notes.length, setNotes]);

  const deleteNote = useCallback((id) => {
    setNotes(notes.filter(n => n.id !== id));
  }, [notes, setNotes]);

  const loadNote = useCallback((note) => {
    if (note.startDate && note.endDate) {
      setSelectedStart(new Date(note.startDate));
      setSelectedEnd(new Date(note.endDate));
      setSelectionPhase('idle');
    } else {
      setSelectedStart(null);
      setSelectedEnd(null);
      setSelectionPhase('idle');
    }
    setActiveNoteText(note.text);
  }, []);

  // Derived calendar grid
  const calendarDays = useMemo(() => {
    return getCalendarDays(currentYear, currentMonth, getHoliday);
  }, [currentYear, currentMonth]);

  // Derived stat values
  const rangeStats = useMemo(() => {
    if (!selectedStart || !selectedEnd) return null;
    
    const minDay = new Date(Math.min(selectedStart.getTime(), selectedEnd.getTime()));
    const maxDay = new Date(Math.max(selectedStart.getTime(), selectedEnd.getTime()));
    const totalDays = Math.round((maxDay - minDay) / (1000 * 60 * 60 * 24)) + 1;
    const workDays = countWorkingDays(minDay, maxDay, getHoliday);
    const weekends = totalDays - workDays; 
    
    return {
      totalDays,
      workDays,
      weekends
    };
  }, [selectedStart, selectedEnd]);
  
  return {
    currentMonth,
    currentYear,
    isFlipping,
    calendarDays,
    theme,
    setTheme,
    
    // Selection state & handlers
    selectedStart,
    selectedEnd,
    selectionPhase,
    hoveredDate,
    setHoveredDate,
    handleDayClick,
    
    // Month Nav
    nextMonth,
    prevMonth,
    goToToday,
    
    // Settings
    showWeekNumbers,
    setShowWeekNumbers,
    
    // Notes
    notes,
    activeNoteText,
    setActiveNoteText,
    saveNote,
    deleteNote,
    loadNote,
    
    // Metadata
    currentHeroImage: MONTH_IMAGES[currentMonth],
    rangeStats
  };
}
