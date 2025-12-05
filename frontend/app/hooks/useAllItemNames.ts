"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";

export function useAllItemNames() {
  const [allItemNames, setAllItemNames] = useState<string[]>([]);

  useEffect(() => {
    api
      .getAllItemNames()
      .then(setAllItemNames)
      .catch((error) => {
        console.error("Failed to load item names", error);
        setAllItemNames([]);
      });
  }, []);

  return allItemNames;
}
