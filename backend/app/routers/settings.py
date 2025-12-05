import json
from typing import Any, Dict, List, Union

from fastapi import APIRouter

router = APIRouter()


@router.get("/settings")
def get_settings():
    with open("settings.json") as settings:
        data = json.load(settings)
    return data


@router.put("/settings")
async def put_settings(request: Union[List, Dict, Any] = None):
    newSettings = json.dumps(request, indent=4)
    with open("settings.json", "w") as settings:
        settings.write(newSettings)
    return {"Executed": True}
