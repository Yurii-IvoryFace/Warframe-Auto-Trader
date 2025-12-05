from __future__ import annotations

import time
from typing import Dict, Optional

import requests

import config
import services.custom_logger as customLogger

WFM_API = "https://api.warframe.market/v2"


class WFMClient:
    """Thin wrapper around warframe.market v2 calls used by our app."""

    def __init__(self):
        self.jwt_token = config.jwt_token
        self._user_slug: Optional[str] = None
        self.base_headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Platform": config.platform,
            "Language": "en",
            "Crossplay": str(config.crossplay).lower(),
            "User-Agent": "Warframe Algo Trader/2.1.0",
        }
        self.last_request_time = 0
        self.time_between_requests = 0.5

    def _wait_delay(self):
        if (time.time() - self.last_request_time) < self.time_between_requests:
            time.sleep(self.last_request_time - time.time() + self.time_between_requests)

    def _headers(self, include_auth: bool = True, headers: Optional[Dict] = None):
        merged = dict(self.base_headers)
        if include_auth and self.jwt_token:
            merged["Authorization"] = self.jwt_token
        if headers:
            merged.update(headers)
        return merged

    def _request(self, method: str, url: str, *, json=None, headers=None, include_auth=True):
        self._wait_delay()
        self.last_request_time = time.time()
        merged = self._headers(include_auth=include_auth, headers=headers)
        return requests.request(method, url, headers=merged, json=json)

    def close_order(self, order_id: str, quantity: int = 1):
        payload = {"quantity": max(1, int(quantity))}
        resp = self._request("post", f"{WFM_API}/order/{order_id}/close", json=payload)
        customLogger.writeTo(
            "wfmAPICalls.log",
            f"POST:{WFM_API}/order/{order_id}/close\tResponse:{resp.status_code}\tBody:{resp.text}"
        )
        if resp.status_code != 200:
            fallback = self._request("patch", f"{WFM_API}/order/{order_id}/close", json=payload)
            customLogger.writeTo(
                "wfmAPICalls.log",
                f"PATCH:{WFM_API}/order/{order_id}/close\tResponse:{fallback.status_code}\tBody:{fallback.text}"
            )
            return fallback
        return resp

    def delete_order(self, order_id: str):
        resp = self._request("delete", f"{WFM_API}/order/{order_id}")
        customLogger.writeTo(
            "wfmAPICalls.log",
            f"DELETE:{WFM_API}/order/{order_id}\tResponse:{resp.status_code}"
        )
        return resp

    def update_listing(self, order_id: str, platinum: int, quantity: int, visible: bool, item_name: str, order_type: str):
        payload = {
            "platinum": int(platinum),
            "quantity": int(quantity),
            "visible": bool(visible),
        }
        resp = self._request("patch", f"{WFM_API}/order/{order_id}", json=payload)
        customLogger.writeTo(
            "wfmAPICalls.log",
            f"PATCH:{WFM_API}/order/{order_id}\tResponse:{resp.status_code}\tItem:{item_name}\tOrder Type:{order_type}\tPlatinum:{platinum}\tVisible:{visible}"
        )
        return resp

    def get_my_orders(self):
        user = self._user_slug or config.inGameName
        if not user:
            # try to fetch from /me
            resp_me = self._request("get", f"{WFM_API}/me")
            if resp_me.status_code == 200:
                data = resp_me.json().get("data", {})
                user = data.get("slug") or data.get("ingameName")
                self._user_slug = user
        if not user:
            return {"buy_orders": [], "sell_orders": []}
        resp = self._request("get", f"{WFM_API}/orders/user/{user}")
        customLogger.writeTo(
            "wfmAPICalls.log",
            f"GET:{WFM_API}/orders/user/{user}\tResponse:{resp.status_code}"
        )
        if resp.status_code != 200:
            return {"buy_orders": [], "sell_orders": []}
        data = resp.json().get("data", [])
        buy_orders = [o for o in data if o.get("type") == "buy"]
        sell_orders = [o for o in data if o.get("type") == "sell"]
        return {"buy_orders": buy_orders, "sell_orders": sell_orders}

    def get_all_items(self):
        r = self._request("get", f"{WFM_API}/items", include_auth=False)
        customLogger.writeTo("wfmAPICalls.log", f"GET:{WFM_API}/items\tResponse:{r.status_code}")
        r.raise_for_status()
        return r.json().get("data", [])
