import { Vector3 } from 'three';

export const DEG = Math.PI / 180;

/** Latitude/longitude (degrees) to a point on a sphere that matches an
 *  equirectangular texture on THREE.SphereGeometry (lon 0 at +X, 90°E at -Z). */
export function latLon(lat: number, lon: number, r = 1, out = new Vector3()): Vector3 {
  const p = lat * DEG;
  const l = lon * DEG;
  return out.set(Math.cos(p) * Math.cos(l) * r, Math.sin(p) * r, -Math.cos(p) * Math.sin(l) * r);
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (t: number) => t * t * (3 - 2 * t);

export function formatCoord(lat: number, lon: number): string {
  const wrap = ((((lon + 180) % 360) + 360) % 360) - 180;
  const la = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lo = `${Math.abs(wrap).toFixed(2)}° ${wrap >= 0 ? 'E' : 'W'}`;
  return `${la}   ${lo}`;
}
