/* GLSL for the planet. Kept in one file so the look can be tuned in one place. */

export const earthVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPosW = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const earthFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uBrc;
  uniform sampler2D uNormal;
  uniform sampler2D uDetail;
  uniform vec4 uDetailBox;   // u0, v0, u1, v1
  uniform float uDetailMix;
  uniform float uClouds;
  uniform float uCloudShift;
  uniform vec3 uSun;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);
    vec3 brc = texture2D(uBrc, vUv).rgb;
    float land = smoothstep(0.35, 0.65, brc.g);
    float ocean = 1.0 - land;

    // terrain relief from the normal map (tangent frame of a sphere)
    vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), N));
    vec3 B = cross(N, T);
    vec3 nm = texture2D(uNormal, vUv).xyz * 2.0 - 1.0;
    nm.xy *= 0.9 * land;
    vec3 Nn = normalize(T * nm.x + B * nm.y + N * nm.z);

    // surface colour, with a sharper patch over South Asia for the close-up
    vec3 day = texture2D(uDay, vUv).rgb;
    vec2 duv = (vUv - uDetailBox.xy) / (uDetailBox.zw - uDetailBox.xy);
    if (uDetailMix > 0.0 && duv.x > 0.0 && duv.x < 1.0 && duv.y > 0.0 && duv.y < 1.0) {
      vec2 edge = smoothstep(vec2(0.0), vec2(0.12), duv) * smoothstep(vec2(0.0), vec2(0.12), 1.0 - duv);
      day = mix(day, texture2D(uDetail, duv).rgb, edge.x * edge.y * uDetailMix);
    }
    // grade: deeper oceans, slightly richer land
    day = mix(day, day * vec3(0.42, 0.62, 1.0), ocean * 0.55);
    day = mix(vec3(dot(day, vec3(0.299, 0.587, 0.114))), day, 1.12);

    float ndlGeo = dot(N, uSun);
    float ndl = dot(Nn, uSun);
    float dayMix = smoothstep(-0.14, 0.28, ndlGeo);

    // sunlight
    float diffuse = clamp(ndl * 0.92 + 0.08, 0.0, 1.0);
    vec3 col = day * diffuse * 1.28 * dayMix;

    // soft cloud shadows on the ground
    float shadow = texture2D(uBrc, vUv + vec2(uCloudShift + 0.0022, 0.0012)).b;
    col *= 1.0 - 0.42 * shadow * uClouds;

    // sun glint on water
    vec3 H = normalize(uSun + V);
    float spec = pow(max(dot(N, H), 0.0), 160.0) * 0.42 + pow(max(dot(N, H), 0.0), 18.0) * 0.03;
    col += vec3(1.0, 0.93, 0.82) * spec * ocean * dayMix;

    // city lights on the night side
    vec3 night = texture2D(uNight, vUv).rgb;
    float cloudAbove = texture2D(uBrc, vUv + vec2(uCloudShift, 0.0)).b * uClouds;
    vec3 lights = pow(night, vec3(1.35)) * vec3(1.0, 0.8, 0.52) * 2.1;
    col += lights * (1.0 - dayMix) * (1.0 - 0.6 * cloudAbove);
    col += day * 0.012 * (1.0 - dayMix);

    // warm band along the terminator
    float twilight = smoothstep(-0.2, 0.02, ndlGeo) * (1.0 - smoothstep(0.02, 0.34, ndlGeo));
    col += vec3(0.95, 0.42, 0.16) * twilight * 0.07;

    // air: blue haze towards the limb
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    col = mix(col, vec3(0.32, 0.6, 1.0) * (0.15 + 0.95 * dayMix), fres * 0.62);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export const cloudFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uBrc;
  uniform float uOpacity;
  uniform float uCloudShift;
  uniform vec3 uSun;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);
    float c = texture2D(uBrc, vUv + vec2(uCloudShift, 0.0)).b;
    float ndl = dot(N, uSun);
    float light = smoothstep(-0.22, 0.45, ndl);
    float twilight = smoothstep(-0.25, 0.0, ndl) * (1.0 - smoothstep(0.0, 0.35, ndl));
    vec3 col = vec3(1.0) * (0.035 + 1.05 * light) + vec3(1.0, 0.5, 0.25) * twilight * 0.3;
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.0);
    float alpha = smoothstep(0.08, 0.95, c) * uOpacity * (0.92 - 0.25 * rim);
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

