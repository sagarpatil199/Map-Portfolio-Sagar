/** Shared layout maths so the camera distance and the positions of the
 *  floating section objects always agree, on any screen shape. */
export const FOV = 42;
const TAN = Math.tan((FOV * Math.PI) / 360);

export const getAspect = () => (typeof window === 'undefined' ? 1.6 : window.innerWidth / window.innerHeight);
export const isPortrait = (aspect = getAspect()) => aspect < 0.85;

export interface ExploreLayout {
  dist: number;
  positions: [number, number, number][];
}

export function exploreLayout(aspect: number, count: number): ExploreLayout {
  const portrait = isPortrait(aspect);
  let halfH: number;
  let halfW: number;
  if (portrait) {
    halfW = 1.62;
    halfH = halfW / aspect;
  } else {
    halfH = 2.2;
    halfW = halfH * aspect;
  }
  const dist = halfH / TAN;
  const rx = portrait ? halfW * 0.6 : Math.min(halfW * 0.64, 3.0);
  const ry = portrait ? Math.min(halfH * 0.52, 2.3) : halfH * 0.54;
  const offset = portrait ? Math.PI / count : 0;
  const positions: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    // start at the top and go clockwise
    const a = Math.PI / 2 - (i / count) * Math.PI * 2 - offset - (portrait ? 0 : Math.PI / count);
    const z = 0.55 + 0.25 * Math.sin(i * 2.4);
    positions.push([Math.cos(a) * rx, Math.sin(a) * ry, z]);
  }
  return { dist, positions };
}
