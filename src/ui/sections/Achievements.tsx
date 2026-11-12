import { ACHIEVEMENTS } from '../../data/portfolio';
import { ZoomImage } from '../ZoomImage';

/** Appears automatically once ACHIEVEMENTS in src/data/portfolio.ts has entries. */
export function Achievements() {
  return (
    <div className="stack">
      {ACHIEVEMENTS.map((a) => (
        <article className="entry" key={a.title}>
          {a.year && <p className="eyebrow">{a.year}</p>}
          <h3>{a.title}</h3>
          <p className="body">{a.detail}</p>
          {a.images && a.images.length > 0 && (
            <div className="shots">
              {a.images.map((img) => (
                <ZoomImage key={img.src} image={img} gallery={a.images} className="shot" />
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
