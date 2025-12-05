"use client";

interface HeroSectionProps {
  invested: number;
  listed: number;
  net: number;
  formatPlat: (value: number) => string;
}

export function HeroSection({ invested, listed, net, formatPlat }: HeroSectionProps) {
  return (
    <section className="mt-6 grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0e1320]/90 via-[#0e1320]/80 to-[#0e1320]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] lg:grid-cols-[1.2fr_1fr]">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-stretch">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-[#9aa9c1]">Invested</p>
          <div className="text-2xl font-semibold">{formatPlat(invested)}p</div>
          <p className="text-sm text-[#9aa9c1]">Total purchase price</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-[#9aa9c1]">Listed</p>
          <div className="text-2xl font-semibold">{formatPlat(listed)}p</div>
          <p className="text-sm text-[#9aa9c1]">Active listings value</p>
        </div>
        <div className="rounded-xl border border-[#7cf3ff] bg-[#7cf3ff]/10 p-4">
          <p className="text-sm text-[#9aa9c1]">Delta</p>
          <div className="text-2xl font-semibold">
            {net >= 0 ? "+" : "-"}
            {formatPlat(Math.abs(net))}p
          </div>
          <p className="text-sm text-[#9aa9c1]">
            {net >= 0 ? "Projected profit" : "Below cost"}
          </p>
        </div>
      </div>
    </section>
  );
}
