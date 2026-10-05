'use client';

import { useEffect, useState } from 'react';

// ---- Live clock for welcome screen ----
function WelcomeClock() {
  const [time, setTime] = useState('--:--:--');
  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString('pt-BR', { hour12: false }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{time}</span>;
}

// ---- Central AI orb icon with decorative rings ----
function WelcomeOrb() {
  return (
    <div
      style={{
        position: 'relative',
        width: 220,
        height: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer slow ring */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 220,
          height: 220,
          borderRadius: '50%',
          border: '1px solid rgba(0, 212, 255, 0.10)',
          animation: 'hud-spin-cw 44s linear infinite',
        }}
      />
      {/* Middle dashed ring */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 168,
          height: 168,
          borderRadius: '50%',
          border: '1px dashed rgba(0, 212, 255, 0.16)',
          animation: 'hud-spin-ccw 26s linear infinite',
        }}
      />
      {/* Outer glow ring */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 264,
          height: 264,
          borderRadius: '50%',
          border: '1px solid rgba(0, 212, 255, 0.05)',
          animation: 'hud-spin-cw 62s linear infinite',
        }}
      />

      {/* Center SVG icon */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          animation: 'hud-pulse-glow 3s ease-in-out infinite',
        }}
      >
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Concentric circles */}
          <circle cx="36" cy="36" r="34" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.3" />
          <circle cx="36" cy="36" r="24" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.6" />
          <circle cx="36" cy="36" r="14" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.4" />
          {/* Core glow */}
          <circle cx="36" cy="36" r="8" fill="rgba(0,212,255,0.15)" />
          <circle cx="36" cy="36" r="4.5" fill="#00d4ff" fillOpacity="0.85" />
          {/* Cross hairs */}
          <line x1="36" y1="10" x2="36" y2="19" stroke="#00d4ff" strokeOpacity="0.45" strokeWidth="1" />
          <line x1="36" y1="53" x2="36" y2="62" stroke="#00d4ff" strokeOpacity="0.45" strokeWidth="1" />
          <line x1="10" y1="36" x2="19" y2="36" stroke="#00d4ff" strokeOpacity="0.45" strokeWidth="1" />
          <line x1="53" y1="36" x2="62" y2="36" stroke="#00d4ff" strokeOpacity="0.45" strokeWidth="1" />
          {/* Diagonal ticks */}
          <line x1="16" y1="16" x2="21" y2="21" stroke="#00d4ff" strokeOpacity="0.25" strokeWidth="0.8" />
          <line x1="51" y1="51" x2="56" y2="56" stroke="#00d4ff" strokeOpacity="0.25" strokeWidth="0.8" />
          <line x1="56" y1="16" x2="51" y2="21" stroke="#00d4ff" strokeOpacity="0.25" strokeWidth="0.8" />
          <line x1="21" y1="51" x2="16" y2="56" stroke="#00d4ff" strokeOpacity="0.25" strokeWidth="0.8" />
        </svg>
      </div>
    </div>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div
      ref={ref}
      style={{
        background: '#000308',
        fontFamily: 'var(--font-mono), "Courier New", monospace',
      }}
      className="relative flex h-svh w-svw flex-col items-center justify-center overflow-hidden"
    >
      {/* Background grid + vignette */}
      <div className="hud-bg-grid" aria-hidden="true" />
      <div className="hud-bg-vignette" aria-hidden="true" />

      {/* Top decoration bar */}
      <header
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 z-20"
        style={{
          borderBottom: '1px solid rgba(0, 212, 255, 0.10)',
          background: 'rgba(0, 3, 10, 0.92)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00d4ff',
              boxShadow: '0 0 8px rgba(0,212,255,0.6)',
              animation: 'hud-dot-blink 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontSize: 12,
              letterSpacing: '0.38em',
              color: '#00d4ff',
              fontWeight: 700,
              textShadow: '0 0 16px rgba(0,212,255,0.4)',
              animation: 'hud-text-flicker 9s ease-in-out infinite',
            }}
          >
            J.A.R.V.I.S
          </span>
        </div>
        <span style={{ fontSize: 13, letterSpacing: '0.14em', color: 'rgba(0,212,255,0.7)', fontWeight: 700 }}>
          <WelcomeClock />
        </span>
        <span style={{ fontSize: 9, letterSpacing: '0.22em', color: 'rgba(0,212,255,0.3)' }}>
          v3.0.1
        </span>
      </header>

      {/* ── Main welcome content ── */}
      <div
        className="relative z-10 flex flex-col items-center text-center"
        style={{ gap: 0 }}
      >
        {/* Animated orb */}
        <WelcomeOrb />

        {/* Title */}
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '0.52em',
            color: '#00d4ff',
            textShadow: '0 0 30px rgba(0,212,255,0.4), 0 0 60px rgba(0,212,255,0.15)',
            animation: 'hud-text-flicker 11s ease-in-out infinite',
          }}
        >
          J.A.R.V.I.S
        </div>

        <div
          style={{
            fontSize: 9,
            letterSpacing: '0.38em',
            color: 'rgba(0,212,255,0.38)',
            marginTop: 8,
            marginBottom: 36,
            textTransform: 'uppercase',
          }}
        >
          Assistente de Voz Avançado v3.0
        </div>

        {/* Start button */}
        <button
          id="start-jarvis-btn"
          onClick={onStartCall}
          className="hud-start-button"
        >
          {startButtonText}
        </button>

        {/* System status indicators */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 32,
            alignItems: 'center',
          }}
        >
          {[
            { label: 'IA', delay: '0s' },
            { label: 'VOZ', delay: '0.5s' },
            { label: 'API', delay: '1s' },
          ].map(({ label, delay }) => (
            <div
              key={label}
              style={{ display: 'flex', alignItems: 'center', gap: 7 }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#00ff88',
                  boxShadow: '0 0 6px rgba(0,255,136,0.6)',
                  animation: `hud-dot-blink 1.5s ease-in-out ${delay} infinite`,
                }}
              />
              <span
                style={{
                  fontSize: 8,
                  letterSpacing: '0.22em',
                  color: 'rgba(0,212,255,0.38)',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom decoration bar */}
      <footer
        className="absolute bottom-0 left-0 right-0 flex items-center justify-center px-6 py-2 z-20"
        style={{
          borderTop: '1px solid rgba(0, 212, 255, 0.08)',
          background: 'rgba(0, 3, 10, 0.88)',
        }}
      >
        <span style={{ fontSize: 8, letterSpacing: '0.22em', color: 'rgba(0,212,255,0.25)' }}>
          SISTEMA PRONTO · AGUARDANDO INICIALIZAÇÃO
        </span>
      </footer>
    </div>
  );
};
