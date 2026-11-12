import { useApp } from '../lib/store';

/** Shown instead of the 3D scene when WebGL is not available. A CSS-only
 *  globe keeps the mood, and every section still works. */
export function FallbackBackdrop() {
  const stage = useApp((s) => s.stage);
  return (
    <div className={`fallback stage-${stage}`} aria-hidden>
      <div className="fallback-stars" />
      <div className="fallback-globe">
        <span style={{ backgroundImage: `url(${import.meta.env.BASE_URL}textures/earth_day_2k.jpg)` }} />
      </div>
    </div>
  );
}
