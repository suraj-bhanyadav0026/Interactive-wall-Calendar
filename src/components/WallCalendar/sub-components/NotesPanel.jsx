// === FILE: NotesPanel.jsx ===
import React, { useState } from 'react';
import styles from '../WallCalendar.module.css';
import { formatDateRange } from '../utils/dateUtils';

/**
 * Notes panel with textarea, save, clipboard copy, and saved notes list.
 */
export default function NotesPanel({
  notes,
  activeNoteText,
  setActiveNoteText,
  saveNote,
  deleteNote,
  loadNote,
  selectedStart,
  selectedEnd,
  currentMonth,
  currentYear,
}) {
  const [showToast, setShowToast] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const MONTH_NAMES = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];

  const rangeLabel = selectedStart && selectedEnd
    ? `Note for ${formatDateRange(selectedStart, selectedEnd)}`
    : selectedStart
    ? `Note from ${formatDateRange(selectedStart, null)}`
    : `General notes for ${MONTH_NAMES[currentMonth]}`;

  const handleCopy = () => {
    const rangeStr = selectedStart && selectedEnd
      ? formatDateRange(selectedStart, selectedEnd)
      : MONTH_NAMES[currentMonth] + ' ' + currentYear;
    const text = `📅 ${rangeStr}\n📝 ${activeNoteText || '(No note text)'}`;
    navigator.clipboard.writeText(text).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2100);
    });
  };

  return (
    <div className={styles.notesColumn}>
      {/* Mobile accordion toggle */}
      <button
        className={styles.notesToggle}
        onClick={() => setIsMobileExpanded(p => !p)}
        aria-label="Toggle notes panel"
      >
        <span className={styles.notesHeader} style={{ marginBottom: 0 }}>
          📝 Notes
          <span className={styles.toggleIcon}>{isMobileExpanded ? '▲' : '▼'}</span>
        </span>
      </button>

      <div className={`${styles.notesPanelBody} ${isMobileExpanded ? styles.expanded : ''}`}>
        {/* Note heading */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--ink-light)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '8px',
          marginTop: '16px',
        }}>
          {rangeLabel}
        </p>

        {/* Textarea */}
        <textarea
          className={styles.textarea}
          value={activeNoteText}
          onChange={e => setActiveNoteText(e.target.value)}
          placeholder="Add a note for this period..."
          aria-label={rangeLabel}
          rows={5}
        />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button className={styles.saveBtn} onClick={saveNote} style={{ flex: 1 }}>
            Save Note
          </button>
          <button
            className={styles.iconButton}
            onClick={handleCopy}
            title="Copy to clipboard"
            aria-label="Copy note to clipboard"
            style={{ width: '40px', height: '40px', border: '1px solid rgba(128,128,128,0.2)', borderRadius: '6px', flexShrink: 0 }}
          >
            📋
          </button>
        </div>

        {/* Saved Notes List */}
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          Saved Notes
        </div>

        {notes.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
            No notes yet. Select dates and start writing.
          </p>
        ) : (
          <div className={styles.savedNotesList}>
            {notes.map(note => (
              <div
                key={note.id}
                className={styles.noteCard}
                style={{ '--note-color': note.color }}
                onClick={() => loadNote(note)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') loadNote(note); }}
                aria-label={`Load note: ${note.label}`}
              >
                <div className={styles.noteLabel}>{note.label}</div>
                <div className={styles.notePreview}>{note.text}</div>
                <button
                  onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                  aria-label="Delete note"
                  title="Delete note"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--ink-muted)', fontSize: '0.7rem', marginTop: '6px',
                    padding: '2px 0', display: 'block',
                  }}
                >
                  ✕ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clipboard toast */}
      {showToast && (
        <div className={styles.toast}>✅ Copied to clipboard!</div>
      )}
    </div>
  );
}
