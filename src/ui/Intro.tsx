import { useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { HOME, IMAGES, PROFILE } from '../data/portfolio';
import { playExplore } from '../lib/director';
import { reducedMotion, useApp } from '../lib/store';
import { ArrowRight, Expand, Pin } from './icons';

/** Scene 3: Sagar's photograph opens with a circular reveal and a 3D turn. */
export function Intro() {
  const openLightbox = useApp((s) => s.openLightbox);
  const photo = useRef<HTMLButtonElement>(null);
  const quick = reducedMotion();

  // the portrait leans gently towards the pointer
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotY = useSpring(useTransform(px, [-1, 1], [-14, 14]), { stiffness: 90, damping: 16 });
  const rotX = useSpring(useTransform(py, [-1, 1], [10, -10]), { stiffness: 90, damping: 16 });

  const sparks = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        angle: (i / 22) * 360 + ((i * 47) % 30),
        radius: 54 + ((i * 37) % 22),
        size: 2 + ((i * 13) % 4),
        duration: 16 + ((i * 7) % 18),
        delay: -((i * 5) % 20),
      })),
    [],
  );

  const openPhoto = () => {
    const r = photo.current?.getBoundingClientRect();
    openLightbox([IMAGES.portrait], 0, r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null);
  };

  return (
    <motion.section
      className="intro layer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.7 } }}
      transition={{ duration: 0.9 }}
      onPointerMove={(e) => {
        px.set((e.clientX / window.innerWidth) * 2 - 1);
        py.set((e.clientY / window.innerHeight) * 2 - 1);
      }}
    >
      <div className="intro-veil" aria-hidden />
      <div className="intro-inner">
        <div className="portrait-stage">
          <motion.div
            className="portrait-enter"
            initial={quick ? { opacity: 0 } : { opacity: 0, rotateY: -85, scale: 0.7 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            transition={{ delay: 0.35, duration: 1.7, ease: [0.16, 0.9, 0.2, 1] }}
          >
          <motion.div className="portrait-tilt" style={{ rotateX: rotX, rotateY: rotY }}>
            <span className="portrait-halo" aria-hidden />
            <span className="portrait-ring ring-a" aria-hidden />
            <span className="portrait-ring ring-b" aria-hidden />
            <div className="sparks" aria-hidden>
              {sparks.map((s, i) => (
                <i
                  key={i}
                  style={{
                    width: s.size,
                    height: s.size,
                    animationDuration: `${s.duration}s`,
                    animationDelay: `${s.delay}s`,
                    ['--a' as string]: `${s.angle}deg`,
                    ['--r' as string]: s.radius,
                  }}
                />
              ))}
            </div>
            <motion.button
              ref={photo}
              type="button"
              className="portrait"
              onClick={openPhoto}
              aria-label="View Sagar Patil's photograph full screen"
              initial={{ clipPath: 'circle(0% at 50% 50%)' }}
              animate={{ clipPath: 'circle(50% at 50% 50%)' }}
              transition={{ delay: 0.5, duration: 1.5, ease: [0.3, 0.8, 0.2, 1] }}
            >
              <img src={IMAGES.portrait.thumb} alt={IMAGES.portrait.alt} draggable={false} />
              <span className="portrait-shine" aria-hidden />
              <span className="zoom-badge" aria-hidden>
                <Expand width={14} height={14} />
              </span>
            </motion.button>
            <span className="portrait-glass" aria-hidden>
              <Pin width={13} height={13} /> {HOME.city}, {HOME.country}
            </span>
          </motion.div>
          </motion.div>
        </div>

        <div className="intro-copy">
          <motion.p className="hello" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.4 }}>
            <span className="typed">Hello, World!</span>
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.9, duration: 1, ease: [0.2, 0.8, 0.2, 1] }}>
            I'm {PROFILE.name}
          </motion.h1>
          <motion.p className="intro-role" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2, duration: 0.9 }}>
            {PROFILE.title} <span>·</span> {PROFILE.focus}
          </motion.p>
          <motion.p className="intro-line" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5, duration: 0.9 }}>
            This is my journey.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.9, duration: 0.9 }}>
            <button className="cta" onClick={playExplore}>
              <span>Explore my journey</span>
              <i>
                <ArrowRight />
              </i>
            </button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
