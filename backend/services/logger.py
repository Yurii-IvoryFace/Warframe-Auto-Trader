import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path


def setup_logging(log_dir: str = "logs", level=logging.DEBUG):
    Path(log_dir).mkdir(parents=True, exist_ok=True)
    formatter = logging.Formatter("%(asctime)s\t%(levelname)s\t%(message)s")

    handler = RotatingFileHandler(Path(log_dir) / "app.log", maxBytes=1_000_000, backupCount=5)
    handler.setFormatter(formatter)

    console = logging.StreamHandler()
    console.setFormatter(formatter)

    logging.basicConfig(level=level, handlers=[handler, console])
    return logging.getLogger(__name__)
