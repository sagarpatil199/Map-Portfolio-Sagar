import { PROJECTS, type Project } from '../../data/portfolio';
import { ZoomImage } from '../ZoomImage';

/** Small line drawings so each project has a face until real screenshots are added. */
function Glyph({ kind }: { kind: Project['glyph'] }) {
  if (kind === 'card')
    return (
      <svg viewBox="0 0 120 80" className="glyph" aria-hidden>
        <rect x="18" y="16" width="84" height="50" rx="7" />
        <path d="M18 31h84" />
        <rect x="28" y="42" width="16" height="11" rx="2" />
        <path className="glyph-run" d="M56 50h34M56 44h20" />
      </svg>
    );
  if (kind === 'ship')
    return (
      <svg viewBox="0 0 120 80" className="glyph" aria-hidden>
        <path d="M20 48h80l-9 16H30z" />
        <rect x="36" y="36" width="12" height="12" />
        <rect x="50" y="36" width="12" height="12" />
        <rect x="64" y="36" width="12" height="12" />
        <rect x="43" y="24" width="12" height="12" />
        <rect x="57" y="24" width="12" height="12" />
        <path className="glyph-run" d="M10 72q8-6 16 0t16 0 16 0 16 0 16 0 16 0" />
      </svg>
    );
  return (
    <svg viewBox="0 0 120 80" className="glyph" aria-hidden>
      <path d="M18 24c0-5 28-5 28 0v32c0 5-28 5-28 0z" />
      <path d="M18 24c0 5 28 5 28 0M18 40c0 5 28 5 28 0" />
      <path d="M74 24c0-5 28-5 28 0v32c0 5-28 5-28 0z" />
      <path d="M74 24c0 5 28 5 28 0M74 40c0 5 28 5 28 0" />
      <path className="glyph-run" d="M50 40h20M64 34l6 6-6 6" />
    </svg>
  );
}

export function Projects() {
  return (
    <div className="projects">
      {PROJECTS.map((p, i) => (
        <article className="project" key={p.name}>
          <div className="project-cover">
            <Glyph kind={p.glyph} />
            <span className="project-no">{String(i + 1).padStart(2, '0')}</span>
          </div>
          <div className="project-body">
            <p className="eyebrow">{p.context}</p>
            <h3>{p.name}</h3>
            <p className="body">{p.description}</p>
            <ul className="points compact">
              {p.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="chips">
              {p.tags.map((t) => (
                <span className="chip" key={t}>
                  {t}
                </span>
              ))}
            </div>
            {p.images.length > 0 && (
              <div className="shots">
                {p.images.map((img) => (
                  <ZoomImage key={img.src} image={img} gallery={p.images} className="shot" />
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
