import { monthName } from "@/lib/utils";

export function BarChart({ data, suffix = "", maxValue }: { data: number[]; suffix?: string; maxValue?: number }) {
  const max = maxValue ?? Math.max(...data, 1);
  return (
    <div className="bar-chart" aria-label="Grafik bulanan">
      {data.map((value, index) => (
        <div className="bar-col" key={index}>
          <div className="bar-track" title={`${monthName(index)}: ${value}${suffix}`}>
            <div className="bar-fill" style={{ height: `${Math.max(value ? 8 : 2, (value / max) * 100)}%` }} />
          </div>
          <span>{monthName(index)}</span>
        </div>
      ))}
    </div>
  );
}

export function Donut({ value, total, label }: { value: number; total: number; label: string }) {
  const pct = total ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(var(--brand) ${pct * 3.6}deg, var(--surface-3) 0deg)` }}>
        <div className="donut-inner"><strong>{pct}%</strong><span>{label}</span></div>
      </div>
    </div>
  );
}

export function GenreBars({ items }: { items: Array<{ label: string; value: number }> }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="genre-bars">
      {items.map((item) => (
        <div className="genre-row" key={item.label}>
          <div className="genre-label"><span>{item.label}</span><strong>{item.value}</strong></div>
          <div className="progress slim"><span style={{ width: `${(item.value / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}
