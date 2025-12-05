"use client";

import { useMemo, useState } from "react";
import { TopBar } from "./components/TopBar";
import { HeroSection } from "./components/HeroSection";
import { ScraperPanel } from "./components/ScraperPanel";
import { InventorySummaryCard } from "./components/InventorySummaryCard";
import { GraphCard } from "./components/GraphCard";
import { UpcomingLoginCard } from "./components/UpcomingLoginCard";
import { InventoryStubCard } from "./components/InventoryStubCard";
import BuyBlock from "./BuyBlock";
import Settings from "./settings";
import { useItemTotals } from "./hooks/useItemTotals";
import { LOGIN_PLACEHOLDERS, INVENTORY_STUB } from "./lib/placeholders";
import { environment } from "@/environment";

export default function Home() {
  const itemTotals = useItemTotals();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const netPlatinum = useMemo(
    () => itemTotals.total_listed_price - itemTotals.total_purchase_price,
    [itemTotals]
  );

  const apiLabel = useMemo(() => {
    try {
      const parsed = new URL(environment.API_BASE_URL);
      return parsed.host;
    } catch {
      return environment.API_BASE_URL;
    }
  }, []);

  const formatPlat = (value: number) =>
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-8">
      <TopBar apiLabel={apiLabel} onOpenSettings={() => setIsSettingsVisible(true)} />

      <HeroSection
        invested={itemTotals.total_purchase_price}
        listed={itemTotals.total_listed_price}
        net={netPlatinum}
        formatPlat={formatPlat}
      />

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScraperPanel />
        <div className="rounded-2xl border border-white/10 bg-[#0e1320]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <BuyBlock />
        </div>
        <InventorySummaryCard
          totalPurchase={itemTotals.total_purchase_price}
          totalListed={itemTotals.total_listed_price}
          formatPlat={formatPlat}
        />
        <GraphCard />
        <UpcomingLoginCard items={LOGIN_PLACEHOLDERS} />
        <InventoryStubCard items={INVENTORY_STUB} />
      </section>

      {isSettingsVisible && (
        <Settings onShow={() => setIsSettingsVisible(false)} />
      )}
    </div>
  );
}
