import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BackSide, ShaderMaterial, SphereGeometry, Vector4 } from 'three';
import { rig, sunDir } from '../lib/rig';
import { atmosphereFragment, atmosphereVertex, cloudFragment, earthFragment, earthVertex } from './shaders';
import { DETAIL_BOX, type EarthTextures } from './textures';

const ATMOSPHERE_RADIUS = 1.13;
const noRaycast = () => null;

export function Earth({ tex, segments }: { tex: EarthTextures; segments: number }) {
  const geometry = useMemo(() => new SphereGeometry(1, segments, Math.round(segments * 0.75)), [segments]);

  const earth = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: earthVertex,
        fragmentShader: earthFragment,
        uniforms: {
          uDay: { value: tex.day },
          uNight: { value: tex.night },
          uBrc: { value: tex.brc },
          uNormal: { value: tex.normal },
          uDetail: { value: tex.detail },
          uDetailBox: {
            value: new Vector4(
              (DETAIL_BOX.lon0 + 180) / 360,
              (DETAIL_BOX.lat0 + 90) / 180,
              (DETAIL_BOX.lon1 + 180) / 360,
              (DETAIL_BOX.lat1 + 90) / 180,
            ),
          },
          uDetailMix: { value: 0 },
          uClouds: { value: 1 },
          uCloudShift: { value: 0 },
          uSun: { value: sunDir },
        },
      }),
    [tex],
  );

  const clouds = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: earthVertex,
        fragmentShader: cloudFragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uBrc: { value: tex.brc },
          uOpacity: { value: 1 },
          uCloudShift: { value: 0 },
          uSun: { value: sunDir },
        },
      }),
    [tex],
  );

  const atmosphere = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        side: BackSide,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        premultipliedAlpha: true,
        uniforms: { uSun: { value: sunDir }, uRadius: { value: ATMOSPHERE_RADIUS } },
      }),
    [],
  );

  useFrame(({ clock }) => {
    const shift = (clock.elapsedTime * 0.0009) % 1; // clouds drift slowly over the ground
    earth.uniforms.uCloudShift.value = shift;
    earth.uniforms.uClouds.value = rig.clouds;
    earth.uniforms.uDetailMix.value = rig.detail;
    clouds.uniforms.uCloudShift.value = shift;
    clouds.uniforms.uOpacity.value = rig.clouds;
  });

  return (
    <group>
      <mesh geometry={geometry} material={earth} raycast={noRaycast} />
      <mesh geometry={geometry} material={clouds} scale={1.007} renderOrder={1} raycast={noRaycast} />
      <mesh geometry={geometry} material={atmosphere} scale={ATMOSPHERE_RADIUS} renderOrder={6} raycast={noRaycast} />
    </group>
  );
}
