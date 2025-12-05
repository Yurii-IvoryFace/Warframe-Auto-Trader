"use client";

import RowDisplay from "../RowDisplay";

interface InventorySummaryCardProps {
  totalPurchase: number;
  totalListed: number;
  formatPlat: (value: number) => string;
}

export function InventorySummaryCard({
  totalPurchase,
  totalListed,
  formatPlat,
}: InventorySummaryCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e1320]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] lg:col-span-2">
      <RowDisplay />
      <div className="mt-3 flex flex-wrap gap-6 rounded-xl border border-dashed border-white/10 bg-white/5 p-4">
        <div className="space-y-1">
          <p className="text-sm text-[#9aa9c1]">Total purchase price</p>
          <div className="text-lg font-semibold">{formatPlat(totalPurchase)}p</div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-[#9aa9c1]">Total listed price</p>
          <div className="text-lg font-semibold">{formatPlat(totalListed)}p</div>
        </div>
      </div>
    </div>
  );
}
