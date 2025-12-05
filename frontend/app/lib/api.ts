import { environment } from "@/environment";

const BASE_URL = environment.API_BASE_URL;

type JsonBody = Record<string, unknown> | undefined;

async function fetchJson<T>(path: string, init?: RequestInit, body?: JsonBody) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
    body: body ? JSON.stringify(body) : init?.body,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Unknown error");
    throw new Error(`Request failed: ${response.status} ${message}`);
  }

  return response.json() as Promise<T>;
}

export interface ItemTotals {
  total_purchase_price: number;
  total_listed_price: number;
}

export interface InventoryRow {
  id: number;
  name: string;
  purchasePrice: number;
  listedPrice: number;
  number: number;
}

export const api = {
  getItemTotals: () => fetchJson<ItemTotals>("/items/sum"),
  getItems: () => fetchJson<InventoryRow[]>("/items"),
  getAllItemNames: () =>
    fetchJson<{ item_names: string[] }>("/all_items").then((res) => res.item_names),
  createItem: (payload: { name: string; purchasePrice: string; number: string }) =>
    fetchJson("/item", { method: "POST" }, payload),
  createTransaction: (payload: { name: string; transaction_type: string; price: string | number; number?: string }) =>
    fetchJson("/transaction", { method: "POST" }, payload),
  closeMarket: (payload: { name: string; transaction_type: string; price: string | number }) =>
    fetchJson("/market/close", { method: "PUT" }, payload),
  deleteMarket: (payload: { name: string; transaction_type: string; price: string | number }) =>
    fetchJson("/market/delete", { method: "PUT" }, payload),
  sellItem: (payload: { name: string; purchasePrice: number; number: number }) =>
    fetchJson("/item/sell", { method: "POST" }, payload),
  fetchGraphBlob: async (startDate: string, endDate: string) => {
    const response = await fetch(`${BASE_URL}/graph?startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) {
      throw new Error("Graph request failed");
    }
    return response.blob();
  },
  getScraperStatus: (path: string) =>
    fetchJson<{ Running: boolean }>(path),
  startScraper: (path: string) => fetchJson(path, { method: "POST" }),
  stopScraper: (path: string) => fetchJson(path, { method: "POST" }),
};
