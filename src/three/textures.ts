import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  LoadingManager,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from 'three';
import { IMAGES } from '../data/portfolio';
import { useApp } from '../lib/store';

export interface EarthTextures {
  day: Texture;
  night: Texture;
  brc: Texture; // R = height, G = land mask, B = clouds
  normal: Texture;
  detail: Texture; // sharper close-up of South Asia
}

/** The detail texture covers this box (degrees). */
export const DETAIL_BOX = { lon0: 60, lon1: 100, lat0: 0, lat1: 40 };

const url = (file: string) => `${import.meta.env.BASE_URL}textures/${file}`;

let cache: Promise<EarthTextures> | null = null;

/** Loads every Earth texture once and reports progress to the loader screen.
 *  Phones and low-memory devices get 2K maps, everything else gets 4K. */
export function loadEarthTextures(): Promise<EarthTextures> {
  if (cache) return cache;
  const { lowPower, setProgress } = useApp.getState();
  const res = lowPower ? '2k' : '4k';

  cache = new Promise((resolve, reject) => {
    const manager = new LoadingManager();
    const loader = new TextureLoader(manager);
    manager.onProgress = (_u, loaded, total) => setProgress(loaded / total);
    manager.onError = (failed) => reject(new Error(`Could not load ${failed}`));

    const color = (file: string) => {
      const t = loader.load(url(file));
      t.colorSpace = SRGBColorSpace;
      return t;
    };
    const data = (file: string) => loader.load(url(file));

    const textures: EarthTextures = {
      day: color(`earth_day_${res}.jpg`),
      night: color(`earth_night_${res}.jpg`),
      brc: data(`earth_brc_${res}.jpg`),
      normal: data('earth_normal_2k.jpg'),
      detail: color('india_detail.jpg'),
    };
    // warm the browser cache for the portrait so Scene 3 opens instantly
    const img = new Image();
    img.src = IMAGES.portrait.thumb ?? IMAGES.portrait.src;

    manager.onLoad = () => {
      for (const t of [textures.day, textures.night, textures.brc, textures.normal]) {
        t.wrapS = RepeatWrapping;
        t.wrapT = ClampToEdgeWrapping;
        t.anisotropy = 8;
        t.minFilter = LinearMipmapLinearFilter;
        t.magFilter = LinearFilter;
      }
      textures.detail.wrapS = textures.detail.wrapT = ClampToEdgeWrapping;
      textures.detail.anisotropy = 8;
      setProgress(1);
      resolve(textures);
    };
  });
  return cache;
}

/** Soft round glow used for stars' halos, the beacon and the floating objects. */
let glow: CanvasTexture | null = null;
export function glowTexture(): CanvasTexture {
  if (glow) return glow;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.14)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  glow = new CanvasTexture(canvas);
  return glow;
}
