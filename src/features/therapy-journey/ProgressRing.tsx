import { useEffect, useRef, useState } from 'react';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

interface Props {
  /** 0–100 */
  progress: number;
  size?: number;
  /** Outer (progress) stroke width in px. */
  thickness?: number;
  /** Delay before the fill animation starts, for staggered reveals. */
  delay?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Single source of truth for every ring on the page. stroke-dashoffset is
 * computed from `progress` — no per-activity hardcoded dash values.
 */
export function ProgressRing({
  progress,
  size = 104,
  thickness = 6,
  delay = 0,
  className = '',
  children,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(reduced ? progress : 0);
  const mounted = useRef(false);

  useEffect(() => {
    if (reduced) {
      setShown(progress);
      return;
    }
    const wait = mounted.current ? 0 : delay;
    mounted.current = true;
    const t = window.setTimeout(() => setShown(progress), wait + 20);
    return () => window.clearTimeout(t);
  }, [progress, delay, reduced]);

  const outerR = (size - thickness) / 2;
  const innerR = outerR - thickness - 3;
  const c = 2 * Math.PI * outerR;
  const pct = Math.min(100, Math.max(0, shown));

  return (
    <div className={`vt-ring ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {/* secondary thin ring */}
        <circle
          className="vt-ring__hairline"
          cx={size / 2}
          cy={size / 2}
          r={innerR}
          fill="none"
          strokeWidth={1}
        />
        {/* track */}
        <circle
          className="vt-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={outerR}
          fill="none"
          strokeWidth={thickness}
        />
        {/* progress */}
        <circle
          className="vt-ring__value"
          cx={size / 2}
          cy={size / 2}
          r={outerR}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: reduced ? 'none' : 'stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)' }}
        />
      </svg>
      <div className="vt-ring__center">{children}</div>
    </div>
  );
}
