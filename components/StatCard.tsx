interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  valueClass?: string;
}

export default function StatCard({
  label,
  value,
  sub,
  valueClass,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className={`value${valueClass ? " " + valueClass : ""}`}>
        {value}
      </div>
      <div className="sub">{sub}</div>
    </div>
  );
}
