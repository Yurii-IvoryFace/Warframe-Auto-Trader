"use client";

import { useEffect, useState } from "react";
import { api, ItemTotals } from "@/app/lib/api";

const DEFAULT_TOTALS: ItemTotals = {
  total_purchase_price: 0,
  total_listed_price: 0,
};

export function useItemTotals(pollMs = 4000) {
  const [itemTotals, setItemTotals] = useState<ItemTotals>(DEFAULT_TOTALS);

  useEffect(() => {
    let isMounted = true;

    const fetchTotals = async () => {
      try {
        const totals = await api.getItemTotals();
        if (isMounted) {
          setItemTotals(totals);
        }
      } catch (error) {
        console.error("Failed to load item totals", error);
        if (isMounted) {
          setItemTotals(DEFAULT_TOTALS);
        }
      }
    };

    fetchTotals();
    const interval = setInterval(fetchTotals, pollMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pollMs]);

  return itemTotals;
}
