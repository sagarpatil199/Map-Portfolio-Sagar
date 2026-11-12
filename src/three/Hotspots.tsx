import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  DodecahedronGeometry,
  Group,
  IcosahedronGeometry,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  TorusKnotGeometry,
  Vector3,
} from 'three';
import { SECTIONS, type SectionMeta } from '../data/portfolio';
import { placeAnchor } from '../lib/anchors';
import { closeSection, openSection } from '../lib/director';
import { clamp, smooth } from '../lib/geo';
import { exploreLayout } from '../lib/layout';
import { rig } from '../lib/rig';
import { useApp } from '../lib/store';
import { glowTexture } from './textures';

function shapeGeometry(shape: SectionMeta['shape']): BufferGeometry {
  switch (shape) {
    case 'icosa':
      return new IcosahedronGeometry(1, 0);
    case 'octa':
      return new OctahedronGeometry(1.08, 0);
    case 'torus':
      return new TorusGeometry(0.78, 0.3, 10, 28);
    case 'cube':
      return new BoxGeometry(1.3, 1.3, 1.3);
    case 'knot':
      return new TorusKnotGeometry(0.62, 0.22, 64, 8);
    case 'dodeca':
      return new DodecahedronGeometry(1, 0);
    case 'cone':
      return new ConeGeometry(0.9, 1.5, 5);
    default:
      return new IcosahedronGeometry(1, 1);
  }
}

interface NodeObjects {
  group: Group;
  core: Mesh;
  shell: Mesh;
  ring: Mesh;
  glow: Sprite;
  tether: Line;
  coreMat: MeshStandardMaterial;
  shellMat: MeshBasicMaterial;
  ringMat: MeshBasicMaterial;
  glowMat: SpriteMaterial;
  tetherMat: LineBasicMaterial;
  hover: number;
  active: number;
}

const SIZE = 0.15;

/** Scene 4: one floating object per portfolio section, arranged around the Earth.
 *  They live in a frame that always faces the camera, so they stay put on screen
 *  while the planet turns behind them. */
