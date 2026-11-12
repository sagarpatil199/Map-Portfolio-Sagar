import { useEffect, useRef } from 'react';
import { formatCoord } from '../lib/geo';
import { rig } from '../lib/rig';

/** Live latitude / longitude / altitude of the camera, written straight to the DOM. */
export function CoordReadout({ className = '' }: { className?: string }) {
  const coord = useRef<HTMLSpanElement>(null);
  const alt = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (coord.current) coord.current.textContent = formatCoord(rig.lat, rig.lon);
      if (alt.current) {
        const km = Math.max(0, (rig.dist - 1) * 6371);
        alt.current.textContent = `ALT ${(Math.round(km / 10) * 10).toLocaleString('en-US')} KM`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className={`readout ${className}`} aria-hidden>
      <span ref={coord} />
      <span ref={alt} />
    </div>
  );
}

export function Brand({ onClick }: { onClick?: () => void }) {
  const inner = (
    <>
      <span className="brand-mark" aria-hidden>
        <i />
      </span>
      <span className="brand-name">Sagar Patil</span>
    </>
  );
  return onClick ? (
    <button className="brand" onClick={onClick} aria-label="Sagar Patil, back to the start">
      {inner}
    </button>
  ) : (
    <div className="brand">{inner}</div>
  );
}
