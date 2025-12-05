import logging
from pathlib import Path
from datetime import datetime

LOG_DIR = Path("logs")


def _resolve(path: str | Path) -> Path:
    p = LOG_DIR / path
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def clearFile(path):
    p = _resolve(path)
    open(p, "w").close()


def writeTo(fileName, msg):
    p = _resolve(fileName)
    timestamp = datetime.now().isoformat(sep=" ", timespec="seconds")
    with open(p, "a") as f:
        f.write(f"{timestamp}\t{msg}\n")
