import gsap from 'gsap';
import { SECTIONS, type SectionId } from '../data/portfolio';
import { clamp } from './geo';
import { exploreLayout, getAspect, isPortrait } from './layout';
import { nearestLon, rig } from './rig';
import { reducedMotion, useApp } from './store';

/* ------------------------------------------------------------------
   The director owns every cinematic move. Each scene change is one
   function that animates the rig with GSAP.
------------------------------------------------------------------- */

// Add ?debug to the address to inspect the rig from the browser console.
if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')) {
  gsap.ticker.lagSmoothing(0);
  (window as unknown as Record<string, unknown>).__portfolio = { rig, gsap, useApp };
}

let timeline: gsap.core.Timeline | null = null;
let ambient: gsap.core.Tween | null = null;

function stopAll() {
  timeline?.kill();
  ambient?.kill();
  timeline = null;
  ambient = null;
  gsap.killTweensOf(rig);
}

/* ---------- poses ---------- */

const heroPose = () => {
  const portrait = isPortrait();
  return {
    lat: 12,
    dist: portrait ? 4.0 : 3.1,
    lookR: 0,
    shiftX: 0,
    shiftY: portrait ? 0.22 : 0.4,
    sunSide: -1.7,
    sunUp: 0.5,
    drift: 1,
    clouds: 1,
    detail: 0,
    outline: 0,
    fill: 0,
    marker: 0,
    reticle: 0,
    nodes: 0,
    panel: 0,
  };
};

type Shot = Record<'lat' | 'lon' | 'dist' | 'lookR' | 'shiftX' | 'shiftY' | 'sunSide' | 'sunUp' | 'clouds', number>;
const SHOT_KEYS = ['lat', 'lon', 'dist', 'lookR', 'shiftX', 'shiftY', 'sunSide', 'sunUp', 'clouds'] as const;

const journeyShots = (): Shot[] => {
  const p = isPortrait();
  return [
    // Asia
    { lat: 32, lon: 96, dist: p ? 3.5 : 2.6, lookR: 0, shiftX: 0, shiftY: 0, sunSide: -0.9, sunUp: 0.42, clouds: 0.95 },
    // India
    { lat: 22, lon: 80.5, dist: p ? 2.35 : 1.82, lookR: 0, shiftX: 0, shiftY: 0, sunSide: -0.6, sunUp: 0.4, clouds: 0.5 },
    // Karnataka
    { lat: 15.1, lon: 76.3, dist: p ? 1.5 : 1.34, lookR: 0, shiftX: 0, shiftY: 0, sunSide: -0.5, sunUp: 0.36, clouds: 0.16 },
    // Belagavi: low, tilted view with the horizon in frame
    p
      ? { lat: 7.2, lon: 75.2, dist: 1.31, lookR: 1, shiftX: 0, shiftY: -0.15, sunSide: -0.5, sunUp: 0.36, clouds: 0.12 }
      : { lat: 7.6, lon: 75.7, dist: 1.26, lookR: 1, shiftX: -0.17, shiftY: 0.03, sunSide: -0.5, sunUp: 0.36, clouds: 0.12 },
  ];
};

const introPose = () => {
  const p = isPortrait();
  return { lat: 4, lon: 79, dist: p ? 3.3 : 2.6, lookR: 0, shiftX: 0, shiftY: p ? 0.4 : 0.52, sunSide: -1.0, sunUp: 0.5, clouds: 0.7, drift: 0.12 };
};

const explorePose = () => {
  const aspect = getAspect();
  const { dist } = exploreLayout(aspect, SECTIONS.length);
  return { lat: 13, lon: 79, dist, lookR: 0, shiftX: 0, shiftY: -0.03, sunSide: -0.8, sunUp: 0.45, clouds: 0.9, drift: 0 };
};

/* ---------- smooth path through the shots ---------- */

