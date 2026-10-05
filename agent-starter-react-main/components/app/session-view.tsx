'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  useSessionContext,
  useSessionMessages,
  useTrackVolume,
  useVoiceAssistant,
  useRemoteParticipants,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { AppConfig } from '@/app-config';
import {
  AgentControlBar,
  type AgentControlBarControls,
} from '@/components/agents-ui/agent-control-bar';
import { TileLayout } from '@/components/app/tile-layout';
import { cn } from '@/lib/shadcn/utils';
import { Shimmer } from '../ai-elements/shimmer';

const MotionBottom = motion.create('div');

const MotionMessage = motion.create(Shimmer);

const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut' as const,
  },
};

const SHIMMER_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      transition: {
        ease: 'easeIn' as const,
        duration: 0.5,
        delay: 0.8,
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        ease: 'easeIn' as const,
        duration: 0.5,
        delay: 0,
      },
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}

interface SessionViewProps {
  appConfig: AppConfig;
  onManualDisconnect?: () => void;
}

// --- Sub-componente para controle de performance da Orb ---
const VantaController = ({ vantaRef }: { vantaRef: React.MutableRefObject<any> }) => {
  const { audioTrack } = useVoiceAssistant();
  const volume = useTrackVolume(audioTrack);

  useEffect(() => {
    const effect = vantaRef.current;
    if (!effect) return;

    // Atualizar Chaos conforme Volume (Reatividade à voz)
    const baseChaos = 3.0;
    const voiceChaos = volume * 7.0;
    const finalChaos = baseChaos + voiceChaos;

    if (Math.abs(effect.options.chaos - finalChaos) > 0.05) {
      effect.setOptions({ chaos: finalChaos });
    }
  }, [volume, vantaRef]);

  return null;
};

// --- Componente Modular da Orb com seu próprio ciclo de vida ---
const VantaOrb = ({ isConnected, color, vantaRef }: { isConnected: boolean, color: number, vantaRef: React.MutableRefObject<any> }) => {
  const localRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let vantaEffect: any = null;
    let attempts = 0;
    let initTimer: NodeJS.Timeout;

    const tryInitVanta = () => {
      const el = localRef.current;
      const win = window as any;
      const hasVanta = !!win.VANTA?.TRUNK;
      const hasP5 = !!win.p5;

      if (el && hasVanta && hasP5) {
        try {
          // A cor agora vem via prop
          vantaEffect = win.VANTA.TRUNK({
            el: el,
            p5: win.p5,
            mouseControls: false,
            touchControls: false,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: color,
            backgroundColor: 0x000000,
            spacing: 0.0,
            chaos: 3.0,
          });
          vantaRef.current = vantaEffect;
        } catch (e) {
          console.error('Vanta Orb Init Error:', e);
          attempts++;
          if (attempts < 10) initTimer = setTimeout(tryInitVanta, 500);
        }
      } else {
        attempts++;
        if (attempts < 50) initTimer = setTimeout(tryInitVanta, 100);
      }
    };

    tryInitVanta();

    return () => {
      clearTimeout(initTimer);
      if (vantaEffect) {
        try {
          if (vantaRef.current === vantaEffect) {
            vantaRef.current = null;
          }
          vantaEffect.destroy();
        } catch (e) { }
      }
    };
  }, [isConnected]);

  return (
    <div
      ref={localRef}
      className="w-[1000px] h-[1000px]"
      style={{
        transform: 'scale(0.5) translateY(-15%)',
        transformOrigin: 'center center',
      }}
    />
  );
};

// ============================================================
//  HUD UI COMPONENTS — purely visual, no logic modification
// ============================================================

/** Live clock that updates every second */
const LiveClock = () => {
  const [time, setTime] = useState('--:--:--');
  const [date, setDate] = useState('--/--/----');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR', { hour12: false }));
      setDate(now.toLocaleDateString('pt-BR'));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hud-clock-section">
      <span className="hud-clock-time">{time}</span>
      <span className="hud-clock-date">{date}</span>
    </div>
  );
};

