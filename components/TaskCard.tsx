"use client";

import { useMemo, useState } from "react";
import { TaskView } from "@/lib/selectors";

type TaskCardProps = {
  task: TaskView;
  onComplete: () => void;
  compact?: boolean;
};

const typeLabels: Record<TaskView["type"], string> = {
  daily: "diaria",
  recurring: "recurrente",
  oneTime: "unica",
  timed: "reto"
};

export function TaskCard({ task, onComplete }: TaskCardProps) {
  const [showXp, setShowXp] = useState(false);
  const [successBurst, setSuccessBurst] = useState(false);
  const disabled = task.status === "completed" || task.status === "expired" || task.status === "upcoming";
  const buttonLabel = useMemo(() => {
    if (task.status === "completed") return "Hecha";
    if (task.status === "expired") return "Expirada";
    if (task.status === "upcoming") return "Aun no";
    return "Completar";
  }, [task.status]);

  return (
    <article
      className={`glass-card group relative overflow-hidden p-4 transition-all duration-300 ${
        task.status === "completed"
          ? "border-success/30 bg-success/5 opacity-80"
          : "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-warning/10"
      } ${successBurst ? "pulse-soft" : ""}`}
    >
      {!disabled ? <div className="task-card-glow absolute inset-x-8 top-0 h-10 rounded-full blur-2xl" /> : null}
      <div className="flex items-start gap-3">
        <div
          className={`mt-1 flex h-11 w-11 items-center justify-center rounded-2xl text-center text-lg leading-[2.75rem] transition-all duration-300 ${
            task.status === "completed" ? "bg-success/20 text-success" : "bg-base-200 text-moss"
          }`}
        >
          {task.status === "completed" ? "OK" : task.assignedTo === "team" ? "T" : task.assigneeName.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-moss">{task.title}</h3>
            <span className="rounded-full bg-base-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sage">
              {typeLabels[task.type]}
            </span>
          </div>
          <p className="mt-1 text-sm text-moss/70">{task.meta}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-sage">+{task.xpValue} XP</p>
              <p className="text-xs text-moss/60">{task.assigneeName}</p>
            </div>
            <button
              type="button"
              className={`btn btn-sm rounded-full transition-all duration-200 active:scale-95 ${
                disabled ? "btn-disabled" : "btn-primary hover:scale-105"
              }`}
              disabled={disabled}
              onClick={() => {
                onComplete();
                setShowXp(true);
                setSuccessBurst(true);
                window.setTimeout(() => setShowXp(false), 1200);
                window.setTimeout(() => setSuccessBurst(false), 900);
              }}
            >
              {task.status === "completed" ? "Check" : buttonLabel}
            </button>
          </div>
        </div>
      </div>
      {showXp ? (
        <div className="pointer-events-none absolute right-5 top-4 rounded-full bg-accent/90 px-3 py-1 text-sm font-semibold text-moss float-up">
          +{task.xpValue} XP
        </div>
      ) : null}
      {successBurst ? (
        <>
          <div className="success-ring pointer-events-none absolute inset-0 rounded-[28px]" />
          <div className="confetti-soft pointer-events-none absolute right-10 top-10 h-2.5 w-2.5 rounded-full bg-accent" style={{ ["--drift" as string]: "-14px" }} />
          <div className="confetti-soft pointer-events-none absolute right-14 top-9 h-2 w-2 rounded-full bg-success" style={{ ["--drift" as string]: "18px" }} />
          <div className="confetti-soft pointer-events-none absolute right-8 top-12 h-1.5 w-1.5 rounded-full bg-info" style={{ ["--drift" as string]: "10px" }} />
        </>
      ) : null}
    </article>
  );
}
