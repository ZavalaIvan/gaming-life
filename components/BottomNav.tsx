"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

type NavHref =
  | "/home"
  | "/rewards"
  | "/challenges"
  | "/profile"
  | "/auro"
  | "/config";

const items: Array<{ href: NavHref; label: string; icon: string }> = [
  { href: "/home", label: "Home", icon: "HM" },
  { href: "/rewards", label: "Tienda", icon: "$" },
  { href: "/challenges", label: "Retos", icon: "RT" },
  { href: "/profile", label: "Ivan", icon: "IV" },
  { href: "/auro", label: "Auro", icon: "AU" },
  { href: "/config", label: "Config", icon: "CF" }
];

const LOOP_COUNT = 3;

export function BottomNav() {
  const pathname = usePathname();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const loopedItems = useMemo(
    () =>
      Array.from({ length: LOOP_COUNT }, (_, loopIndex) =>
        items.map((item, itemIndex) => ({
          ...item,
          key: `${loopIndex}-${item.href}`,
          loopIndex,
          itemIndex
        }))
      ).flat(),
    []
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const segmentWidth = scroller.scrollWidth / LOOP_COUNT;
    if (segmentWidth > 0) {
      scroller.scrollLeft = segmentWidth;
    }
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const activeIndex = items.findIndex((item) => pathname.startsWith(item.href));
    if (activeIndex === -1) return;

    const middleIndex = items.length + activeIndex;
    const activeElement = scroller.querySelector<HTMLElement>(`[data-loop-index="${middleIndex}"]`);
    activeElement?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  }, [pathname]);

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const segmentWidth = scroller.scrollWidth / LOOP_COUNT;
    if (segmentWidth <= 0) return;

    if (scroller.scrollLeft < segmentWidth * 0.35) {
      scroller.scrollLeft += segmentWidth;
    } else if (scroller.scrollLeft > segmentWidth * 1.65) {
      scroller.scrollLeft -= segmentWidth;
    }
  };

  return (
    <nav className="bottom-nav-shell fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md rounded-t-[28px] border border-white/70 px-2 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-2 shadow-soft">
      <div className="bottom-nav-fade pointer-events-none absolute inset-x-0 top-0 h-full rounded-t-[28px]" />
      <div
        ref={scrollerRef}
        className="bottom-nav-scroll relative flex gap-2 overflow-x-auto px-2 pb-1"
        onScroll={handleScroll}
      >
        {loopedItems.map((item, index) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              data-loop-index={index}
              className={`relative z-10 flex min-w-[92px] shrink-0 snap-center items-center gap-3 rounded-[22px] border px-4 py-3 text-sm font-medium transition-all duration-300 ${
                active
                  ? "border-sage/10 bg-gradient-to-r from-sage to-moss text-white shadow-lg"
                  : "border-transparent bg-base-100/70 text-moss/65"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-2xl text-[11px] font-semibold tracking-[0.16em] ${
                  active ? "bg-white/15 text-white" : "bg-base-200 text-sage"
                }`}
              >
                {item.icon}
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
