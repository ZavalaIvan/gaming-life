export function PhaseLock({ minLevel, label }: { minLevel: number; label: string }) {
  return (
    <section className="glass-card border-dashed border-sage/30 p-5">
      <p className="section-title">Bloqueado</p>
      <h2 className="mt-1 text-lg font-semibold text-moss">{label}</h2>
      <p className="mt-2 text-sm text-moss/70">Se desbloquea en Nivel {minLevel} del equipo.</p>
    </section>
  );
}
