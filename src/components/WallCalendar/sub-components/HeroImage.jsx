// === FILE: HeroImage.jsx ===
import React, { useState, useEffect } from 'react';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL',
  'MAY', 'JUNE', 'JULY', 'AUGUST',
  'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

/**
 * Full-bleed hero image panel with crossfade transition between months.
 * The month name and year are rendered over the image in Playfair Display serif.
 */
export default function HeroImage({ imageUrl, month, year, theme }) {
  const [displayedImage, setDisplayedImage] = useState(imageUrl);
  const [nextImage, setNextImage] = useState(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (imageUrl !== displayedImage) {
      setNextImage(imageUrl);
      setFading(true);
      const timer = setTimeout(() => {
        setDisplayedImage(imageUrl);
        setNextImage(null);
        setFading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [imageUrl]);

  return (
    <div style={{
      position: 'relative',
      height: '260px',
      overflow: 'hidden',
      backgroundColor: '#111',
    }}>
      {/* Current image */}
      <img
        src={displayedImage}
        alt={`${MONTH_NAMES[month]} hero`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          inset: 0,
          opacity: fading ? 0 : 1,
          transition: 'opacity 400ms ease',
        }}
      />

      {/* Next image (fades in) */}
      {nextImage && (
        <img
          src={nextImage}
          alt="next month"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            inset: 0,
            opacity: fading ? 1 : 0,
            transition: 'opacity 400ms ease',
          }}
        />
      )}

      {/* Gradient overlay for text legibility */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: theme === 'dark'
          ? 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 100%)'
          : 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.05) 60%)',
        zIndex: 1,
      }} />

      {/* Diagonal color accent block — bottom left */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '60px',
        height: '60px',
        background: 'var(--accent)',
        clipPath: 'polygon(0 100%, 100% 100%, 0 0)',
        zIndex: 2,
        opacity: 0.9,
      }} />

      {/* Month / Year text — bottom right */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '28px',
        zIndex: 2,
        textAlign: 'right',
        color: '#fff',
        lineHeight: 1,
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(0.85rem, 2vw, 1rem)',
          fontWeight: 400,
          letterSpacing: '0.2em',
          opacity: 0.85,
          marginBottom: '4px',
        }}>
          {year}
        </div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}>
          {MONTH_NAMES[month]}
        </div>
      </div>
    </div>
  );
}
