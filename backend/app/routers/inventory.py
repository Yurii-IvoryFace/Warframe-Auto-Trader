from fastapi import APIRouter, HTTPException

from app.models import Item
from services import inventory_repo
from services.wfm_client import WFMClient

router = APIRouter()
wfm = WFMClient()


@router.get("/items")
async def get_items():
    return inventory_repo.get_items()


@router.get("/items/sum")
async def sum_items():
    return inventory_repo.get_items_sum()


@router.post("/item")
async def add_item(item: Item):
    ok = inventory_repo.add_item(item.name, item.purchasePrice, item.number)
    if ok:
        return {"Executed": True}
    raise HTTPException(status_code=400, detail="Need a purchase price and number.")


@router.delete("/item")
async def remove_item(item: Item):
    ok = inventory_repo.remove_item(item.name)
    if ok:
        return {"Executed": True}
    raise HTTPException(status_code=404, detail="Item not in database.")


@router.get("/all_items")
async def get_all_items():
    items = wfm.get_all_items()
    item_names = sorted([x.get("slug") for x in items if x.get("slug")])
    return {"item_names": item_names}


@router.put("/item")
async def update_item(item: Item):
    if item.number == 0:
        await remove_item(item)
        return {"Executed": True}
    ok = inventory_repo.update_item(item.name, item.purchasePrice, item.number, item.listedPrice)
    if ok:
        return {"Executed": True}
    raise HTTPException(status_code=404, detail="Item not in database.")


@router.post("/item/sell")
async def sell_item(item: Item):
    num_left = inventory_repo.sell_item(item.name)
    if num_left is None:
        raise HTTPException(status_code=404, detail="Item not in database.")
    if num_left == 0:
        await remove_item(item)
        return {"Executed": True}
    return {"Executed": num_left}
