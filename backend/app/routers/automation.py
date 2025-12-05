import subprocess
import time
import os
from pathlib import Path

from fastapi import APIRouter, HTTPException

import config

router = APIRouter()

liveScraperProcess = None
statisticsScraperProcess = None
screenReaderProcess = None


@router.get("/live_scraper")
def get_live_scraper_status():
    global liveScraperProcess
    if liveScraperProcess is None:
        return {"Running": False}
    try:
        liveScraperProcess.wait(timeout=0)
        return {"Running": False}
    except subprocess.TimeoutExpired:
        return {"Running": True}


@router.post("/live_scraper/start")
def start_live_scraper():
    global liveScraperProcess
    if config.getConfigStatus("runningLiveScraper") or liveScraperProcess is not None:
        return {"Executed": False, "Reason": "Scraper already running"}
    # Ensure stats data exists before starting live scraper.
    data_file = config.DATA_DIR / "allItemData.csv"
    if not data_file.exists():
        raise HTTPException(status_code=400, detail="Stats data not found. Run stats scraper first.")
    env = os.environ.copy()
    env["PYTHONPATH"] = env.get("PYTHONPATH", "") + (os.pathsep if env.get("PYTHONPATH") else "") + str(Path(__file__).resolve().parents[2])
    liveScraperProcess = subprocess.Popen(
        ["python", "-m", "scripts.LiveScraper"],
        cwd=str(Path(__file__).resolve().parents[2]),
        env=env,
    )
    config.setConfigStatus("runningLiveScraper", True)
    with open("tradeLog.txt", "w") as f:
        f.write(f"Starting log file at {time.time()}\n")
    return {"Executed": True}


@router.post("/live_scraper/stop")
def stop_live_scraper():
    global liveScraperProcess
    if liveScraperProcess is None:
        return {"Executed": False, "Reason": "Scraper was not running."}
    config.setConfigStatus("runningLiveScraper", False)
    liveScraperProcess.kill()
    liveScraperProcess.wait()
    liveScraperProcess = None
    return {"Executed": True}


@router.get("/stats_scraper")
def get_stats_scraper_status():
    return {"Running": config.getConfigStatus("runningStatisticsScraper")}


@router.post("/stats_scraper/start")
def start_stats_scraper():
    global statisticsScraperProcess
    if config.getConfigStatus("runningStatisticsScraper"):
        return {"Executed": False, "Reason": "Scraper already running"}
    env = os.environ.copy()
    env["PYTHONPATH"] = env.get("PYTHONPATH", "") + (os.pathsep if env.get("PYTHONPATH") else "") + str(Path(__file__).resolve().parents[2])
    statisticsScraperProcess = subprocess.Popen(
        ["python", "-m", "scripts.StatsScraper"],
        cwd=str(Path(__file__).resolve().parents[2]),
        env=env,
    )
    config.setConfigStatus("runningStatisticsScraper", True)
    return {"Executed": True}


@router.post("/stats_scraper/stop")
def stop_stats_scraper():
    global statisticsScraperProcess
    if statisticsScraperProcess is None:
        return {"Executed": False, "Reason": "Scraper was not running."}
    config.setConfigStatus("runningStatisticsScraper", False)
    statisticsScraperProcess.wait()
    return {"Executed": True}


@router.get("/screen_reader")
def get_screen_reader_status():
    return {"Running": config.getConfigStatus("runningWarframeScreenDetect")}


@router.post("/screen_reader/start")
def start_screen_reader():
    global screenReaderProcess
    if config.getConfigStatus("runningWarframeScreenDetect"):
        return {"Executed": False, "Reason": "Screen reader already running"}
    config.setConfigStatus("runningWarframeScreenDetect", True)
    env = os.environ.copy()
    env["PYTHONPATH"] = env.get("PYTHONPATH", "") + (os.pathsep if env.get("PYTHONPATH") else "") + str(Path(__file__).resolve().parents[2])
    screenReaderProcess = subprocess.Popen(
        ["python", "-m", "scripts.EEParser"],
        cwd=str(Path(__file__).resolve().parents[2]),
        env=env,
    )
    return {"Executed": True}


@router.post("/screen_reader/stop")
def stop_screen_reader():
    global screenReaderProcess
    if screenReaderProcess is None:
        return {"Executed": False, "Reason": "Screen reader was not running."}
    config.setConfigStatus("runningWarframeScreenDetect", False)
    screenReaderProcess.wait()
    return {"Executed": True}
