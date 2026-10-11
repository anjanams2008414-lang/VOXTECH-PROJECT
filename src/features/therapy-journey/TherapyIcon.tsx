/**
 * Original line icons drawn for this feature — no third-party or
 * screenshot-derived artwork.
 *
 * If Voxtech already ships lucide-react (or similar), delete this file and
 * map ids to the library instead, e.g.
 *   breathing → Wind, sound-practice → Mic, word-practice → MessageSquare,
 *   sentence-building → AlignLeft, conversation → MessagesSquare,
 *   storytelling → BookOpen
 */

interface Props {
  id: string;
  size?: number;
  className?: string;
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function TherapyIcon({ id, size = 30, className = '' }: Props) {
  const wrap = (children: React.ReactNode) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role="presentation"
      aria-hidden="true"
      {...stroke}
    >
      {children}
    </svg>
  );

  switch (id) {
    case 'breathing': // airflow curves rising from a calm centre
      return wrap(
        <>
          <path d="M3 9h9a3 3 0 1 0-3-3" />
          <path d="M3 14h13a3.5 3.5 0 1 1-3.5 3.5" />
          <path d="M17 9h2.5a2.5 2.5 0 1 0-2.5-2.5" />
        </>,
      );
    case 'sound-practice': // mic with a returning waveform
      return wrap(
        <>
          <rect x="9" y="2.5" width="6" height="10" rx="3" />
          <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
          <path d="M12 17.5v4" />
          <path d="M3 8v3M21 8v3" />
        </>,
      );
    case 'word-practice': // single word inside a bubble
      return wrap(
        <>
          <path d="M20 12.5a7.5 7.5 0 0 1-7.5 7.5H9l-4 3v-3.9A7.5 7.5 0 0 1 12.5 5h0A7.5 7.5 0 0 1 20 12.5Z" />
          <path d="M9 12.5h7" />
        </>,
      );
    case 'sentence-building': // stacked phrase blocks
      return wrap(
        <>
          <rect x="2.5" y="5" width="8" height="5" rx="1.6" />
          <rect x="13" y="5" width="8.5" height="5" rx="1.6" />
          <rect x="2.5" y="13.5" width="14" height="5" rx="1.6" />
          <path d="M19.5 16h2" />
        </>,
      );
    case 'conversation': // two bubbles taking turns
      return wrap(
        <>
          <path d="M3 9.5A4.5 4.5 0 0 1 7.5 5h4A4.5 4.5 0 0 1 16 9.5 4.5 4.5 0 0 1 11.5 14h-4L3 17Z" />
          <path d="M18 9.6A4.4 4.4 0 0 1 21 13.8a4.4 4.4 0 0 1-4.4 4.4h-2.2L11 21v-2.9" />
        </>,
      );
    case 'storytelling': // open book with a voice curl
      return wrap(
        <>
          <path d="M12 8.5S10 6.5 6 6.5H3v12h3c4 0 6 2 6 2s2-2 6-2h3v-12h-3c-4 0-6 2-6 2Z" />
          <path d="M12 8.5v12" />
          <path d="M16.5 3.5c1.6 0 1.6 2 0 2" />
        </>,
      );
    default:
      return wrap(<circle cx="12" cy="12" r="8" />);
  }
}

export function CheckBadgeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={2.6}>
      <path d="M4.5 12.5l5 5L19.5 7" />
    </svg>
  );
}

export function LockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={2}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function SparkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={2}>
      <path d="M12 3.5l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5L4.5 11l5.5-2Z" />
    </svg>
  );
}