export const atmosphereVertex = /* glsl */ `
  varying vec3 vPosW;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPosW = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

/* Glow outside the limb. For each pixel we find how close the view ray
   passes to the planet: the closer to the surface, the brighter the air. */
export const atmosphereFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uSun;
  uniform float uRadius;
  varying vec3 vPosW;
  void main() {
    vec3 dir = normalize(vPosW - cameraPosition);
    float t = -dot(cameraPosition, dir);
    vec3 closest = cameraPosition + dir * t;
    float d = length(closest);
    float h = clamp((d - 1.0) / (uRadius - 1.0), 0.0, 1.0);
    float glow = pow(1.0 - h, 3.4);
    float inner = pow(1.0 - h, 9.0);
    float sun = dot(normalize(closest), uSun);
    float lit = smoothstep(-0.55, 0.5, sun);
    vec3 col = mix(vec3(0.16, 0.42, 1.0), vec3(0.55, 0.85, 1.0), inner);
    col = mix(col, vec3(1.0, 0.55, 0.3), (1.0 - smoothstep(-0.1, 0.3, sun)) * smoothstep(-0.55, -0.1, sun) * 0.45);
    float alpha = (glow * 0.6 + inner * 0.7) * (0.06 + 0.94 * lit);
    gl_FragColor = vec4(col * alpha, alpha);
    #include <colorspace_fragment>
  }
`;

export const starVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uScale;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    float tw = 0.72 + 0.28 * sin(uTime * (0.6 + aPhase * 1.7) + aPhase * 40.0);
    vAlpha = tw;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale * tw;
    gl_Position = projectionMatrix * mv;
  }
`;

export const starFragment = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a = a * a;
    gl_FragColor = vec4(vColor * a * vAlpha, a * vAlpha);
  }
`;

/* Faint blue nebula so space is not flat black. */
export const nebulaFragment = /* glsl */ `
  precision mediump float;
  varying vec3 vDir;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.07; a *= 0.5; } return v; }
  void main() {
    vec3 d = normalize(vDir);
    float n = fbm(d * 2.2 + 3.0);
    float band = exp(-pow(d.y * 1.6 + 0.35 * sin(d.x * 2.0), 2.0) * 2.2);
    float cloud = smoothstep(0.42, 0.85, n) * (0.35 + 0.65 * band);
    vec3 col = mix(vec3(0.003, 0.006, 0.016), vec3(0.016, 0.04, 0.105), cloud);
    col += vec3(0.035, 0.016, 0.06) * smoothstep(0.6, 0.95, fbm(d * 3.4 - 5.0)) * band * 0.5;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export const nebulaVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* Glowing border ribbon that can draw itself in. */
export const ribbonVertex = /* glsl */ `
  attribute float aAlong;
  attribute float aSide;
  varying float vAlong;
  varying float vSide;
  void main() {
    vAlong = aAlong;
    vSide = aSide;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ribbonFragment = /* glsl */ `
  precision mediump float;
  uniform float uProgress;
  uniform float uTime;
  uniform vec3 uColor;
  varying float vAlong;
  varying float vSide;
  void main() {
    if (vAlong > uProgress) discard;
    float core = smoothstep(0.32, 0.0, abs(vSide));
    float halo = pow(1.0 - abs(vSide), 2.5) * 0.55;
    float head = smoothstep(0.035, 0.0, uProgress - vAlong) * step(uProgress, 0.999);
    float pulse = 0.82 + 0.18 * sin(vAlong * 60.0 - uTime * 2.2);
    float a = (core + halo) * pulse + head * 1.5 * (1.0 - abs(vSide));
    gl_FragColor = vec4(mix(uColor, vec3(1.0), core * 0.55 + head) * a, a);
  }
`;

export const fillFragment = /* glsl */ `
  precision mediump float;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vLL;
  void main() {
    float scan = 0.5 + 0.5 * sin(vLL.y * 9.0 - uTime * 1.3);
    float grid = smoothstep(0.92, 1.0, abs(sin(vLL.x * 6.2832))) + smoothstep(0.92, 1.0, abs(sin(vLL.y * 6.2832)));
    float a = (0.13 + 0.07 * scan + 0.1 * grid) * uOpacity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

export const fillVertex = /* glsl */ `
  attribute vec2 aLL;
  varying vec2 vLL;
  void main() {
    vLL = aLL;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const beamFragment = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float a = pow(1.0 - vUv.y, 1.6) * uOpacity;
    gl_FragColor = vec4(mix(uColor, vec3(1.0), 0.4 * (1.0 - vUv.y)) * a, a);
  }
`;

export const uvVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