export function Hotspots() {
  const frame = useRef<Group>(null);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const layout = useMemo(() => exploreLayout(aspect, SECTIONS.length), [aspect]);

  const nodes = useMemo<NodeObjects[]>(
    () =>
      SECTIONS.map((section) => {
        const color = new Color(section.color);
        const geo = shapeGeometry(section.shape);
        const coreMat = new MeshStandardMaterial({
          color: color.clone().multiplyScalar(0.55),
          emissive: color,
          emissiveIntensity: 0.4,
          metalness: 0.55,
          roughness: 0.22,
          flatShading: true,
          transparent: true,
        });
        const shellMat = new MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.16, depthWrite: false });
        const ringMat = new MeshBasicMaterial({ color, transparent: true, opacity: 0.55, depthWrite: false, blending: AdditiveBlending });
        const glowMat = new SpriteMaterial({ map: glowTexture(), color, transparent: true, opacity: 0.5, depthWrite: false, blending: AdditiveBlending });
        const tetherMat = new LineBasicMaterial({ color, transparent: true, opacity: 0.2, depthWrite: false, blending: AdditiveBlending });

        const core = new Mesh(geo, coreMat);
        core.scale.setScalar(SIZE);
        const shell = new Mesh(new IcosahedronGeometry(1, 0), shellMat);
        shell.scale.setScalar(SIZE * 1.75);
        const ring = new Mesh(new TorusGeometry(SIZE * 2.15, 0.0035, 6, 72), ringMat);
        const glow = new Sprite(glowMat);
        glow.scale.setScalar(SIZE * 7);
        const tetherGeo = new BufferGeometry();
        tetherGeo.setAttribute('position', new BufferAttribute(new Float32Array(6), 3));
        const tether = new Line(tetherGeo, tetherMat);
        tether.frustumCulled = false;
        for (const o of [core, shell, ring, glow, tether]) o.raycast = () => {};

        const group = new Group();
        group.add(glow, core, shell, ring);
        return { group, core, shell, ring, glow, tether, coreMat, shellMat, ringMat, glowMat, tetherMat, hover: 0, active: 0 };
      }),
    [],
  );

  useEffect(
    () => () => {
      document.body.style.cursor = '';
    },
    [],
  );

  const v = useMemo(() => ({ p: new Vector3(), s: new Vector3(), surface: new Vector3() }), []);

  useFrame(({ camera, clock, size }, delta) => {
    const f = frame.current;
    if (!f) return;
    f.quaternion.copy(camera.quaternion);
    const visible = rig.nodes > 0.001;
    f.visible = visible;
    const { hovered, activeSection, stage } = useApp.getState();
    const t = clock.elapsedTime;
    const n = nodes.length;
    const dt = Math.min(delta, 0.05);

    nodes.forEach((node, i) => {
      const section = SECTIONS[i];
      const appear = smooth(clamp(rig.nodes * (1 + 0.14 * n) - 0.14 * i));
      const isHover = hovered === section.id;
      const isActive = activeSection === section.id;
      node.hover += ((isHover ? 1 : 0) - node.hover) * Math.min(1, dt * 9);
      node.active += ((isActive ? 1 : 0) - node.active) * Math.min(1, dt * 6);
      const dim = activeSection && !isActive ? 0.3 : 1;

      const [x, y, z] = layout.positions[i];
      const bob = Math.sin(t * 0.7 + i * 1.7) * 0.045;
      const sway = Math.cos(t * 0.5 + i * 2.3) * 0.03;
      node.group.position.set(x + sway, y + bob, z);
      node.group.scale.setScalar(Math.max(0.0001, appear * (1 + node.hover * 0.22 + node.active * 0.3)));

      node.core.rotation.x = t * 0.35 + i;
      node.core.rotation.y = t * 0.5 + i * 2;
      node.shell.rotation.y = -t * 0.22 + i;
      node.shell.rotation.z = t * 0.14;
      node.ring.rotation.x = Math.PI / 2 + Math.sin(t * 0.4 + i) * 0.5;
      node.ring.rotation.y = t * 0.3 + i;

      node.coreMat.opacity = appear * dim;
      node.coreMat.emissiveIntensity = 0.4 + node.hover * 0.5 + node.active * 0.6;
      node.shellMat.opacity = (0.16 + node.hover * 0.3 + node.active * 0.25) * appear * dim;
      node.ringMat.opacity = (0.45 + node.hover * 0.4) * appear * dim;
      node.glowMat.opacity = (0.42 + node.hover * 0.3 + node.active * 0.3) * appear * dim;

      // thin line from the object down to the planet
      const arr = node.tether.geometry.attributes.position.array as Float32Array;
      v.surface.copy(node.group.position).normalize().multiplyScalar(1.04);
      arr.set([node.group.position.x, node.group.position.y, node.group.position.z, v.surface.x, v.surface.y, v.surface.z]);
      node.tether.geometry.attributes.position.needsUpdate = true;
      node.tetherMat.opacity = 0.22 * appear * dim;

      // text label under the object
      v.p.set(x + sway, y + bob - SIZE * 2.9, z).applyQuaternion(f.quaternion).project(camera);
      const show = stage === 'explore' && visible ? appear * (activeSection ? (isActive ? 1 : 0.35) : 1) : 0;
      placeAnchor(`node-${section.id}`, (v.p.x * 0.5 + 0.5) * size.width, (-v.p.y * 0.5 + 0.5) * size.height, show);
    });
  });

  const interactive = () => useApp.getState().stage === 'explore' && rig.nodes > 0.6;

  return (
    <group ref={frame} visible={false}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[-3, 4, 6]} intensity={2.4} />
      <pointLight position={[0, 0, 4]} intensity={6} color="#7fd4ff" />
      {nodes.map((node, i) => {
        const section = SECTIONS[i];
        return (
          <group key={section.id}>
            <primitive object={node.tether} />
            <primitive object={node.group}>
              {/* generous invisible hit area so the objects are easy to tap */}
              <mesh
                onPointerOver={(e) => {
                  if (!interactive()) return;
                  e.stopPropagation();
                  useApp.getState().setHovered(section.id);
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                  useApp.getState().setHovered(null);
                  document.body.style.cursor = '';
                }}
                onClick={(e) => {
                  if (!interactive()) return;
                  e.stopPropagation();
                  if (useApp.getState().activeSection === section.id) closeSection();
                  else openSection(section.id);
                }}
              >
                <sphereGeometry args={[SIZE * 2.4, 12, 10]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            </primitive>
          </group>
        );
      })}
    </group>
  );
}
