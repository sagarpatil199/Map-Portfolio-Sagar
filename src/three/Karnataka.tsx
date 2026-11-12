import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  ShaderMaterial,
  ShapeUtils,
  Vector2,
  Vector3,
} from 'three';
import { KARNATAKA } from '../data/karnataka';
import { latLon } from '../lib/geo';
import { rig } from '../lib/rig';
import { fillFragment, fillVertex, ribbonFragment, ribbonVertex } from './shaders';

const noRaycast = () => null;
const CYAN = new Color('#5ee7ff');

/** Glowing ribbon that follows the state border on the globe. */
function buildRibbon(width: number, radius: number) {
  const pts = KARNATAKA.map(([lon, lat]) => latLon(lat, lon, radius));
  const n = pts.length;
  const lengths = [0];
  for (let i = 1; i <= n; i++) lengths.push(lengths[i - 1] + pts[i % n].distanceTo(pts[i - 1]));
  const total = lengths[n];

  const position = new Float32Array((n + 1) * 2 * 3);
  const along = new Float32Array((n + 1) * 2);
  const side = new Float32Array((n + 1) * 2);
  const index: number[] = [];
  const tangent = new Vector3();
  const normal = new Vector3();
  const across = new Vector3();

  for (let i = 0; i <= n; i++) {
    const p = pts[i % n];
    tangent.subVectors(pts[(i + 1) % n], pts[(i - 1 + n) % n]).normalize();
    normal.copy(p).normalize();
    across.crossVectors(normal, tangent).normalize().multiplyScalar(width);
    position.set([p.x + across.x, p.y + across.y, p.z + across.z], i * 6);
    position.set([p.x - across.x, p.y - across.y, p.z - across.z], i * 6 + 3);
    along[i * 2] = along[i * 2 + 1] = lengths[i] / total;
    side[i * 2] = 1;
    side[i * 2 + 1] = -1;
    if (i < n) index.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(position, 3));
  g.setAttribute('aAlong', new BufferAttribute(along, 1));
  g.setAttribute('aSide', new BufferAttribute(side, 1));
  g.setIndex(index);
  return g;
}

function buildFill(radius: number) {
  const contour = KARNATAKA.map(([lon, lat]) => new Vector2(lon, lat));
  const triangles = ShapeUtils.triangulateShape(contour, []);
  const position = new Float32Array(KARNATAKA.length * 3);
  const ll = new Float32Array(KARNATAKA.length * 2);
  KARNATAKA.forEach(([lon, lat], i) => {
    const p = latLon(lat, lon, radius);
    position.set([p.x, p.y, p.z], i * 3);
    ll.set([lon, lat], i * 2);
  });
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(position, 3));
  g.setAttribute('aLL', new BufferAttribute(ll, 2));
  g.setIndex(triangles.flat());
  return g;
}

/** Karnataka: the border draws itself in, then the state lights up. */
export function Karnataka() {
  const ribbon = useMemo(() => buildRibbon(0.0034, 1.0032), []);
  const fill = useMemo(() => buildFill(1.0022), []);

  const ribbonMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: ribbonVertex,
        fragmentShader: ribbonFragment,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
        premultipliedAlpha: true,
        uniforms: { uProgress: { value: 0 }, uTime: { value: 0 }, uColor: { value: CYAN } },
      }),
    [],
  );
  const fillMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: fillVertex,
        fragmentShader: fillFragment,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
        premultipliedAlpha: true,
        uniforms: { uOpacity: { value: 0 }, uTime: { value: 0 }, uColor: { value: CYAN } },
      }),
    [],
  );

  useFrame(({ clock }) => {
    ribbonMat.uniforms.uProgress.value = rig.outline;
    ribbonMat.uniforms.uTime.value = clock.elapsedTime;
    fillMat.uniforms.uOpacity.value = rig.fill;
    fillMat.uniforms.uTime.value = clock.elapsedTime;
    ribbonMat.visible = rig.outline > 0.001;
    fillMat.visible = rig.fill > 0.001;
  });

  return (
    <group>
      <mesh geometry={fill} material={fillMat} renderOrder={2} raycast={noRaycast} />
      <mesh geometry={ribbon} material={ribbonMat} renderOrder={3} raycast={noRaycast} />
    </group>
  );
}
