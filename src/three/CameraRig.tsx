import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Vector3 } from 'three';
import { latLon } from '../lib/geo';
import { rig, sunDir } from '../lib/rig';

/** Turns the rig numbers into an actual camera position every frame. */
export function CameraRig() {
  const v = useMemo(() => ({ pos: new Vector3(), look: new Vector3(), right: new Vector3(), up: new Vector3() }), []);

  useFrame(({ camera, size }, delta) => {
    const dt = Math.min(delta, 0.05);
    rig.lon -= rig.drift * dt * 3.2;

    latLon(rig.lat, rig.lon, rig.dist, v.pos);
    latLon(rig.lookLat, rig.lookLon, rig.lookR, v.look);
    camera.position.copy(v.pos);
    camera.up.set(0, 1, 0);
    camera.lookAt(v.look);

    const cam = camera as PerspectiveCamera;
    if (Math.abs(rig.shiftX) > 1e-4 || Math.abs(rig.shiftY) > 1e-4) {
      cam.setViewOffset(size.width, size.height, -rig.shiftX * size.width, -rig.shiftY * size.height, size.width, size.height);
    } else if (cam.view && cam.view.enabled) {
      cam.clearViewOffset();
    }
    cam.updateMatrixWorld();

    // the sun stays up and to the side of the camera so the day side is always in view
    v.right.setFromMatrixColumn(cam.matrixWorld, 0);
    v.up.setFromMatrixColumn(cam.matrixWorld, 1);
    sunDir.copy(v.pos).normalize().addScaledVector(v.right, rig.sunSide).addScaledVector(v.up, rig.sunUp).normalize();
  }, -2);

  return null;
}
