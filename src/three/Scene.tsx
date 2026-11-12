import { Canvas } from '@react-three/fiber';
import { FOV } from '../lib/layout';
import { useApp } from '../lib/store';
import { CameraRig } from './CameraRig';
import { Earth } from './Earth';
import { Hotspots } from './Hotspots';
import { Karnataka } from './Karnataka';
import { Marker } from './Marker';
import { Reticle } from './Reticle';
import { Space } from './Space';
import type { EarthTextures } from './textures';

/** The single WebGL canvas behind the whole experience. */
export default function Scene({ tex }: { tex: EarthTextures }) {
  const lowPower = useApp((s) => s.lowPower);
  return (
    <Canvas
      className="scene"
      flat
      dpr={[1, lowPower ? 1.5 : 2]}
      camera={{ fov: FOV, near: 0.05, far: 500, position: [0, 0, 3] }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#02040a');
        // if the graphics context is lost for good, fall back to the simple backdrop
        gl.domElement.addEventListener('webglcontextlost', () => {
          window.setTimeout(() => {
            if (gl.getContext().isContextLost()) useApp.getState().setWebgl(false);
          }, 2500);
        });
      }}
    >
      <CameraRig />
      <Space starCount={lowPower ? 2600 : 5200} />
      <Earth tex={tex} segments={lowPower ? 96 : 144} />
      <Karnataka />
      <Reticle />
      <Marker />
      <Hotspots />
    </Canvas>
  );
}
