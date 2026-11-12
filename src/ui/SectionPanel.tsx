import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SECTIONS, type SectionId } from '../data/portfolio';
import { closeSection, openSection } from '../lib/director';
import { useApp } from '../lib/store';
import { ArrowLeft, ArrowRight, Close } from './icons';
import { About } from './sections/About';
import { Achievements } from './sections/Achievements';
import { Contact } from './sections/Contact';
import { Education } from './sections/Education';
import { Experience } from './sections/Experience';
import { Projects } from './sections/Projects';
import { Research } from './sections/Research';
import { Skills } from './sections/Skills';

const CONTENT: Record<SectionId, () => React.JSX.Element> = {
  about: About,
  education: Education,
  experience: Experience,
  projects: Projects,
  research: Research,
  skills: Skills,
  achievements: Achievements,
  contact: Contact,
};

/** The glass panel that opens when a floating object is selected. */
export function SectionPanel() {
  const active = useApp((s) => s.activeSection);
  const lightboxOpen = useApp((s) => s.lightbox !== null);
  const scroller = useRef<HTMLDivElement>(null);

  const index = SECTIONS.findIndex((s) => s.id === active);
  const section = index >= 0 ? SECTIONS[index] : null;
  const prev = SECTIONS[(index - 1 + SECTIONS.length) % SECTIONS.length];
  const next = SECTIONS[(index + 1) % SECTIONS.length];

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [active]);

  useEffect(() => {
    if (!active || lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSection();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, lightboxOpen]);

  const Body = section ? CONTENT[section.id] : null;

  return (
    <AnimatePresence>
      {section && Body && (
        <motion.aside
          key="panel"
          className="panel glass"
          role="dialog"
          aria-label={section.title}
          initial={{ opacity: 0, x: 80, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 80, transition: { duration: 0.45, ease: 'easeIn' } }}
          transition={{ duration: 0.85, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ ['--c' as string]: section.color }}
        >
          <header className="panel-head">
            <div>
              <small>
                {String(index + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}
              </small>
              <AnimatePresence mode="wait">
                <motion.h2 key={section.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                  {section.title}
                </motion.h2>
              </AnimatePresence>
            </div>
            <button className="icon-btn" onClick={closeSection} aria-label="Close section" autoFocus>
              <Close />
            </button>
          </header>

          <div className="panel-scroll" ref={scroller}>
            <AnimatePresence mode="wait">
              <motion.div
                key={section.id}
                className="panel-body"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16, transition: { duration: 0.22 } }}
                transition={{ duration: 0.6, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Body />
              </motion.div>
            </AnimatePresence>
          </div>

          <footer className="panel-foot">
            <button className="foot-nav" onClick={() => openSection(prev.id)}>
              <ArrowLeft width={15} height={15} />
              <span>{prev.title}</span>
            </button>
            <button className="foot-nav" onClick={() => openSection(next.id)}>
              <span>{next.title}</span>
              <ArrowRight width={15} height={15} />
            </button>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
