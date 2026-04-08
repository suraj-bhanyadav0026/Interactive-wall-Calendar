// === FILE: SpiralBinding.jsx ===
import React from 'react';

/**
 * Renders the top decorative spiral binding of the wall calendar.
 * Uses purely CSS circles.
 */
export default function SpiralBinding({ count = 28 }) {
  // Generate array of binding circles
  const circles = Array.from({ length: count }, (_, i) => i);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      height: '32px',
      background: 'var(--paper)',
      padding: '0 12px',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      borderTopLeftRadius: '4px',
      borderTopRightRadius: '4px'
    }}>
      {circles.map(i => (
        <div key={i} style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          border: '2px solid #888',
          background: 'radial-gradient(circle at 30% 30%, #fff 0%, #d4d4d8 50%, #71717a 100%)',
          boxShadow: 'inset 0 -1px 3px rgba(0,0,0,0.3), 0 2px 2px rgba(0,0,0,0.1)',
          position: 'relative',
          top: '-4px' // Slightly raised above the calendar body
        }} />
      ))}
    </div>
  );
}
