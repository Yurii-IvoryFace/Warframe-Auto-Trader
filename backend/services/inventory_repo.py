import sqlite3
from typing import Any, Dict, List
import config
from pathlib import Path


DB_PATH = config.DATA_DIR / "inventory.db"


def ensure_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            purchasePrice REAL,
            listedPrice REAL,
            number INTEGER
        ) STRICT
        """
    )
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


def get_items() -> List[Dict[str, Any]]:
    ensure_db()
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    res = cur.execute("SELECT id, name, purchasePrice, listedPrice, number FROM inventory")
    out = [dict(row) for row in res]
    con.close()
    return out


def get_items_sum() -> Dict[str, Any]:
    ensure_db()
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("SELECT SUM(number * purchasePrice) AS total_purchase_price, SUM(number * listedPrice) AS total_listed_price FROM inventory")
    result = cur.fetchone()
    con.close()
    return {"total_purchase_price": result[0], "total_listed_price": result[1]}


def add_item(name: str, purchase_price, number):
    ensure_db()
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    alreadyExists = cur.execute("SELECT COUNT(name) FROM inventory WHERE name=?", [name]).fetchone()
    if alreadyExists[0] != 0:
        cur.execute("INSERT INTO inventory (name, purchasePrice, number) VALUES(?,?,?)", [name, purchase_price, number])
        con.commit()
        con.close()
        aggregate_and_delete_rows_by_name(name)
        return True
    if name and number:
        cur.execute("INSERT INTO inventory (name, purchasePrice, number) VALUES(?,?,?)", [name, purchase_price, number])
        con.commit()
        con.close()
        return True
    con.close()
    return False


def remove_item(name: str):
    ensure_db()
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    alreadyExists = cur.execute("SELECT COUNT(name) FROM inventory WHERE name=?", [name]).fetchone()
    if alreadyExists[0] != 0:
        cur.execute("DELETE FROM inventory WHERE name=?", [name])
        con.commit()
        con.close()
        return True
    con.close()
    return False


def update_item(name: str, purchase_price, number, listed_price):
    ensure_db()
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    alreadyExists = cur.execute("SELECT COUNT(name) FROM inventory WHERE name=?", [name]).fetchone()
    if alreadyExists[0] != 0:
        cur.execute("UPDATE inventory SET purchasePrice=?, number=?, listedPrice=? WHERE name=?", [purchase_price, number, listed_price, name])
        con.commit()
        con.close()
        return True
    con.close()
    return False


def sell_item(name: str):
    ensure_db()
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    alreadyExists = cur.execute("SELECT COUNT(name) FROM inventory WHERE name=?", [name]).fetchone()
    if alreadyExists[0] != 0:
        cur.execute("UPDATE inventory SET number=number-1 WHERE name=?", [name])
        con.commit()
        numLeft = cur.execute("SELECT SUM(number) FROM inventory WHERE name=?", [name]).fetchone()[0]
        con.close()
        return numLeft
    con.close()
    return None


def aggregate_and_delete_rows_by_name(name: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT SUM(number), SUM(number * purchasePrice) FROM inventory WHERE name = ?", (name,))
    result = cursor.fetchone()
    total_number = result[0]
    weighted_average = result[1] / total_number if total_number else 0
    cursor.execute("DELETE FROM inventory WHERE name = ? AND rowid NOT IN (SELECT MIN(rowid) FROM inventory WHERE name = ?)", (name, name))
    cursor.execute("UPDATE inventory SET number = ?, purchasePrice = ? WHERE name = ?", (total_number, weighted_average, name))
    conn.commit()
    cursor.close()
    conn.close()
    return total_number, weighted_average
