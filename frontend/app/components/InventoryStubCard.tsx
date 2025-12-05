"use client";

interface InventoryStubCardProps {
  items: { name: string; status: string }[];
}

export function InventoryStubCard({ items }: InventoryStubCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e1320]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.14em] text-[#7cf3ff]">Inventory</p>
          <h3 className="text-xl font-semibold">Market inventory view</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-yellow-300">
          Stub
        </span>
      </div>
      <p className="text-sm text-[#9aa9c1]">
        A dedicated page for synced market inventory will live here. Below is a
        design stub with sample rows to wire up once the API is ready.
      </p>
      <div className="mt-4 grid gap-3 rounded-xl border border-dashed border-white/10 bg-white/5 p-4">
        {items.map((item) => (
          <div
            className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-transparent px-3 py-2"
            key={item.name}
          >
            <div className="space-y-0.5">
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-[#9aa9c1]">{item.status}</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#9aa9c1]">
              Coming soon
            </span>
          </div>
        ))}
      </div>
      <button
        className="mt-4 w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-white opacity-70"
        disabled
      >
        Open market inventory (stub)
      </button>
    </div>
  );
}
