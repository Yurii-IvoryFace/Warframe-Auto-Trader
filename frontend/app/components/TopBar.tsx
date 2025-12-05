"use client";

import Clock from "../Clock";

interface TopBarProps {
  apiLabel: string;
  onOpenSettings: () => void;
}

export function TopBar({ apiLabel, onOpenSettings }: TopBarProps) {
  return (
    <header className="sticky top-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0e1320]/90 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur">
      <div className="flex flex-col gap-1">
        <div className="text-lg font-semibold tracking-wide">Warframe Auto Trader</div>
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#9aa9c1]">
          API: {apiLabel}
        </span>
        <Clock />
        <button
          className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:border-[#7cf3ff]"
          onClick={onOpenSettings}
        >
          Settings
        </button>
      </div>
    </header>
  );
}
