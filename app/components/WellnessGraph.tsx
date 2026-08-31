type Point = {
  date: string;
  sleepHours: number | null;
  mood: number | null;
  moved: boolean | null;
};

const W = 600;
const H = 80;
const PAD_X = 8;
const PAD_Y = 8;

type Marker = { x: number; y: number };

function sparklineGeom(
  values: (number | null)[],
  min: number,
  max: number,
): { path: string; markers: Marker[] } {
  const range = max - min || 1;
  const step = (W - PAD_X * 2) / Math.max(values.length - 1, 1);
  const markers: Marker[] = [];
  let d = "";
  let penUp = true;
  values.forEach((v, i) => {
    if (v == null) {
      penUp = true;
      return;
    }
    const x = PAD_X + i * step;
    const y = H - PAD_Y - ((v - min) / range) * (H - PAD_Y * 2);
    d += `${penUp ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
    markers.push({ x, y });
    penUp = false;
  });
  return { path: d.trim(), markers };
}

function dots(values: (boolean | null)[]) {
  const step = (W - PAD_X * 2) / Math.max(values.length - 1, 1);
  return values.map((v, i) => ({
    x: PAD_X + i * step,
    y: H / 2,
    on: v === true,
  }));
}

function Sparkline({
  label,
  geom,
  hint,
}: {
  label: string;
  geom: { path: string; markers: Marker[] };
  hint: string;
}) {
  return (
    <div className="rounded border border-parchment-200 bg-parchment-50 p-4 dark:border-navy-800 dark:bg-navy-900">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-navy-800 dark:text-parchment-200">
          {label}
        </h3>
        <span className="text-xs text-slate-500">{hint}</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-20 w-full text-crimson-600 dark:text-crimson-500"
        preserveAspectRatio="none"
      >
        <path
          d={geom.path}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {geom.markers.map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r={2} fill="currentColor" />
        ))}
      </svg>
    </div>
  );
}

export function WellnessGraph({ points }: { points: Point[] }) {
  const hasData = points.some(
    (p) => p.sleepHours != null || p.mood != null || p.moved != null,
  );

  if (!hasData) {
    return (
      <div className="rounded border border-dashed border-parchment-200 p-8 text-center text-sm text-slate-500 dark:border-navy-700">
        Your last 30 days will show up here once you start checking in.
      </div>
    );
  }

  const sleepGeom = sparklineGeom(
    points.map((p) => p.sleepHours),
    0,
    12,
  );
  const moodGeom = sparklineGeom(
    points.map((p) => p.mood),
    1,
    5,
  );
  const movedDots = dots(points.map((p) => p.moved));

  const movedCount = points.filter((p) => p.moved === true).length;

  return (
    <div className="grid gap-3">
      <Sparkline label="Sleep" geom={sleepGeom} hint="hours, 0–12" />
      <Sparkline label="Mood" geom={moodGeom} hint="1 rough → 5 solid" />
      <div className="rounded border border-parchment-200 bg-parchment-50 p-4 dark:border-navy-800 dark:bg-navy-900">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-navy-800 dark:text-parchment-200">
            Moved
          </h3>
          <span className="text-xs text-slate-500">
            {movedCount} / {points.length} days
          </span>
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-20 w-full"
          preserveAspectRatio="none"
        >
          {movedDots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.on ? 4 : 2}
              className={
                d.on
                  ? "fill-crimson-600 dark:fill-crimson-500"
                  : "fill-parchment-200 dark:fill-navy-700"
              }
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
