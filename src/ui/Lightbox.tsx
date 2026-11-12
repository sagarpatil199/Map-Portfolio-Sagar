import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import type { PortfolioImage } from '../data/portfolio';
import { useApp, type Rect } from '../lib/store';
import { ArrowLeft, ArrowRight, Close, ZoomIn, ZoomOut } from './icons';

function useViewport() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return size;
}

/** Largest size the image can take on screen. Small originals are enlarged a
 *  little, never enough to look blurry. */
function fitSize(image: PortfolioImage, vw: number, vh: number) {
  const maxW = vw * (vw < 700 ? 0.94 : 0.86);
  const maxH = vh * (vw < 700 ? 0.66 : 0.74);
  const scale = Math.min(maxW / image.width, maxH / image.height, 1.8);
  return { width: image.width * scale, height: image.height * scale };
}

const ZOOM = 2.2;

function Viewer({ images, index, origin }: { images: PortfolioImage[]; index: number; origin: Rect | null }) {
  const close = useApp((s) => s.closeLightbox);
  const setIndex = useApp((s) => s.setLightboxIndex);
  const { w: vw, h: vh } = useViewport();
  const [zoomed, setZoomed] = useState(false);
  const [direction, setDirection] = useState(0);
  const openedAt = useRef(index);
  const originRef = useRef(origin);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const dragged = useRef(false);

  const image = images[index];
  const many = images.length > 1;
  const size = useMemo(() => fitSize(image, vw, vh), [image, vw, vh]);

  const go = useCallback(
    (step: number) => {
      if (!many) return;
      setZoomed(false);
      setDirection(step);
      setIndex((index + step + images.length) % images.length);
    },
    [many, index, images.length, setIndex],
  );

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    return () => previous?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === '+' || e.key === '=') setZoomed(true);
      else if (e.key === '-') setZoomed(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, go]);

  // where the image should fly from / back to: the thumbnail that was clicked
  const fromThumb = useMemo(() => {
    const o = originRef.current;
    if (!o || index !== openedAt.current) return null;
    const scale = Math.max(o.width / size.width, o.height / size.height);
    return { x: o.x + o.width / 2 - vw / 2, y: o.y + o.height / 2 - vh / 2, scale };
  }, [index, size, vw, vh]);

  const variants = {
    enter: (dir: number) =>
      dir === 0 && fromThumb
        ? { x: fromThumb.x, y: fromThumb.y, scale: fromThumb.scale, opacity: 0.5, clipPath: 'inset(8% 8% 8% 8% round 18px)' }
        : { x: dir * 90, y: 0, scale: 0.94, opacity: 0, clipPath: 'inset(6% 6% 6% 6% round 18px)' },
    // once the reveal is done the clip is removed so a zoomed image can fill the screen
    center: { x: 0, y: 0, scale: 1, opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 10px)', transitionEnd: { clipPath: 'none' } },
    exit: (dir: number) =>
      dir === 0 && fromThumb
        ? { x: fromThumb.x, y: fromThumb.y, scale: fromThumb.scale, opacity: 0, clipPath: 'inset(8% 8% 8% 8% round 18px)' }
        : { x: dir * -90, y: 0, scale: 0.94, opacity: 0, clipPath: 'inset(6% 6% 6% 6% round 18px)' },
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (zoomed) return;
    if (Math.abs(info.offset.x) > 70 && Math.abs(info.offset.x) > Math.abs(info.offset.y)) go(info.offset.x < 0 ? 1 : -1);
    else if (info.offset.y > 110) close();
  };

  const limitX = Math.max(0, (size.width * ZOOM - vw) / 2 + 40);
  const limitY = Math.max(0, (size.height * ZOOM - vh) / 2 + 40);

  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer: ${image.alt}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, delay: 0.1 } }}
      transition={{ duration: 0.45 }}
    >
      <div className="lightbox-backdrop" onClick={close} />

      <div className="lightbox-stage">
        <AnimatePresence custom={direction} mode="popLayout" initial propagate>
          <motion.div
            key={image.src}
            className="lightbox-frame"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ width: size.width, height: size.height }}
          >
            <motion.img
              src={image.src}
              alt={image.alt}
              draggable={false}
              className={zoomed ? 'is-zoomed' : ''}
              animate={{ scale: zoomed ? ZOOM : 1, x: zoomed ? undefined : 0, y: zoomed ? undefined : 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 28 }}
              drag={zoomed ? true : many ? 'x' : false}
              dragConstraints={zoomed ? { left: -limitX, right: limitX, top: -limitY, bottom: limitY } : { left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={zoomed ? 0.08 : 0.5}
              onDragStart={() => (dragged.current = true)}
              onDragEnd={onDragEnd}
              onClick={() => {
                if (dragged.current) {
                  dragged.current = false;
                  return;
                }
                setZoomed((z) => !z);
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <button ref={closeBtn} className="lb-btn lb-close" onClick={close} aria-label="Close image viewer">
        <Close />
      </button>
      {many && (
        <>
          <button className="lb-btn lb-prev" onClick={() => go(-1)} aria-label="Previous image">
            <ArrowLeft />
          </button>
          <button className="lb-btn lb-next" onClick={() => go(1)} aria-label="Next image">
            <ArrowRight />
          </button>
        </>
      )}

      <motion.div className="lightbox-bar" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
        <p className="lightbox-caption" aria-live="polite">
          {image.caption}
        </p>
        <div className="lightbox-tools">
          {many && (
            <span className="lightbox-count">
              {index + 1} / {images.length}
            </span>
          )}
          <button className="lb-tool" onClick={() => setZoomed((z) => !z)} aria-label={zoomed ? 'Zoom out' : 'Zoom in'}>
            {zoomed ? <ZoomOut /> : <ZoomIn />}
            <span>{zoomed ? 'Zoom out' : 'Zoom in'}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Full-screen image viewer used by every picture in the portfolio. */
export function Lightbox() {
  const lightbox = useApp((s) => s.lightbox);
  return <AnimatePresence>{lightbox && <Viewer key="viewer" images={lightbox.images} index={lightbox.index} origin={lightbox.origin} />}</AnimatePresence>;
}