/** Top bar: logo/status — clock — metrics */
const HudTopBar = ({
  isConnected,
  agentPersona,
  agentState,
}: {
  isConnected: boolean;
  agentPersona: string;
  agentState: string;
}) => {
  const personaLabel = agentPersona === 'alice' ? 'A.L.I.C.E' : 'J.A.R.V.I.S';

  return (
    <header className="hud-top-bar">
      {/* Left: logo + connection status */}
      <div className="hud-logo-section">
        <span className="hud-logo-name">{personaLabel}</span>
        <div className="hud-status-indicator">
          <div className={cn('hud-status-dot', isConnected && 'online')} />
          <span className={cn('hud-status-label', isConnected && 'online')}>
            {isConnected ? 'ONLINE' : 'AGUARDANDO'}
          </span>
        </div>
      </div>

      {/* Center: live clock */}
      <LiveClock />

      {/* Right: system metrics */}
      <div className="hud-top-metrics">
        <div className="hud-metric-item">
          <span className="hud-metric-label">ESTADO</span>
          <span className="hud-metric-value">{(agentState || 'IDLE').toUpperCase()}</span>
        </div>
        <div className="hud-metric-item">
          <span className="hud-metric-label">PROTOCOLO</span>
          <span className="hud-metric-value">LIVEKIT</span>
        </div>
        <div className="hud-metric-item">
          <span className="hud-metric-label">VERSÃO</span>
          <span className="hud-metric-value">3.0.1</span>
        </div>
      </div>
    </header>
  );
};

