from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import json
import config

from services.inventory_repo import ensure_db
from app.routers import inventory, orders, automation, settings, transactions


logging.basicConfig(format="{levelname:7} {message}", style="{", level=logging.DEBUG)

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    config.setConfigStatus("runningWarframeScreenDetect", False)
    config.setConfigStatus("runningLiveScraper", False)
    config.setConfigStatus("runningStatisticsScraper", False)
    ensure_db()


@app.get("/")
async def root():
    return {"Nothing Here!": True}


@app.get("/testlog")
async def test_log():
    logging.debug("Testing debug.")
    logging.info("Testing info.")
    logging.warning("Testing warning! Check console!")
    logging.error("Testing error.")
    return {}


# Routers
app.include_router(inventory.router)
app.include_router(orders.router)
app.include_router(automation.router)
app.include_router(settings.router)
app.include_router(transactions.router)
