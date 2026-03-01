type ProgressBarProps = {
  current: number;
  max: number;
  label: string;
  tone?: "default" | "light";
};

export function ProgressBar({ current, max, label, tone = "default" }: ProgressBarProps) {
  const width = Math.max(6, Math.min(100, (current / Math.max(max, 1)) * 100));
  const containerClass = tone === "light" ? "bg-white/15" : "bg-base-300";
  const barClass = tone === "light" ? "bg-accent" : "bg-gradient-to-r from-gold via-accent to-warning";
  const labelClass = tone === "light" ? "text-white/80" : "text-moss/70";

  return (
    <div>
      <div className={`relative h-3 overflow-hidden rounded-full ${containerClass}`}>
        <div className={`relative h-3 rounded-full ${barClass} transition-all duration-1000 ease-out`} style={{ width: `${width}%` }}>
          <div className="progress-sheen absolute inset-y-0 right-0 w-12" />
        </div>
      </div>
      <p className={`mt-2 text-sm ${labelClass}`}>{label}</p>
    </div>
  );
}
