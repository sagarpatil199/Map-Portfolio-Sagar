import { IMAGES, JOURNEY_TIMELINE, PROFILE } from '../../data/portfolio';
import { ZoomImage } from '../ZoomImage';

export function About() {
  return (
    <>
      <div className="about-top">
        <ZoomImage image={IMAGES.portrait} className="about-photo" position="50% 12%" />
        <div>
          <p className="eyebrow">{PROFILE.title}</p>
          <h3 className="display">{PROFILE.name}</h3>
          <p className="lead">{PROFILE.summary[0]}</p>
        </div>
      </div>
      {PROFILE.summary.slice(1).map((p) => (
        <p className="body" key={p}>
          {p}
        </p>
      ))}

      <div className="facts">
        {PROFILE.facts.map((f) => (
          <div className="fact" key={f.label}>
            <small>{f.label}</small>
            <b>{f.value}</b>
          </div>
        ))}
      </div>

      <h4 className="sub">The journey so far</h4>
      <ol className="timeline">
        {JOURNEY_TIMELINE.map((t) => (
          <li key={t.year + t.title}>
            <span className="timeline-year">{t.year}</span>
            <b>{t.title}</b>
            <small>{t.detail}</small>
          </li>
        ))}
      </ol>

      <div className="two-col">
        <div>
          <h4 className="sub">Languages</h4>
          <div className="chips">
            {PROFILE.languages.map((l) => (
              <span className="chip" key={l}>
                {l}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="sub">Interests</h4>
          <div className="chips">
            {PROFILE.interests.map((l) => (
              <span className="chip" key={l}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