/** Left info panel with system data and message log */
const HudLeftPanel = ({
  messages,
  isConnected,
  agentPersona,
  agentState,
}: {
  messages: any[];
  isConnected: boolean;
  agentPersona: string;
  agentState: string;
}) => {
  const recentMessages = messages.slice(-5);

  return (
    <aside className="hud-left-panel">
      {/* Animated scan line effect */}
      <div className="hud-panel-scan" aria-hidden="true" />

      <div className="hud-panel-title">// SISTEMA</div>

      {/* Agent identification */}
      <div className="hud-panel-section">
        <div className="hud-section-label">Identificação</div>
        <div className="hud-info-row">
          <span className="hud-info-key">AGENTE</span>
          <span className="hud-info-val">
            {agentPersona === 'alice' ? 'ALICE' : 'JARVIS'}
          </span>
        </div>
        <div className="hud-info-row">
          <span className="hud-info-key">STATUS</span>
          <span className={cn('hud-info-val', isConnected && 'active')}>
            {isConnected ? 'CONECTADO' : 'OFFLINE'}
          </span>
        </div>
        <div className="hud-info-row">
          <span className="hud-info-key">MODO</span>
          <span className="hud-info-val">VOZ + IA</span>
        </div>
      </div>

      {/* Network info */}
      <div className="hud-panel-section">
        <div className="hud-section-label">Rede</div>
        <div className="hud-info-row">
          <span className="hud-info-key">CODEC</span>
          <span className="hud-info-val">OPUS</span>
        </div>
        <div className="hud-info-row">
          <span className="hud-info-key">SEGURANÇA</span>
          <span className="hud-info-val">TLS 1.3</span>
        </div>
        <div className="hud-info-row">
          <span className="hud-info-key">QUALIDADE</span>
          <span className="hud-info-val">HD</span>
        </div>
      </div>

      {/* Voice analysis animated bars */}
      <div className="hud-panel-section">
        <div className="hud-section-label">Análise de Voz</div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="hud-bar-track">
            <div
              className="hud-bar-fill"
              style={{
                animationDelay: `${i * 0.38}s`,
                animationDuration: `${2.4 + i * 0.45}s`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Message log */}
      {recentMessages.length > 0 && (
        <div className="hud-panel-section" style={{ flex: 1, overflow: 'hidden' }}>
          <div className="hud-section-label">Log</div>
          <div className="hud-message-log">
            {recentMessages.map((msg: any, i: number) => (
              <div key={i} className="hud-log-entry">
                <span className="hud-log-prefix">
                  {msg.from?.isLocal ? '[VOCÊ]' : '[JARVIS]'}
                </span>
                <span className="hud-log-text">
                  {(msg.message as string)?.slice(0, 38)}
                  {(msg.message as string)?.length > 38 ? '…' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

/** Decorative spinning rings around the Vanta orb */
const HudRings = () => (
  <div className="hud-rings-wrapper" aria-hidden="true">
    <div className="hud-ring hud-ring-1" />
    <div className="hud-ring hud-ring-2" />
    <div className="hud-ring hud-ring-3" />
  </div>
);

// ============================================================
//  MAIN SessionView
// ============================================================

export const SessionView = ({
  appConfig,
  onManualDisconnect,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const [chatOpen, setChatOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<any>(null);

  // Monitora participantes para detectar Persona (Alice/Járvis)
  const participants = useRemoteParticipants();
  const agentParticipant = participants.find(p => !p.isLocal);
  const agentPersona = agentParticipant?.attributes?.["agent_persona"] || "jarvis";

  // Agent state for HUD display
  const { state: agentState } = useVoiceAssistant();

  // Definição de Cores
  const PERSONA_COLORS = {
    alice: 0xff69b4,
    jarvis: 0x1da3b9,
  };
  const currentColor = PERSONA_COLORS[agentPersona as keyof typeof PERSONA_COLORS] || PERSONA_COLORS.jarvis;

  useEffect(() => {
    const loadScript = (src: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (typeof document === 'undefined') return resolve(false);
        if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const setup = async () => {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.trunk.min.js');
    };
    setup();
  }, []);

  const controls: AgentControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsScreenShare,
  };

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;
    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleDisconnect = () => {
    if (onManualDisconnect) onManualDisconnect();
    try {
      if (session.end) session.end();
    } catch (e) {
      console.warn("Erro ao desconectar sessão:", e);
    }
  };

  return (
    <section
      className="hud-main relative flex h-svh w-svw flex-col overflow-hidden"
      {...props}
    >
      {/* Logic-only: syncs Vanta chaos with voice volume */}
      <VantaController vantaRef={vantaEffectRef} />

      {/* Background decorations */}
      <div className="hud-bg-grid" aria-hidden="true" />
      <div className="hud-bg-vignette" aria-hidden="true" />

      {/* ── TOP BAR ── */}
      <HudTopBar
        isConnected={session.isConnected}
        agentPersona={agentPersona}
        agentState={String(agentState || 'idle')}
      />

      {/* ── MAIN AREA (left panel + center stage) ── */}
      <div className="hud-main-area">
        {/* Left info panel */}
        <HudLeftPanel
          messages={messages}
          isConnected={session.isConnected}
          agentPersona={agentPersona}
          agentState={String(agentState || 'idle')}
        />

        {/* Center stage: Vanta orb + rings + JARVIS label + video tiles */}
        <div className="hud-center-stage">
          {/* Vanta orb — full-bleed background of this area */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={session.isConnected ? `vanta-${agentPersona}` : 'vanta-disconnected'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center p5-canvas-container"
              >
                <VantaOrb
                  isConnected={session.isConnected}
                  color={currentColor}
                  vantaRef={vantaEffectRef}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Decorative HUD rings */}
          <HudRings />

          {/* JARVIS / ALICE branding label */}
          <div className="hud-jarvis-label" aria-hidden="true">
            <div className="hud-jarvis-name">
              {agentPersona === 'alice' ? 'A.L.I.C.E' : 'J.A.R.V.I.S'}
            </div>
            <div className="hud-jarvis-sub">
              {session.isConnected ? 'SISTEMA ATIVO' : 'AGUARDANDO COMANDO'}
            </div>
          </div>

          {/* Camera / screen-share video tiles */}
          <div className="relative z-10">
            <TileLayout chatOpen={chatOpen} />
          </div>
        </div>
      </div>

      {/* ── BOTTOM CONTROL BAR ── */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="hud-bottom-bar relative z-50 px-4 py-2"
      >
        {appConfig.isPreConnectBufferEnabled && (
          <AnimatePresence>
            {messages.length === 0 && (
              <MotionMessage
                key="pre-connect-message"
                duration={2}
                aria-hidden={messages.length > 0}
                {...SHIMMER_MOTION_PROPS}
                className="pointer-events-none mx-auto block w-full max-w-2xl pb-3 text-center text-sm font-semibold hud-shimmer-text"
              >
                O Jarvis está ouvindo, pode falar...
              </MotionMessage>
            )}
          </AnimatePresence>
        )}

        <div className="relative mx-auto max-w-2xl pb-2 md:pb-4 bg-transparent">
          <AgentControlBar
            variant="livekit"
            controls={controls}
            isChatOpen={chatOpen}
            isConnected={true}
            onDisconnect={handleDisconnect}
            onIsChatOpenChange={setChatOpen}
          />
        </div>
      </MotionBottom>
    </section>
  );
};
