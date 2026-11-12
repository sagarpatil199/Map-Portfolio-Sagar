import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, LineBasicMaterial, LineLoop, LineSegments, Vector3 } from 'three';
import { DEG, latLon } from '../lib/geo';
import { rig } from '../lib/rig';

const SEG = 128;

/** A targeting ring on the globe that tightens from Asia onto India. */
export function Reticle() {
  const { outer, inner, ticks } = useMemo(() => {
    const mat = (opacity: number) =>
      new LineBasicMaterial({ color: '#7fe9ff', transparent: true, opacity, depthWrite: false, blending: AdditiveBlending });
    const ring = () => {
      const g = new BufferGeometry();
      g.setAttribute('position', new BufferAttribute(new Float32Array(SEG * 3), 3));
      return g;
    };
    const tickGeo = new BufferGeometry();
    tickGeo.setAttribute('position', new BufferAttribute(new Float32Array(8 * 3), 3));
    const o = new LineLoop(ring(), mat(1));
    const i = new LineLoop(ring(), mat(0.4));
    const t = new LineSegments(tickGeo, mat(1));
    for (const obj of [o, i, t]) {
      obj.frustumCulled = false;
      obj.renderOrder = 4;
      obj.raycast = () => {};
    }
    return { outer: o, inner: i, ticks: t };
  }, []);

  const v = useMemo(() => ({ c: new Vector3(), e1: new Vector3(), e2: new Vector3(), p: new Vector3() }), []);

  useFrame(({ clock }) => {
    const visible = rig.reticle > 0.01;
    outer.visible = inner.visible = ticks.visible = visible;
    if (!visible) return;

    latLon(rig.reticleLat, rig.reticleLon, 1, v.c);
    v.e1.set(0, 1, 0).cross(v.c).normalize(); // east
    v.e2.copy(v.c).cross(v.e1).normalize(); // north
    const spin = clock.elapsedTime * 0.15;

    const write = (line: LineLoop, sizeDeg: number, radius: number) => {
      const arr = line.geometry.attributes.position.array as Float32Array;
      const s = Math.sin(sizeDeg * DEG);
      const c = Math.cos(sizeDeg * DEG);
      for (let k = 0; k < SEG; k++) {
        const a = (k / SEG) * Math.PI * 2;
        v.p.copy(v.c).multiplyScalar(c).addScaledVector(v.e1, Math.cos(a) * s).addScaledVector(v.e2, Math.sin(a) * s).multiplyScalar(radius);
        arr.set([v.p.x, v.p.y, v.p.z], k * 3);
      }
      line.geometry.attributes.position.needsUpdate = true;
    };
    write(outer, rig.reticleSize, 1.012);
    write(inner, rig.reticleSize * 0.86, 1.012);

    // four tick marks that slowly rotate around the ring
    const arr = ticks.geometry.attributes.position.array as Float32Array;
    for (let k = 0; k < 4; k++) {
      const a = spin + (k * Math.PI) / 2;
      for (let j = 0; j < 2; j++) {
        const size = rig.reticleSize * (j === 0 ? 1.0 : 1.12);
        v.p
          .copy(v.c)
          .multiplyScalar(Math.cos(size * DEG))
          .addScaledVector(v.e1, Math.cos(a) * Math.sin(size * DEG))
          .addScaledVector(v.e2, Math.sin(a) * Math.sin(size * DEG))
          .multiplyScalar(1.012);
        arr.set([v.p.x, v.p.y, v.p.z], (k * 2 + j) * 3);
      }
    }
    ticks.geometry.attributes.position.needsUpdate = true;

    (outer.material as LineBasicMaterial).opacity = rig.reticle * 0.85;
    (inner.material as LineBasicMaterial).opacity = rig.reticle * 0.3;
    (ticks.material as LineBasicMaterial).opacity = rig.reticle;
  });

  return (
    <>
      <primitive object={outer} />
      <primitive object={inner} />
      <primitive object={ticks} />
    </>
  );
}