function catmull(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function sampleShots(shots: Shot[], p: number) {
  const n = shots.length - 1;
  const f = clamp(p) * n;
  const i = Math.min(n - 1, Math.floor(f));
  const t = f - i;
  const k0 = shots[Math.max(0, i - 1)];
  const k1 = shots[i];
  const k2 = shots[i + 1];
  const k3 = shots[Math.min(n, i + 2)];
  for (const key of SHOT_KEYS) {
    if (key === 'dist') {
      rig.dist = Math.exp(catmull(Math.log(k0.dist), Math.log(k1.dist), Math.log(k2.dist), Math.log(k3.dist), t));
    } else {
      rig[key] = catmull(k0[key], k1[key], k2[key], k3[key], t);
    }
  }
  rig.lookR = clamp(rig.lookR);
  rig.clouds = clamp(rig.clouds);
}

/* ---------- scenes ---------- */

export function enterHero(resetLon = true) {
  stopAll();
  Object.assign(rig, heroPose());
  if (resetLon) rig.lon = 25;
  useApp.setState({ stage: 'hero', step: 0, activeSection: null, hovered: null });
}

/** Scene 2: Earth → Asia → India → Karnataka → Belagavi */
export function playJourney() {
  const app = useApp.getState();
  if (app.stage !== 'hero') return;
  stopAll();
  app.setStage('journey');
  app.setStep(0);
  rig.drift = 0;

  const shots = journeyShots();
  rig.lon = nearestLon(rig.lon, shots[0].lon);
  const start: Shot = { lat: rig.lat, lon: rig.lon, dist: rig.dist, lookR: 0, shiftX: rig.shiftX, shiftY: rig.shiftY, sunSide: rig.sunSide, sunUp: rig.sunUp, clouds: rig.clouds };
  const path = [start, ...shots];
  // without WebGL there is no flight to watch, so keep it short
  const D = !app.webgl ? 3.4 : reducedMotion() ? 5 : 12;
  const state = { p: 0 };

  rig.reticleLat = 34;
  rig.reticleLon = 95;
  rig.reticleSize = 36;

  timeline = gsap.timeline({
    onComplete: () => {
      useApp.getState().setStep(4);
      useApp.getState().setStage('location');
    },
  });
  timeline
    .to(
      state,
      {
        p: 1,
        duration: D,
        ease: 'power1.inOut',
        onUpdate: () => {
          sampleShots(path, state.p);
          const p = state.p;
          useApp.getState().setStep(p < 0.14 ? 0 : p < 0.4 ? 1 : p < 0.64 ? 2 : p < 0.9 ? 3 : 4);
        },
      },
      0,
    )
    // targeting ring: Asia, then tightening on India
    .to(rig, { reticle: 1, duration: 0.9, ease: 'power2.out' }, D * 0.14)
    .to(rig, { reticleLat: 21.5, reticleLon: 79.5, reticleSize: 17, duration: D * 0.24, ease: 'power2.inOut' }, D * 0.32)
    .to(rig, { reticle: 0, reticleSize: 6, reticleLat: 15, reticleLon: 76, duration: D * 0.1, ease: 'power2.in' }, D * 0.6)
    // sharper terrain for the close-up
    .to(rig, { detail: 1, duration: D * 0.14, ease: 'none' }, D * 0.4)
    // Karnataka border draws itself, then fills
    .to(rig, { outline: 1, duration: D * 0.2, ease: 'power2.inOut' }, D * 0.62)
    .to(rig, { fill: 1, duration: D * 0.14, ease: 'power2.out' }, D * 0.72)
    // the beacon lands on Belagavi
    .to(rig, { marker: 1, duration: 1.2, ease: 'back.out(1.7)' }, D * 0.9);
}

export function skipJourney() {
  if (useApp.getState().stage === 'journey' && timeline) timeline.progress(1);
}

/** Scene 3: dive into the beacon, then meet Sagar */
export function playIntro() {
  const app = useApp.getState();
  if (app.stage !== 'location') return;
  stopAll();
  const pose = introPose();
  const quick = reducedMotion();
  timeline = gsap.timeline();
  timeline
    .to(rig, { dist: rig.dist * 0.94, shiftX: 0, shiftY: 0, duration: quick ? 0.3 : 0.95, ease: 'power2.in' }, 0)
    .call(() => useApp.getState().triggerFlash(), [], quick ? 0.1 : 0.6)
    .call(() => useApp.getState().setStage('intro'), [], quick ? 0.3 : 0.95)
    .to(rig, { ...pose, lon: nearestLon(pose.lon, rig.lon), duration: quick ? 0.8 : 3, ease: 'power2.out' }, quick ? 0.3 : 0.95);
}

/** Scene 4: pull back and reveal the floating sections */
export function playExplore() {
  stopAll();
  const pose = explorePose();
  const quick = reducedMotion();
  rig.lon = nearestLon(rig.lon, pose.lon);
  rig.detail = 1;
  rig.outline = 1;
  rig.fill = 1;
  rig.marker = 1;
  rig.reticle = 0;
  useApp.setState({ stage: 'explore', step: 4, activeSection: null, hovered: null });
  timeline = gsap.timeline({
    onComplete: () => {
      ambient = gsap.to(rig, { lon: '+=22', duration: 46, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    },
  });
  timeline
    .to(rig, { ...pose, panel: 0, duration: quick ? 0.8 : 2.8, ease: 'power3.inOut' }, 0)
    .to(rig, { nodes: 1, duration: quick ? 0.6 : 2.2, ease: 'none' }, quick ? 0.2 : 1.1);
}

export function openSection(id: SectionId) {
  const app = useApp.getState();
  if (app.stage !== 'explore') return;
  app.setActiveSection(id);
  app.setHovered(null);
  // on wide screens pull back and slide left so every object stays visible beside the panel
  const wide = !isPortrait();
  gsap.to(rig, { panel: 1, shiftX: wide ? -0.255 : 0, dist: explorePose().dist * (wide ? 1.55 : 1), duration: 1.2, ease: 'power3.inOut', overwrite: 'auto' });
}

export function closeSection() {
  useApp.getState().setActiveSection(null);
  gsap.to(rig, { panel: 0, shiftX: 0, dist: explorePose().dist, duration: 1.1, ease: 'power3.inOut', overwrite: 'auto' });
}

/** Keep the framing right when the window changes size or rotates. */
export function handleResize() {
  const { stage, activeSection } = useApp.getState();
  if (stage === 'hero') {
    const pose = heroPose();
    rig.dist = pose.dist;
    rig.shiftY = pose.shiftY;
  } else if (stage === 'explore' && (!timeline || !timeline.isActive())) {
    const wide = !!activeSection && !isPortrait();
    gsap.to(rig, { dist: explorePose().dist * (wide ? 1.55 : 1), shiftX: wide ? -0.255 : 0, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
  } else if (stage === 'intro' && (!timeline || !timeline.isActive())) {
    const pose = introPose();
    gsap.to(rig, { dist: pose.dist, shiftY: pose.shiftY, duration: 0.6, overwrite: 'auto' });
  }
}
