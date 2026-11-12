import { AnimatePresence, motion } from 'framer-motion';
import { HOME } from '../data/portfolio';
import { playIntro, skipJourney } from '../lib/director';
import { JOURNEY_STEPS, useApp } from '../lib/store';
import { setAnchor } from '../lib/anchors';
import { ArrowRight, Pin } from './icons';
import { CoordReadout } from './Hud';

const CAPTIONS = ['Home planet', 'Continent', 'Country', 'State', 'Hometown'];

/** Scene 2: breadcrumb, stage titles and the arrival card. */
export function Journey() {
  const stage = useApp((s) => s.stage);
  const step = useApp((s) => s.step);
  const arrived = stage === 'location';

  return (
    <motion.section className="journey layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }} transition={{ duration: 0.8 }}>
      <nav className="crumbs" aria-label="Journey progress">
        {JOURNEY_STEPS.map((name, i) => (
          <span key={name} className={`crumb ${i < step ? 'done' : ''} ${i === step ? 'now' : ''}`} aria-current={i === step ? 'step' : undefined}>
            <i />
            <b>{name}</b>
          </span>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        {!arrived && (
          <motion.div
            key={step}
            className="stage-title"
            initial={{ opacity: 0, y: 18, letterSpacing: '0.7em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.42em' }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            aria-live="polite"
          >
            <small>{CAPTIONS[step]}</small>
            <strong>{JOURNEY_STEPS[step]}</strong>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {arrived && (
          <motion.aside
            className="location-card glass"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className="card-tag">
              <Pin width={14} height={14} /> Destination reached
            </span>
            <h2>
              Rooted in {HOME.city},<br />
              {HOME.state}, {HOME.country}
            </h2>
            <p className="card-sub">Connected to the world</p>
            <dl className="card-facts">
              <div>
                <dt>Latitude</dt>
                <dd>{HOME.lat.toFixed(4)}° N</dd>
              </div>
              <div>
                <dt>Longitude</dt>
                <dd>{HOME.lon.toFixed(4)}° E</dd>
              </div>
              <div>
                <dt>Time zone</dt>
                <dd>{HOME.timezone}</dd>
              </div>
            </dl>
            <button className="cta small" onClick={playIntro} autoFocus>
              <span>Meet Sagar</span>
              <i>
                <ArrowRight />
              </i>
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      <footer className="hero-foot">
        <CoordReadout />
        {!arrived && (
          <button className="link-btn" onClick={skipJourney}>
            Skip flight
          </button>
        )}
      </footer>
    </motion.section>
  );
}

/** The small label that follows the Belagavi beacon on the globe. */
export function MarkerLabel() {
  return (
    <div className="anchor" ref={setAnchor('marker')} aria-hidden>
      <div className="marker-label">
        <b>{HOME.city}</b>
        <span>
          {HOME.lat.toFixed(2)}° N · {HOME.lon.toFixed(2)}° E
        </span>
      </div>
    </div>
  );
}
