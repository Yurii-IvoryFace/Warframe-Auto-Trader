"""
Wrapper functions to run LiveScraper and StatsScraper as subprocesses.
Keeps imports local to avoid side effects.
"""

import subprocess
import time
import config


def start_live_scraper():
    if config.getConfigStatus("runningLiveScraper"):
        return False, "Scraper already running"
    proc = subprocess.Popen(["python", "LiveScraper.py"])
    config.setConfigStatus("runningLiveScraper", True)
    with open("tradeLog.txt", "w") as f:
        f.write(f"Starting log file at {time.time()}\n")
    return True, proc


def stop_live_scraper(proc: subprocess.Popen | None):
    if proc is None:
        return False, "Scraper was not running."
    config.setConfigStatus("runningLiveScraper", False)
    proc.kill()
    proc.wait()
    return True, None


def start_stats_scraper():
    if config.getConfigStatus("runningStatisticsScraper"):
        return False, "Scraper already running"
    proc = subprocess.Popen(["python", "StatsScraper.py"])
    config.setConfigStatus("runningStatisticsScraper", True)
    return True, proc


def stop_stats_scraper(proc: subprocess.Popen | None):
    if proc is None:
        return False, "Scraper was not running."
    config.setConfigStatus("runningStatisticsScraper", False)
    proc.wait()
    return True, None
