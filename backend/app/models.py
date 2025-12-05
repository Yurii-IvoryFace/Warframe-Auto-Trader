from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class Item(BaseModel):
    name: str
    purchasePrice: Optional[float] = None
    listedPrice: Optional[int] = None
    number: Optional[int] = None


class Transact(BaseModel):
    name: str
    transaction_type: str
    price: Optional[float] = None
    number: Optional[int] = 1


class SettingsPayload(BaseModel):
    data: dict


class TransactionRecord(BaseModel):
    id: int
    name: str
    datetime: datetime
    transactionType: str
    price: int
