/** DOM elements that follow 3D points (labels for the marker and the
 *  floating section objects). The 3D scene moves them every frame without
 *  going through React, which keeps the animation smooth. */
export const anchors: Record<string, HTMLElement | null> = {};

export const setAnchor = (key: string) => (el: HTMLElement | null) => {
  anchors[key] = el;
};

export function placeAnchor(key: string, x: number, y: number, opacity: number) {
  const el = anchors[key];
  if (!el) return;
  el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  el.style.opacity = opacity.toFixed(3);
  el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
  el.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
}
