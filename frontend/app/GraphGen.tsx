import React, { useState } from "react";
import { api } from "./lib/api";

const GraphGen: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("");

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  const handleButtonClick = () => {
    setStatus("Loading graph...");

    api
      .fetchGraphBlob(startDate, endDate)
      .then((imageBlob) => {
        const imageUrl = URL.createObjectURL(imageBlob);
        setImageUrl(imageUrl);
        setImageLoaded(true);
        setStatus("Graph updated.");
      })
      .catch((error) => {
        console.error(error);
        setStatus("Unable to load graph. Check dates or backend.");
      });
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-[#9aa9c1]">
          <span>Start date</span>
          <input
            type="date"
            id="startDate"
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChange={handleStartDateChange}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-[#9aa9c1] focus:outline-none focus:ring-2 focus:ring-[#7cf3ff]/50"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#9aa9c1]">
          <span>End date</span>
          <input
            type="date"
            id="endDate"
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChange={handleEndDateChange}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-[#9aa9c1] focus:outline-none focus:ring-2 focus:ring-[#7cf3ff]/50"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="rounded-lg bg-gradient-to-r from-[#6be5ff] to-[#73e2a7] px-4 py-2 text-sm font-semibold text-[#04101f] transition hover:-translate-y-0.5"
          onClick={handleButtonClick}
        >
          Load graph
        </button>
      </div>

      {status && <p className="mt-2 text-xs text-[#9aa9c1]">{status}</p>}

      <div className="mt-3 flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 p-3">
        {imageLoaded && (
          <img className="max-h-[320px] w-full rounded-lg border border-white/10 object-contain" src={imageUrl} alt="Graph" />
        )}
      </div>
    </div>
  );
};

export default GraphGen;
