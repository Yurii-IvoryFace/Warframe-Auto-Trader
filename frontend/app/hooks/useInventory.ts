"use client";

import { useCallback, useEffect, useState } from "react";
import { api, InventoryRow } from "@/app/lib/api";

export function useInventory(pollMs = 4000) {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [status, setStatus] = useState<string>("");

  const refresh = useCallback(async () => {
    try {
      const items = await api.getItems();
      setRows(items);
    } catch (error) {
      console.error("Failed to load inventory", error);
      setRows([]);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, pollMs);
    return () => clearInterval(interval);
  }, [pollMs, refresh]);

  const sellItem = useCallback(
    async (row: InventoryRow, price: number, mode: "report" | "silent") => {
      const updatedNumber = row.number - 1;
      setStatus("Recording sale...");

      const transactionData = {
        name: row.name,
        transaction_type: "sell",
        price,
      };

      const marketData = {
        name: row.name,
        purchasePrice: row.purchasePrice,
        number: updatedNumber,
      };

      try {
        if (mode === "silent") {
          await api.deleteMarket(transactionData);
        } else {
          await api.closeMarket(transactionData);
        }

        await api.createTransaction(transactionData);
        await api.sellItem(marketData);
        await refresh();
        setStatus("Sale recorded.");
      } catch (error) {
        console.error(error);
        setStatus("Failed to record sale. Try again.");
      }
    },
    [refresh]
  );

  return { rows, sellItem, status, setStatus };
}
