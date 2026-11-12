import { EXPERIENCE } from '../../data/portfolio';
import { Pin } from '../icons';
import { ZoomImage } from '../ZoomImage';

export function Experience() {
  return (
    <>
      {EXPERIENCE.map((job) => (
        <article className="job" key={job.company}>
          <ZoomImage image={job.logo} gallery={[job.logo, job.icon]} className="job-logo" fit="contain" />
          <div className="job-head">
            <div>
              <p className="eyebrow">{job.period}</p>
              <h3 className="display">{job.role}</h3>
              <p className="job-company">{job.company}</p>
            </div>
            <p className="place">
              <Pin width={14} height={14} /> {job.place}
            </p>
          </div>
          <ul className="points">
            {job.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <h4 className="sub">Working with</h4>
          <div className="chips">
            {job.stack.map((s) => (
              <span className="chip" key={s}>
                {s}
              </span>
            ))}
          </div>
        </article>
      ))}
    </>
  );
}
