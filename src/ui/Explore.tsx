import { AnimatePresence, motion } from 'framer-motion';
import { SECTIONS } from '../data/portfolio';
import { setAnchor } from '../lib/anchors';
import { closeSection, enterHero, openSection } from '../lib/director';
import { useApp } from '../lib/store';
import { Brand } from './Hud';
import { Replay } from './icons';

/** Text labels that follow each floating object. They are real buttons, so the
 *  sections can also be opened by keyboard or by tapping the label. */
export function NodeLabels() {
  const hovered = useApp((s) => s.hovered);
  const active = useApp((s) => s.activeSection);
  return (
    <div className="node-labels">
      {SECTIONS.map((s, i) => (
        <div className="anchor" key={s.id} ref={setAnchor(`node-${s.id}`)}>
          <button
            className={`node-label ${hovered === s.id ? 'hot' : ''} ${active === s.id ? 'on' : ''}`}
            onClick={() => (active === s.id ? closeSection() : openSection(s.id))}
            onPointerEnter={() => useApp.getState().setHovered(s.id)}
            onPointerLeave={() => useApp.getState().setHovered(null)}
            onFocus={() => useApp.getState().setHovered(s.id)}
            onBlur={() => useApp.getState().setHovered(null)}
            style={{ ['--c' as string]: s.color }}
          >
            <small>{String(i + 1).padStart(2, '0')}</small>
            <b>{s.title}</b>
          </button>
        </div>
      ))}
    </div>
  );
}

/** Scene 4 interface: top bar, hint and the section dock. */
export function Explore() {
  const active = useApp((s) => s.activeSection);
  const webgl = useApp((s) => s.webgl);
  return (
    <motion.section className="explore layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
      <header className="topbar">
        <Brand onClick={() => enterHero()} />
        <button className="ghost-btn" onClick={() => enterHero()}>
          <Replay width={15} height={15} />
          <span>Replay journey</span>
        </button>
      </header>

      <AnimatePresence>
        {!active && (
          <motion.p
            className="explore-hint"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2.6, duration: 0.8 }}
          >
            Select a destination to explore
          </motion.p>
        )}
      </AnimatePresence>

      {!webgl && (
        <div className="fallback-grid">
          {SECTIONS.map((s, i) => (
            <button key={s.id} className="fallback-tile glass" onClick={() => openSection(s.id)} style={{ ['--c' as string]: s.color }}>
              <small>{String(i + 1).padStart(2, '0')}</small>
              <b>{s.title}</b>
              <span>{s.tagline}</span>
            </button>
          ))}
        </div>
      )}

      <motion.nav
        className="dock glass"
        aria-label="Portfolio sections"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`dock-item ${active === s.id ? 'on' : ''}`}
            onClick={() => (active === s.id ? closeSection() : openSection(s.id))}
            onPointerEnter={() => useApp.getState().setHovered(s.id)}
            onPointerLeave={() => useApp.getState().setHovered(null)}
            aria-pressed={active === s.id}
          >
            {s.title}
          </button>
        ))}
      </motion.nav>
    </motion.section>
  );
}
