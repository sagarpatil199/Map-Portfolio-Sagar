import { motion } from 'framer-motion';
import { PROFILE } from '../data/portfolio';
import { playExplore, playJourney } from '../lib/director';
import { ArrowRight } from './icons';
import { Brand, CoordReadout } from './Hud';

const LINES = ['Every journey', 'has a beginning'];

/** Scene 1: the Earth in space with the opening line. */
export function Hero() {
  return (
    <motion.section
      className="hero layer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7 } }}
      transition={{ duration: 1.2 }}
    >
      <header className="topbar">
        <Brand />
        <span className="topbar-note">{PROFILE.title} · Portfolio</span>
      </header>

      <div className="hero-copy">
        <motion.p className="kicker" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9 }}>
          A portfolio by {PROFILE.name}
        </motion.p>
        <h1 className="hero-title" aria-label="Every journey has a beginning">
          {LINES.map((line, li) => (
            <span className="hero-line" key={line} aria-hidden>
              {line.split(' ').map((word, wi) => (
                <span className="word-mask" key={word}>
                  <motion.span
                    className="word"
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ delay: 0.8 + li * 0.28 + wi * 0.12, duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </span>
          ))}
        </h1>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.9, duration: 0.9 }}>
          <button className="cta" onClick={playJourney}>
            <span>Explore my world</span>
            <i>
              <ArrowRight />
            </i>
          </button>
        </motion.div>
      </div>

      <motion.footer className="hero-foot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3, duration: 1 }}>
        <CoordReadout />
        <button className="link-btn" onClick={playExplore}>
          Skip to portfolio
        </button>
      </motion.footer>
    </motion.section>
  );
}
