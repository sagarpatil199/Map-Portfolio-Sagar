import { useEffect, useMemo, useRef, useState } from 'react';
import { SKILLS } from '../../data/portfolio';
import { reducedMotion } from '../../lib/store';

interface Tag {
  name: string;
  group: string;
}

/** A sphere of skills that turns on its own and can be spun by dragging. */
function SkillSphere({ tags, activeGroup, onPick }: { tags: Tag[]; activeGroup: string | null; onPick: (group: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLButtonElement | null)[]>([]);

  // evenly spread points on a sphere
  const points = useMemo(() => {
    const n = tags.length;
    return tags.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = i * Math.PI * (3 - Math.sqrt(5));
      return [Math.cos(a) * r, y, Math.sin(a) * r] as [number, number, number];
    });
  }, [tags]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const still = reducedMotion();
    let vx = still ? 0 : 0.0022; // spin around Y
    let vy = still ? 0 : 0.0009; // spin around X
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let moved = 0;
    let raf = 0;

    const down = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      vx = dx * 0.0045;
      vy = -dy * 0.0045;
      lastX = e.clientX;
      lastY = e.clientY;
      if (moved > 6) el.dataset.dragged = '1';
    };
    const up = () => {
      dragging = false;
      window.setTimeout(() => delete el.dataset.dragged, 0);
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);

    const tick = () => {
      const radius = Math.min(el.clientWidth, el.clientHeight) * 0.4;
      const cy = Math.cos(vx);
      const sy = Math.sin(vx);
      const cx = Math.cos(vy);
      const sx = Math.sin(vy);
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        // rotate around Y, then around X
        const x1 = p[0] * cy + p[2] * sy;
        const z1 = -p[0] * sy + p[2] * cy;
        const y2 = p[1] * cx - z1 * sx;
        const z2 = p[1] * sx + z1 * cx;
        p[0] = x1;
        p[1] = y2;
        p[2] = z2;
        const node = els.current[i];
        if (!node) continue;
        const depth = (z2 + 1) / 2; // 0 = back, 1 = front
        node.style.transform = `translate(-50%, -50%) translate3d(${(x1 * radius).toFixed(1)}px, ${(-y2 * radius).toFixed(1)}px, 0) scale(${(0.62 + depth * 0.5).toFixed(3)})`;
        node.style.opacity = (0.18 + depth * 0.82).toFixed(3);
        node.style.zIndex = String(Math.round(depth * 100));
        node.style.filter = depth < 0.35 ? 'blur(1px)' : 'none';
      }
      if (!dragging && !still) {
        // ease back to a slow idle spin
        vx += (0.0022 * Math.sign(vx || 1) - vx) * 0.02;
        vy += (0.0009 * Math.sign(vy || 1) - vy) * 0.02;
      } else if (!dragging) {
        vx *= 0.94;
        vy *= 0.94;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [points]);

  return (
    <div className="sphere" ref={box} aria-label="Interactive skill sphere. Drag to spin.">
      <span className="sphere-core" aria-hidden />
      <span className="sphere-orbit" aria-hidden />
      {tags.map((t, i) => (
        <button
          key={t.name}
          ref={(el) => {
            els.current[i] = el;
          }}
          className={`sphere-tag ${activeGroup === t.group ? 'on' : ''} ${activeGroup && activeGroup !== t.group ? 'off' : ''}`}
          onClick={() => {
            if (box.current?.dataset.dragged) return;
            onPick(t.group);
          }}
        >
          {t.name}
        </button>
      ))}
    </div>
  );
}

export function Skills() {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const tags = useMemo(() => SKILLS.flatMap((g) => g.items.map((name) => ({ name, group: g.group }))), []);
  const toggle = (group: string) => setActiveGroup((g) => (g === group ? null : group));

  return (
    <>
      <SkillSphere tags={tags} activeGroup={activeGroup} onPick={toggle} />
      <p className="hint center">Drag the sphere to spin it. Select a skill to highlight its group.</p>
      <div className="skill-groups">
        {SKILLS.map((g) => (
          <button
            key={g.group}
            className={`skill-group ${activeGroup === g.group ? 'on' : ''} ${activeGroup && activeGroup !== g.group ? 'off' : ''}`}
            onClick={() => toggle(g.group)}
            aria-pressed={activeGroup === g.group}
          >
            <small>{g.group}</small>
            <span className="chips">
              {g.items.map((s) => (
                <span className="chip" key={s}>
                  {s}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
