interface LegendItem {
  color: string;
  label: string;
}

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  legend?: LegendItem[];
  note?: string;
  children: React.ReactNode;
}

export default function ChartWrapper({ title, subtitle, legend, note, children }: ChartWrapperProps) {
  return (
    <div className="chart-wrap">
      <div className="chart-title">{title}</div>
      {subtitle && <div className="chart-subtitle">{subtitle}</div>}
      {legend && (
        <div className="legend">
          {legend.map((item) => (
            <div key={item.label} className="legend-item">
              <div className="legend-dot" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      )}
      {children}
      {note && <div className="pareto-note">{note}</div>}
    </div>
  );
}
