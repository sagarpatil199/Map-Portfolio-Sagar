import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BackSide, BufferAttribute, BufferGeometry, Color, Group, ShaderMaterial } from 'three';
import { DEG } from '../lib/geo';
import { rig } from '../lib/rig';
import { nebulaFragment, nebulaVertex, starFragment, starVertex } from './shaders';

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pointCloud(count: number, rMin: number, rMax: number, sizeMin: number, sizeMax: number, seed: number) {
  const rand = seeded(seed);
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const phase = new Float32Array(count);
  const color = new Float32Array(count * 3);
  const tints = [new Color('#ffffff'), new Color('#bcd8ff'), new Color('#8fc4ff'), new Color('#ffe9c9'), new Color('#9ff1ff')];
  for (let i = 0; i < count; i++) {
    const u = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const r = rMin + (rMax - rMin) * rand();
    const s = Math.sqrt(1 - u * u);
    pos.set([Math.cos(a) * s * r, u * r, Math.sin(a) * s * r], i * 3);
    const big = rand();
    size[i] = sizeMin + (sizeMax - sizeMin) * big * big * big;
    phase[i] = rand();
    const c = tints[Math.floor(rand() * tints.length)];
    const b = 0.45 + 0.55 * rand();
    color.set([c.r * b, c.g * b, c.b * b], i * 3);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(pos, 3));
  g.setAttribute('aSize', new BufferAttribute(size, 1));
  g.setAttribute('aPhase', new BufferAttribute(phase, 1));
  g.setAttribute('aColor', new BufferAttribute(color, 3));
  return g;
}

const noRaycast = () => null;

/** Deep space: a faint nebula, thousands of twinkling stars and slow drifting dust. */
export function Space({ starCount }: { starCount: number }) {
  const sky = useRef<Group>(null);
  const dust = useRef<Group>(null);
  const dpr = useThree((s) => s.viewport.dpr);

  const stars = useMemo(() => pointCloud(starCount, 150, 190, 1.1, 4.6, 7), [starCount]);
  const motes = useMemo(() => pointCloud(260, 2.2, 9, 1.0, 2.6, 23), []);

  const starMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: starVertex,
        fragmentShader: starFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        premultipliedAlpha: true,
        uniforms: { uTime: { value: 0 }, uScale: { value: 1 } },
      }),
    [],
  );
  const dustMat = useMemo(() => {
    const m = starMat.clone();
    m.uniforms = { uTime: { value: 0 }, uScale: { value: 1 } };
    return m;
  }, [starMat]);
  const nebula = useMemo(
    () => new ShaderMaterial({ vertexShader: nebulaVertex, fragmentShader: nebulaFragment, side: BackSide, depthWrite: false }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    starMat.uniforms.uTime.value = t;
    starMat.uniforms.uScale.value = dpr;
    dustMat.uniforms.uTime.value = t * 0.6;
    dustMat.uniforms.uScale.value = dpr * 0.8;
    // the sky mostly follows the camera so it reads as the Earth turning, not the camera flying
    if (sky.current) sky.current.rotation.y = rig.lon * DEG * 0.93;
    if (dust.current) {
      dust.current.rotation.y = rig.lon * DEG * 0.7 + t * 0.012;
      dust.current.rotation.x = Math.sin(t * 0.03) * 0.2;
    }
  });

  return (
    <>
      <group ref={sky}>
        <mesh material={nebula} renderOrder={-10} raycast={noRaycast}>
          <sphereGeometry args={[220, 32, 24]} />
        </mesh>
        <points geometry={stars} material={starMat} renderOrder={-9} raycast={noRaycast} />
      </group>
      <group ref={dust}>
        <points geometry={motes} material={dustMat} raycast={noRaycast} />
      </group>
    </>
  );
}
