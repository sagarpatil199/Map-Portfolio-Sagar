import { useRef, type CSSProperties } from 'react';
import type { PortfolioImage } from '../data/portfolio';
import { useApp } from '../lib/store';
import { Expand } from './icons';

interface Props {
  image: PortfolioImage;
  /** Images to step through in the viewer. Defaults to just this one. */
  gallery?: PortfolioImage[];
  className?: string;
  fit?: 'cover' | 'contain';
  position?: string;
  style?: CSSProperties;
}

/** Any picture in the portfolio. Clicking it opens the full-screen viewer,
 *  zooming out of the spot where the picture sits on the page. */
export function ZoomImage({ image, gallery, className = '', fit = 'cover', position = 'center', style }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const open = () => {
    const list = gallery && gallery.length ? gallery : [image];
    const index = Math.max(0, list.indexOf(image));
    const r = ref.current?.getBoundingClientRect();
    useApp.getState().openLightbox(list, index, r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null);
  };
  return (
    <button ref={ref} type="button" className={`zoom ${className}`} style={style} onClick={open} aria-label={`View full screen: ${image.alt}`}>
      <img src={image.thumb ?? image.src} alt={image.alt} loading="lazy" draggable={false} style={{ objectFit: fit, objectPosition: position }} />
      <span className="zoom-badge" aria-hidden>
        <Expand width={14} height={14} />
      </span>
    </button>
  );
}
