import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../lib/store';

/** Loading screen shown while the Earth textures download. */
export function Loader() {
  const stage = useApp((s) => s.stage);
  const progress = useApp((s) => s.progress);
  const pct = Math.round(progress * 100);
  return (
    <AnimatePresence>
      {stage === 'loading' && (
        <motion.div className="loader" exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: 'easeInOut' }} role="status" aria-live="polite">
          <div className="loader-orbit" aria-hidden>
            <span className="loader-planet" />
            <span className="loader-ring" />
            <span className="loader-moon" />
          </div>
          <p className="loader-title">Preparing your journey</p>
          <div className="loader-bar" aria-hidden>
            <i style={{ transform: `scaleX(${Math.max(0.03, progress)})` }} />
          </div>
          <p className="loader-pct">{String(pct).padStart(3, '0')}%</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
