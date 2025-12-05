import { ChangeEvent, useState } from "react";
import { api } from "./lib/api";
import { useAllItemNames } from "./hooks/useAllItemNames";

export default function BuyBlock() {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState<"buy" | "add" | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const allItemNames = useAllItemNames();

  const handleItemNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setItemName(event.target.value);
  };

  const handleSubmit = async (mode: "buy" | "add") => {
    if (itemName.trim() === "" || price.trim() === "" || isNaN(Number(price))) {
      setFeedback("Enter an item name and numeric price to continue.");
      return;
    }

    const defaultQuantity = quantity.trim() === "" ? "1" : quantity.trim();
    const formattedItemName = itemName.replace(/\s+/g, "_").toLowerCase();

    if (!allItemNames.includes(formattedItemName)) {
      setFeedback("That item is not in the fetched list. Check spelling.");
      return;
    }

    setSubmitting(mode);
    setFeedback("");

    const itemData = {
      name: formattedItemName,
      purchasePrice: price,
      number: defaultQuantity,
    };

    try {
      if (mode === "buy") {
        const transactionData = {
          name: formattedItemName,
          transaction_type: "buy",
          price: price,
        };

        await api.closeMarket(transactionData);
      }

      await api.createItem(itemData);

      const transactionData = {
        name: formattedItemName,
        transaction_type: "buy",
        price: price,
        number: defaultQuantity,
      };

      await api.createTransaction(transactionData);

      setItemName("");
      setPrice("");
      setQuantity("");
      setFeedback(
        mode === "buy"
          ? "Logged purchase and closed listing."
          : "Added item without market close."
      );
    } catch (error) {
      console.error(error);
      setFeedback("Request failed. Try again.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.14em] text-[#7cf3ff]">Add stock</p>
          <h3 className="text-xl font-semibold">Purchase / add item</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#e8f0fb]">
          Uses market list
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-[#9aa9c1]">
          <span>Item name</span>
          <input
            type="text"
            list="itemNames"
            placeholder="Wisp Prime Set"
            value={itemName}
            onChange={handleItemNameChange}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-[#9aa9c1] focus:outline-none focus:ring-2 focus:ring-[#7cf3ff]/50"
          />
          <datalist id="itemNames">
            {allItemNames.map((name) => (
              <option
                key={name}
                value={name
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-2 text-sm text-[#9aa9c1]">
          <span>Quantity</span>
          <input
            type="text"
            placeholder="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-[#9aa9c1] focus:outline-none focus:ring-2 focus:ring-[#7cf3ff]/50"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-[#9aa9c1]">
          <span>Price per item (p)</span>
          <input
            type="text"
            placeholder="120"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-[#9aa9c1] focus:outline-none focus:ring-2 focus:ring-[#7cf3ff]/50"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          className="rounded-lg bg-gradient-to-r from-[#6be5ff] to-[#73e2a7] px-4 py-2 text-sm font-semibold text-[#04101f] transition hover:-translate-y-0.5 disabled:opacity-70"
          onClick={() => handleSubmit("buy")}
          disabled={submitting !== null}
        >
          {submitting === "buy" ? "Processing..." : "Buy & close listing"}
        </button>
        <button
          className="rounded-lg border border-[#7cf3ff] bg-[#7cf3ff]/10 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-70"
          onClick={() => handleSubmit("add")}
          disabled={submitting !== null}
        >
          {submitting === "add" ? "Adding..." : "Add without reporting"}
        </button>
      </div>
      {feedback && <p className="mt-2 text-xs text-[#9aa9c1]">{feedback}</p>}
    </div>
  );
}
