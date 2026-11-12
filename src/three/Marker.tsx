import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  RingGeometry,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three';
import { HOME } from '../data/portfolio';
import { placeAnchor } from '../lib/anchors';
import { clamp, latLon } from '../lib/geo';
import { rig } from '../lib/rig';
import { useApp } from '../lib/store';
import { beamFragment, uvVertex } from './shaders';
import { glowTexture } from './textures';

const noRaycast = () => null;
const CYAN = new Color('#63e6ff');

/** The beacon on Belagavi: a bright point, a beam of light and pulsing rings. */
export function Marker() {
  const group = useRef<Group>(null);
  const rings = useRef<(Mesh | null)[]>([]);
  const beam = useRef<Mesh>(null);
  const glow = useRef<Sprite>(null);

  const { position, quaternion } = useMemo(() => {
    const p = latLon(HOME.lat, HOME.lon, 1.003);
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), p.clone().normalize());
    return { position: p, quaternion: q };
  }, []);

  const beamGeo = useMemo(() => new CylinderGeometry(0.0022, 0.0009, 1, 10, 1, true).translate(0, 0.5, 0), []);
  const ringGeo = useMemo(() => new RingGeometry(0.88, 1, 64).rotateX(-Math.PI / 2), []);
  const beamMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: uvVertex,
        fragmentShader: beamFragment,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
        premultipliedAlpha: true,
        uniforms: { uColor: { value: CYAN }, uOpacity: { value: 1 } },
      }),
    [],
  );
  const ringMats = useMemo(
    () =>
      [0, 1, 2].map(
        () => new MeshBasicMaterial({ color: CYAN, transparent: true, depthWrite: false, side: DoubleSide, blending: AdditiveBlending }),
      ),
    [],
  );
  const glowMat = useMemo(
    () => new SpriteMaterial({ map: glowTexture(), color: CYAN, transparent: true, depthWrite: false, blending: AdditiveBlending }),
    [],
  );
  const v = useMemo(() => ({ world: new Vector3(), ndc: new Vector3() }), []);

  useFrame(({ camera, clock, size }) => {
    const g = group.current;
    if (!g) return;
    const m = rig.marker;
    g.visible = m > 0.01;
    if (!g.visible) {
      placeAnchor('marker', 0, 0, 0);
      return;
    }
    const t = clock.elapsedTime;
    const camDist = camera.position.distanceTo(position);
    const k = clamp(camDist * 0.75, 0.2, 1.3) * m; // stay readable from far away
    g.scale.setScalar(k);

    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const phase = (t * 0.45 + i / 3) % 1;
      ring.scale.setScalar(0.004 + phase * 0.07);
      ringMats[i].opacity = (1 - phase) * 0.85;
    });
    if (beam.current) beam.current.scale.set(1, 0.26 + 0.02 * Math.sin(t * 2.4), 1);
    if (glow.current) glow.current.scale.setScalar(0.075 + 0.012 * Math.sin(t * 3.1));

    // label: only while arriving, and only when Belagavi faces the camera
    const stage = useApp.getState().stage;
    const facing = position.dot(camera.position) > 1.02;
    const show = (stage === 'journey' || stage === 'location') && facing ? clamp((m - 0.4) * 2.5) : 0;
    v.ndc.copy(position).project(camera);
    placeAnchor('marker', (v.ndc.x * 0.5 + 0.5) * size.width, (-v.ndc.y * 0.5 + 0.5) * size.height, show);
  });

  return (
    <group ref={group} position={position} quaternion={quaternion} visible={false}>
      <mesh ref={beam} geometry={beamGeo} material={beamMat} renderOrder={5} raycast={noRaycast} />
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            rings.current[i] = el;
          }}
          geometry={ringGeo}
          material={ringMats[i]}
          renderOrder={5}
          raycast={noRaycast}
        />
      ))}
      <mesh renderOrder={5} raycast={noRaycast}>
        <sphereGeometry args={[0.0042, 16, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <sprite ref={glow} material={glowMat} renderOrder={5} raycast={noRaycast} />
    </group>
  );
}
