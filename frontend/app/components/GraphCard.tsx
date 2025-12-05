"use client";

import GraphGen from "../GraphGen";

export function GraphCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e1320]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.14em] text-[#7cf3ff]">Visuals</p>
          <h3 className="text-xl font-semibold">Performance graph</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#e8f0fb]">
          From backend data
        </span>
      </div>
      <GraphGen />
    </div>
  );
}
