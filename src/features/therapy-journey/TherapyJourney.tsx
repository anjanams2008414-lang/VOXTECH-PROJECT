import { useLayoutEffect, useRef, useState } from 'react';
import { TherapyNode } from './TherapyNode';
import { RecommendationCallout } from './RecommendationCallout';
import type { TherapyActivity } from './types';

interface Props {
  activities: TherapyActivity[];
  recommended: TherapyActivity | null;
  onOpen: (a: TherapyActivity) => void;
  onStart: (a: TherapyActivity) => void;
}

/**
 * The connector is measured from the real DOM positions of the node buttons,
 * so it re-flows when spacing, font size, screen size, or the number of
 * activities changes. No background images.
 */
export function TherapyJourney({ activities, recommended, onOpen, onStart }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<{ d: string; done: string; w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;

    const measure = () => {
      const nodes = Array.from(el.querySelectorAll<HTMLElement>('.vt-node__button'));
      if (nodes.length < 2) return setPath(null);
      const box = el.getBoundingClientRect();
      const pts = nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2, r: r.width / 2 };
      });

      const seg = (a: typeof pts[0], b: typeof pts[0]) => {
        const y1 = a.y + a.r + 4;
        const y2 = b.y - b.r - 4;
        const bend = Math.min(34, (y2 - y1) / 2);
        return `M ${a.x} ${y1} C ${a.x + bend} ${y1 + bend}, ${b.x - bend} ${y2 - bend}, ${b.x} ${y2}`;
      };

      let all = '';
      let done = '';
      for (let i = 0; i < pts.length - 1; i++) {
        const d = seg(pts[i], pts[i + 1]);
        all += `${d} `;
        if (activities[i]?.status === 'completed') done += `${d} `;
      }
      setPath({ d: all.trim(), done: done.trim(), w: box.width, h: box.height });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const t = window.setTimeout(measure, 120); // after fonts settle
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, [activities]);

  return (
    <div className="vt-journey-wrap" ref={wrap}>
      {path && (
        <svg
          className="vt-connector"
          width={path.w}
          height={path.h}
          viewBox={`0 0 ${path.w} ${path.h}`}
          aria-hidden="true"
        >
          <path className="vt-connector__base" d={path.d} />
          {path.done && <path className="vt-connector__done" d={path.done} />}
        </svg>
      )}

      <ol className="vt-journey">
        {activities.map((a, i) => (
          <li key={a.id} className="vt-journey__row">
            <TherapyNode activity={a} index={i} onOpen={onOpen} />
            {recommended?.id === a.id && (
              <RecommendationCallout activity={a} onStart={onStart} />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
