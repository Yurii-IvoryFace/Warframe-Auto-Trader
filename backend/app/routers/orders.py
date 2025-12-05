from fastapi import APIRouter, HTTPException

from app.models import Transact
from services.wfm_client import WFMClient
from services.inventory_repo import ensure_db
import services.custom_logger as customLogger
from services.legacy.AccessingWFMarket import item_id_to_slug

wfm = WFMClient()
router = APIRouter()


def _get_order_data(t: Transact):
    data = wfm.get_my_orders()
    orders = data.get(f"{t.transaction_type}_orders", [])
    for order in orders:
        item = order.get("item", {}) or {}
        item_id = order.get("itemId") or item.get("id")
        slug = item.get("url_name") or (item_id_to_slug(item_id) if item_id else None)
        if slug == t.name:
            return order.get("id"), order.get("platinum"), order.get("quantity")
    return None, None, None


@router.put("/market/delete")
def delete_order(t: Transact):
    ensure_db()
    order_id, order_plat, order_quant = _get_order_data(t)
    if order_id is None:
        raise HTTPException(status_code=400, detail="Could not find order id to delete.")
    response = wfm.delete_order(order_id)
    if response.status_code == 200:
        return {"message": "Order deleted successfully"}
    raise HTTPException(status_code=400, detail="Something went wrong accessing wf.market api.")


@router.put("/market/close")
def close_order(t: Transact):
    order_id, order_plat, order_quant = _get_order_data(t)
    if order_id is None:
        raise HTTPException(status_code=404, detail="Order not found")

    if order_plat != t.price:
        wfm.update_listing(order_id, t.price, order_quant, True, t.name, t.transaction_type)

    # Close whole order; use existing quantity if not provided.
    close_qty = order_quant if order_quant else (t.number or 1)
    response = wfm.close_order(order_id, quantity=close_qty)
    if response.status_code == 200:
        return {"message": "Order closed successfully"}
    # Fallback: try deleting if close fails.
    delete_resp = wfm.delete_order(order_id)
    if delete_resp.status_code == 200:
        return {"message": "Order closed by deletion"}
    raise HTTPException(status_code=400, detail=f"Something went wrong accessing wf.market api. Response: {response.text} / delete: {delete_resp.text}")
