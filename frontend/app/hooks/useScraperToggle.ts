"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/app/lib/api";

export interface ScraperEndpoints {
  status: string;
  start: string;
  stop: string;
}

export function useScraperToggle(endpoints: ScraperEndpoints, pollMs = 4000) {
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.getScraperStatus(endpoints.status);
      setIsRunning(data.Running);
    } catch (error) {
      console.error("Failed to fetch scraper status", error);
    }
  }, [endpoints.status]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, pollMs);
    return () => clearInterval(interval);
  }, [fetchStatus, pollMs]);

  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      if (isRunning) {
        await api.stopScraper(endpoints.stop);
      } else {
        await api.startScraper(endpoints.start);
      }
      setIsRunning((prev) => !prev);
    } catch (error) {
      console.error("Failed to toggle scraper", error);
    } finally {
      setLoading(false);
    }
  }, [endpoints.start, endpoints.stop, isRunning]);

  return { isRunning, loading, toggle };
}
