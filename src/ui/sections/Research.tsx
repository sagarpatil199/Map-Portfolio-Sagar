import { RESEARCH } from '../../data/portfolio';
import { External } from '../icons';
import { ZoomImage } from '../ZoomImage';

/** Appears automatically once RESEARCH in src/data/portfolio.ts has entries. */
export function Research() {
  return (
    <div className="stack">
      {RESEARCH.map((r) => (
        <article className="entry" key={r.title}>
          <p className="eyebrow">
            {r.venue} · {r.year}
          </p>
          <h3>{r.title}</h3>
          <p className="body">{r.summary}</p>
          {r.link && (
            <a className="text-link" href={r.link} target="_blank" rel="noopener noreferrer">
              Read the paper <External width={14} height={14} />
            </a>
          )}
          {r.images && r.images.length > 0 && (
            <div className="shots">
              {r.images.map((img) => (
                <ZoomImage key={img.src} image={img} gallery={r.images} className="shot" />
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
