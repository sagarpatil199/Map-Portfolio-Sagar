import { EDUCATION, IMAGES } from '../../data/portfolio';
import { Pin } from '../icons';
import { ZoomImage } from '../ZoomImage';

export function Education() {
  return (
    <>
      <div className="campus">
        <ZoomImage image={IMAGES.campus} gallery={EDUCATION.images} className="campus-photo" />
        <ZoomImage image={IMAGES.rcuEmblem} gallery={EDUCATION.images} className="campus-emblem" fit="contain" />
      </div>
      <p className="eyebrow">University</p>
      <h3 className="display">{EDUCATION.university}</h3>
      <p className="place">
        <Pin width={14} height={14} /> {EDUCATION.place}
      </p>

      <div className="degrees">
        {EDUCATION.degrees.map((d) => (
          <article className="degree" key={d.short}>
            <span className="degree-year">{d.year}</span>
            <b>{d.short}</b>
            <p>{d.name}</p>
            <small>{EDUCATION.university}</small>
          </article>
        ))}
      </div>
      <p className="hint">Select either picture to view it full screen.</p>
    </>
  );
}
