import json
import re
import time
from typing import Dict, Optional

import pandas as pd
import requests

import config
import customLogger

class WarframeApi:
    def __init__(self):
        self.t0 = time.time()
        self.jwt_token = config.jwt_token
        self.base_headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Platform": config.platform,
            "Language": "en",
            "Crossplay": str(config.crossplay).lower(),
            "User-Agent": "Warframe Algo Trader/2.0.0",
        }
        self.user_slug: Optional[str] = None
        self.lastRequestTime = 0
        self.timeBetweenRequests = 3

    def waitUntilDelayEnds(self):
        if (time.time() - self.lastRequestTime) < self.timeBetweenRequests:
            time.sleep(self.lastRequestTime - time.time() + self.timeBetweenRequests)
        
    def _merge_headers(self, headers: Optional[Dict] = None, include_auth: bool = True):
        merged = dict(self.base_headers)
        if include_auth and self.jwt_token:
            merged["Authorization"] = self.jwt_token
        if headers:
            merged.update(headers)
        return merged

    def _request(self, method, link, *, json=None, headers=None, include_auth: bool = True):
        self.waitUntilDelayEnds()
        self.lastRequestTime = time.time()
        merged_headers = self._merge_headers(headers=headers, include_auth=include_auth)
        return requests.request(method, link, headers=merged_headers, json=json)

    def get(self, link, headers=None, include_auth: bool = True):
        return self._request("get", link, headers=headers, include_auth=include_auth)

    def post(self, link, json=None, headers=None, include_auth: bool = True):
        return self._request("post", link, json=json, headers=headers, include_auth=include_auth)

    def delete(self, link, headers=None, include_auth: bool = True):
        return self._request("delete", link, headers=headers, include_auth=include_auth)

    def put(self, link, json=None, headers=None, include_auth: bool = True):
        return self._request("put", link, json=json, headers=headers, include_auth=include_auth)

    def patch(self, link, json=None, headers=None, include_auth: bool = True):
        return self._request("patch", link, json=json, headers=headers, include_auth=include_auth)

    def get_user_slug(self) -> Optional[str]:
        if self.user_slug:
            return self.user_slug
        try:
            resp = self.get(f"{WFM_API}/me")
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                self.user_slug = data.get("slug") or data.get("ingameName")
        except requests.RequestException:
            pass
        if not self.user_slug and config.inGameName:
            slug = re.sub(r"[^a-z0-9]+", "-", config.inGameName.lower()).strip("-")
            self.user_slug = slug
        return self.user_slug


WFM_API = "https://api.warframe.market/v2"

warframeApi = WarframeApi()

def login(
    user_email: str, user_password: str, platform: str = "pc", language: str = "en"
):
    """
    Used for logging into warframe.market via the API.
    Returns (User_Name, JWT_Token) on success,
    or returns (None, None) if unsuccessful.
    """
    content = {"email": user_email, "password": user_password, "auth_type": "header"}
    headers = warframeApi._merge_headers(include_auth=False)
    response = warframeApi.post(f"{WFM_API}/auth/signin", json=content, headers=headers, include_auth=False)
    customLogger.writeTo(
        "wfmAPICalls.log",
        f"POST:{WFM_API}/auth/signin\tResponse:{response.status_code}"
    )
    if response.status_code != 200:
        return None, None
    payload = response.json().get("data") or response.json().get("payload", {})
    user = payload.get("user", {})
    token_raw = response.headers.get("Authorization", "")
    bearer_token = f"Bearer {token_raw.split(' ')[-1]}" if token_raw else ""
    return (user.get("ingameName") or user.get("ingame_name"), bearer_token)

def _to_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in ["true", "1", "yes", "y"]
    return bool(value)


_ITEM_LOOKUP: Optional[Dict[str, str]] = None


def _get_item_lookup() -> Dict[str, str]:
    global _ITEM_LOOKUP
    if _ITEM_LOOKUP is None:
        try:
            df = pd.read_csv("allItemDataBackup.csv")
        except FileNotFoundError:
            df = pd.read_csv("allItemData.csv")
        _ITEM_LOOKUP = df[["item_id", "name"]].drop_duplicates().set_index("item_id")["name"].to_dict()
    return _ITEM_LOOKUP


