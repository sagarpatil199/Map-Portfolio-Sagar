import { create } from 'zustand';
import type { PortfolioImage, SectionId } from '../data/portfolio';

export type Stage = 'loading' | 'hero' | 'journey' | 'location' | 'intro' | 'explore';

export const JOURNEY_STEPS = ['Earth', 'Asia', 'India', 'Karnataka', 'Belagavi'] as const;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LightboxState {
  images: PortfolioImage[];
  index: number;
  origin: Rect | null;
}

interface AppState {
  stage: Stage;
  step: number;
  progress: number;
  webgl: boolean;
  lowPower: boolean;
  activeSection: SectionId | null;
  hovered: SectionId | null;
  lightbox: LightboxState | null;
  flash: number;
  setStage: (stage: Stage) => void;
  setStep: (step: number) => void;
  setProgress: (progress: number) => void;
  setWebgl: (webgl: boolean) => void;
  setHovered: (id: SectionId | null) => void;
  setActiveSection: (id: SectionId | null) => void;
  openLightbox: (images: PortfolioImage[], index: number, origin: Rect | null) => void;
  setLightboxIndex: (index: number) => void;
  closeLightbox: () => void;
  triggerFlash: () => void;
}

const isLowPower = () => {
  if (typeof window === 'undefined') return false;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return small || coarse || (mem !== undefined && mem <= 4);
};

export const useApp = create<AppState>((set) => ({
  stage: 'loading',
  step: 0,
  progress: 0,
  webgl: true,
  lowPower: isLowPower(),
  activeSection: null,
  hovered: null,
  lightbox: null,
  flash: 0,
  setStage: (stage) => set({ stage }),
  setStep: (step) => set((s) => (s.step === step ? s : { step })),
  setProgress: (progress) => set({ progress }),
  setWebgl: (webgl) => set({ webgl }),
  setHovered: (hovered) => set((s) => (s.hovered === hovered ? s : { hovered })),
  setActiveSection: (activeSection) => set({ activeSection }),
  openLightbox: (images, index, origin) => set({ lightbox: { images, index, origin } }),
  setLightboxIndex: (index) =>
    set((s) => (s.lightbox ? { lightbox: { ...s.lightbox, index, origin: null } } : s)),
  closeLightbox: () => set({ lightbox: null }),
  triggerFlash: () => set((s) => ({ flash: s.flash + 1 })),
}));

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
