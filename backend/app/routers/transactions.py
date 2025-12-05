import sqlite3
from typing import List

from fastapi import APIRouter

from app.models import Transact

router = APIRouter()

DB_PATH = "inventory.db"


def ensure_transactions_table():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            datetime TEXT,
            transactionType TEXT,
            price INTEGER
        ) STRICT
        """
    )
    con.commit()
    con.close()


@router.get("/transactions")
async def get_transactions():
    ensure_transactions_table()
    jsonArray = []
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    res = cur.execute("SELECT id, name, datetime, transactionType, price from transactions ")
    for row in res:
        jsonArray.append(dict(row))
    con.close()
    return jsonArray


@router.post("/transaction")
def create_transaction(t: Transact):
    ensure_transactions_table()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    for _ in range(t.number or 1):
        cursor.execute(
            "INSERT INTO transactions (name, datetime, transactionType, price) VALUES (?, ?, ?, ?)",
            (t.name, t.datetime if hasattr(t, "datetime") else None, t.transaction_type, t.price),
        )
    conn.commit()
    conn.close()
    return {"message": "Transaction created successfully"}