def item_id_to_slug(item_id: str) -> Optional[str]:
    return _get_item_lookup().get(item_id)


def postOrder(item, order_type, platinum, quantity, visible, modRank, itemName):
    payload = {
        "itemId": str(item),
        "type": str(order_type),
        "platinum": int(platinum),
        "quantity": int(quantity),
        "visible": _to_bool(visible),
    }
    if modRank is not None:
        payload["rank"] = modRank

    response = warframeApi.post(f"{WFM_API}/order", json=payload)

    customLogger.writeTo(
        "wfmAPICalls.log",
        f"POST:{WFM_API}/order\tResponse:{response.status_code}\tItem:{itemName}\tOrder Type:{order_type}\tPlatinum:{platinum}\tQuantity:{quantity}\tVisible:{visible}"
    )

    if response.status_code == 200:
        customLogger.writeTo(
            "orderTracker.log",
            f"POSTED\tItem:{itemName}\tOrder Type:{order_type}\tPlatinum:{platinum}\tQuantity:{quantity}\tVisible:{visible}"
        )

    return response


def deleteOrder(orderID):
    r = warframeApi.delete(f"{WFM_API}/order/{orderID}")
    customLogger.writeTo(
        "wfmAPICalls.log",
        f"DELETE:{WFM_API}/order/{orderID}\tResponse:{r.status_code}"
    )
    if r.status_code == 200:
        customLogger.writeTo(
            "orderTracker.log",
            f"DELETED\tOrder ID: {orderID}"
        )
    return r


def getOrders():
    user_slug = warframeApi.get_user_slug()
    if not user_slug:
        return {"buy_orders": [], "sell_orders": []}
    r = warframeApi.get(f"{WFM_API}/orders/user/{user_slug}")
    customLogger.writeTo(
        "wfmAPICalls.log",
        f"GET:{WFM_API}/orders/user/{user_slug}\tResponse:{r.status_code}"
    )
    if r.status_code != 200:
        return {"buy_orders": [], "sell_orders": []}
    data = r.json().get("data", [])

    def _hydrate(order):
        item_slug = item_id_to_slug(order.get("itemId")) or order.get("itemId")
        return {
            "id": order.get("id"),
            "platinum": order.get("platinum"),
            "quantity": order.get("quantity"),
            "visible": order.get("visible"),
            "rank": order.get("rank"),
            "perTrade": order.get("perTrade"),
            "item": {"url_name": item_slug},
        }

    buy_orders = [_hydrate(o) for o in data if o.get("type") == "buy"]
    sell_orders = [_hydrate(o) for o in data if o.get("type") == "sell"]
    return {"buy_orders": buy_orders, "sell_orders": sell_orders}


def updateListing(listing_id, platinum, quantity, visibility, itemName, order_type):
    try:
        url = f"{WFM_API}/order/{listing_id}"
        contents = {
            "platinum": int(platinum),
            "quantity": int(quantity),
            "visible": _to_bool(visibility),
        }
        response = warframeApi.patch(url, json=contents)
        customLogger.writeTo(
            "wfmAPICalls.log",
            f"PATCH:{url}\tResponse:{response.status_code}\tItem:{itemName}\tOrder Type:{order_type}\tPlatinum:{platinum}\tVisible:{visibility}"
        )
        response.raise_for_status()  # Raises an exception for non-2xx status codes
        if response.status_code == 200:
            customLogger.writeTo(
                "orderTracker.log",
                f"UPDATED\tItem:{itemName}\tOrder Type:{order_type}\tPlatinum:{platinum}\tVisible:{visibility}"
            )
        return True
    except requests.exceptions.RequestException as e:
        print(f"update_listing: {e}")
        return False


if __name__ == "__main__":
    r = warframeApi.post(
        f"{WFM_API}/order",
        json={
            "itemId": "5bc1ab93b919f200c18c10ef",
            "platinum": 1,
            "type": "buy",
            "quantity": 1,
            "rank": 1,
            "visible": False,
            "perTrade": 1,
        },
    )
    print(r.status_code)
