import { useScraperToggle } from "./hooks/useScraperToggle";

function LiveScraperButton() {
  const { isRunning, loading, toggle } = useScraperToggle({
    status: "/live_scraper",
    start: "/live_scraper/start",
    stop: "/live_scraper/stop",
  });

  return (
    <button
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition hover:-translate-y-0.5 ${
        isRunning
          ? "border-[#7cf3ff] bg-[#7cf3ff]/10"
          : "border-white/10 bg-white/5"
      } ${loading ? "opacity-70" : ""}`}
      onClick={toggle}
      disabled={loading}
    >
      <span
        className={`h-3 w-3 rounded-full shadow-[0_0_0_6px_rgba(255,255,255,0.03)] ${
          isRunning ? "bg-[#73e2a7]" : "bg-[#5b667a]"
        }`}
      />
      <div>
        <div className="font-semibold">Live scraper</div>
        <div className="text-xs text-[#9aa9c1]">
          {isRunning ? "Running - stop" : "Stopped - start"}
        </div>
      </div>
    </button>
  );
}

export default LiveScraperButton;
