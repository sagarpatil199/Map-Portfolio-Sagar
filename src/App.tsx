import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { enterHero, handleResize } from './lib/director';
import { useApp } from './lib/store';
import Scene from './three/Scene';
import { loadEarthTextures, type EarthTextures } from './three/textures';
import { Explore, NodeLabels } from './ui/Explore';
import { FallbackBackdrop } from './ui/Fallback';
import { Hero } from './ui/Hero';
import { Intro } from './ui/Intro';
import { Journey, MarkerLabel } from './ui/Journey';
import { Lightbox } from './ui/Lightbox';
import { Loader } from './ui/Loader';
import { SectionPanel } from './ui/SectionPanel';

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function App() {
  const stage = useApp((s) => s.stage);
  const webgl = useApp((s) => s.webgl);
  const flash = useApp((s) => s.flash);
  const [tex, setTex] = useState<EarthTextures | null>(null);

  useEffect(() => {
    const app = useApp.getState();
    let cancelled = false;
    const begin = (delay: number) => window.setTimeout(() => !cancelled && enterHero(), delay);

    if (!hasWebGL()) {
      app.setWebgl(false);
      begin(600);
    } else {
      loadEarthTextures()
        .then((t) => {
          if (cancelled) return;
          setTex(t);
          begin(1100); // let the first frames compile behind the loader
        })
        .catch(() => {
          app.setWebgl(false);
          begin(300);
        });
    }
    window.addEventListener('resize', handleResize);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`app stage-${stage}`}>
      {webgl ? tex && <Scene tex={tex} /> : <FallbackBackdrop />}
      <div className="vignette" aria-hidden />

      {webgl && <MarkerLabel />}
      {webgl && <NodeLabels />}

      <AnimatePresence mode="wait">
        {stage === 'hero' && <Hero key="hero" />}
        {(stage === 'journey' || stage === 'location') && <Journey key="journey" />}
        {stage === 'intro' && <Intro key="intro" />}
        {stage === 'explore' && <Explore key="explore" />}
      </AnimatePresence>

      <SectionPanel />

      {/* white-blue flash as the camera dives into the beacon */}
      <AnimatePresence>
        {flash > 0 && (
          <motion.div
            key={flash}
            className="flash"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, times: [0, 0.28, 1], ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <Lightbox />
      <Loader />
    </div>
  );
}
