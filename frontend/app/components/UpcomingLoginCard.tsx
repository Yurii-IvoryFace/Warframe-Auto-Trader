"use client";

interface UpcomingLoginCardProps {
  items: { title: string; detail: string }[];
}

export function UpcomingLoginCard({ items }: UpcomingLoginCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e1320]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.14em] text-[#7cf3ff]">Upcoming</p>
          <h3 className="text-xl font-semibold">Warframe Market login</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-yellow-300">
          Planned
        </span>
      </div>
      <p className="text-sm text-[#9aa9c1]">
        Placeholder for authenticating your warframe.market account to pull
        listings, inbox messages, and session-based inventory.
      </p>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div className="grid grid-cols-[auto_1fr] items-start gap-3" key={item.title}>
            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#7cf3ff]" />
            <div className="space-y-0.5">
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-[#9aa9c1]">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        className="mt-4 w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-white opacity-70"
        disabled
      >
        Connect warframe.market account (coming soon)
      </button>
    </div>
  );
}
