import type { ActivityBucket, Severity } from '@/lib/types';

const SERIES: { key: Severity; stroke: string }[] = [
  { key: 'CRITICAL', stroke: 'var(--severity-critical)' },
  { key: 'HIGH', stroke: 'var(--severity-high)' },
  { key: 'MEDIUM', stroke: 'var(--severity-medium)' },
];

const WIDTH = 1000;
const HEIGHT = 120;

/*
 * Alert volume by severity across the window, drawn as plain SVG rather
 * than pulling in a charting library for three polylines.
 */
export function ActivityChart({
  series,
  windowMinutes,
}: {
  series: ActivityBucket[];
  windowMinutes: number;
}) {
  const peak = Math.max(
    1,
    ...series.flatMap((bucket) => SERIES.map(({ key }) => bucket[key])),
  );

  const x = (index: number) =>
    series.length <= 1 ? 0 : (index / (series.length - 1)) * WIDTH;

  const y = (value: number) => HEIGHT - (value / peak) * (HEIGHT - 8) - 4;

  const labels = series.filter(
    (_, index) => index % Math.max(1, Math.floor(series.length / 6)) === 0,
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[10px] tracking-[0.14em] uppercase">
          Alert activity — last {windowMinutes} min
        </span>
        <div className="flex items-center gap-3">
          {SERIES.map(({ key, stroke }) => (
            <span
              key={key}
              className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wider uppercase"
            >
              <span
                className="inline-block h-px w-3.5"
                style={{ backgroundColor: stroke }}
                aria-hidden
              />
              {key}
            </span>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-28 w-full"
        role="img"
        aria-label={`Alert activity over the last ${windowMinutes} minutes, peak ${peak} in a bucket`}
      >
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1={0}
            x2={WIDTH}
            y1={HEIGHT * fraction}
            y2={HEIGHT * fraction}
            stroke="var(--border)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {SERIES.map(({ key, stroke }) => (
          <polyline
            key={key}
            fill="none"
            stroke={stroke}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            points={series
              .map((bucket, index) => `${x(index)},${y(bucket[key])}`)
              .join(' ')}
          />
        ))}
      </svg>

      <div className="text-muted-foreground flex justify-between text-[10px] tabular-nums">
        {labels.map((bucket) => (
          <span key={bucket.at}>
            {new Date(bucket.at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ))}
      </div>
    </div>
  );
}
