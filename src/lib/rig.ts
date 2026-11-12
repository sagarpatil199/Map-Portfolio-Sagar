import { Vector3 } from 'three';
import { HOME } from '../data/portfolio';

/** One mutable object describes the whole shot: where the camera is,
 *  what it looks at, and how visible each scene element is. GSAP animates
 *  these numbers and the 3D components read them every frame. */
export const rig = {
  // camera, in Earth coordinates
  lat: 12,
  lon: 25,
  dist: 3.1,
  lookLat: HOME.lat + 0.5,
  lookLon: HOME.lon,
  lookR: 0, // 0 = look at Earth's centre, 1 = look at the surface point above
  shiftX: 0, // slide the picture sideways (fraction of the screen)
  shiftY: 0.4,
  drift: 1, // slow orbit speed
  // light
  sunSide: -1.7,
  sunUp: 0.5,
  // scene elements, 0..1
  clouds: 1,
  detail: 0,
  outline: 0,
  fill: 0,
  marker: 0,
  reticle: 0,
  reticleLat: 32,
  reticleLon: 96,
  reticleSize: 34,
  nodes: 0,
  panel: 0,
};

export type Rig = typeof rig;

/** Direction of sunlight in world space, shared by every shader. */
export const sunDir = new Vector3(-0.8, 0.3, 0.5).normalize();

/** Bring a longitude within 180° of a target so the camera takes the short way round. */
export function nearestLon(lon: number, target: number): number {
  let d = (lon - target) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return target + d;
}
