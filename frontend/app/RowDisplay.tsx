import { useState } from "react";
import { useInventory } from "./hooks/useInventory";

export default function RowDisplay() {
  const { rows, sellItem, status, setStatus } = useInventory();
  const [sellPrices, setSellPrices] = useState<Record<number, string>>({});

  const handleSell = async (
    rowId: number,
    mode: "report" | "silent"
  ) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;

    const priceText = sellPrices[rowId];
    if (!priceText || priceText.trim() === "") {
      setStatus("Enter a sell price before submitting.");
      return;
    }

    const parsedPrice = parseFloat(priceText);
    if (Number.isNaN(parsedPrice)) {
      setStatus("Price must be a number.");
      return;
    }

    await sellItem(row, parsedPrice, mode);
    setSellPrices((prev) => ({ ...prev, [rowId]: "" }));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.14em] text-[#7cf3ff]">Inventory</p>
          <h3 className="text-xl font-semibold">Owned items</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#e8f0fb]">
          Live
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-sm font-medium text-[#9aa9c1]">Name</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-[#9aa9c1]">
                Avg purchase
              </th>
              <th className="px-3 py-2 text-left text-sm font-medium text-[#9aa9c1]">Listed</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-[#9aa9c1]">Owned</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-[#9aa9c1]">Sell</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-[#9aa9c1]">
                  Inventory is empty. Add items to see them here.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-white/5">
                <td className="px-3 py-2 font-semibold">
                  {row.name
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </td>
                <td className="px-3 py-2 text-sm">
                  {(Math.round(row.purchasePrice * 100) / 100).toFixed(2)}
                </td>
                <td className="px-3 py-2 text-sm">{row.listedPrice}</td>
                <td className="px-3 py-2 text-sm">{row.number}</td>
                <td className="px-3 py-2">
                  <div className="grid gap-2">
                    <input
                      type="text"
                      placeholder="Sell price"
                      value={sellPrices[row.id] ?? ""}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-[#9aa9c1]"
                      onChange={(event) =>
                        setSellPrices((prev) => ({
                          ...prev,
                          [row.id]: event.target.value,
                        }))
                      }
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-lg bg-gradient-to-r from-[#6be5ff] to-[#73e2a7] px-3 py-2 text-sm font-semibold text-[#04101f] transition hover:-translate-y-0.5"
                        onClick={() => handleSell(row.id, "report")}
                      >
                        Sell
                      </button>
                      <button
                        className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                        onClick={() => handleSell(row.id, "silent")}
                      >
                        Sell (no report)
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {status && <p className="mt-2 text-xs text-[#9aa9c1]">{status}</p>}
    </div>
  );
}
