import json
import os

DEFAULT_CONFIG = {
    "pushbutton_token": "",
    "pushbutton_device_iden": "",
    "wfm_jwt_token": "",
    "inGameName": "",
    "platform": "pc",
    "crossplay": True,
    "webhookLink": "",
    "runningWarframeScreenDetect": False,
    "runningLiveScraper": False,
    "runningStatisticsScraper": False,
}


def _load_or_init_config():
    """
    Ensure config.json exists; if missing, create a placeholder so the app can start.
    """
    if not os.path.exists("config.json"):
        with open("config.json", "w") as f:
            f.write(json.dumps(DEFAULT_CONFIG, indent=4))
        return DEFAULT_CONFIG.copy()
    with open("config.json") as f:
        return json.load(f)


configData = _load_or_init_config()

def getConfigStatus(key):
    with open("config.json") as f:
        configData = json.load(f)
    return configData[key]

def setConfigStatus(key, value):
    with open("config.json") as f:
        configData = json.load(f)
    configData[key] = value
    with open("config.json", "w") as outfile:
        outfile.write(json.dumps(configData, indent=4))
    return


pb_token = configData["pushbutton_token"]
pushbutton_device_iden = configData["pushbutton_device_iden"]
jwt_token_raw = configData["wfm_jwt_token"]
jwt_token_raw = jwt_token_raw.split(" ")[-1] if jwt_token_raw else ""
jwt_token = f"Bearer {jwt_token_raw}" if jwt_token_raw else ""
inGameName = configData['inGameName']
platform = configData['platform'].lower()
crossplay = configData.get("crossplay", True)
webhookLink = configData["webhookLink"]
# Read JSON file
with open('settings.json') as settings:
    data = json.load(settings)

# Extract values and initialize variables
blacklistedItems = data['blacklistedItems']
whitelistedItems = data['whitelistedItems']
strictWhitelist = data['strictWhitelist']
priceShiftThreshold = data['priceShiftThreshold']
avgPriceCap = data['avgPriceCap']
maxTotalPlatCap = data['maxTotalPlatCap']
volumeThreshold = data['volumeThreshold']
rangeThreshold = data['rangeThreshold']
pingOnNotif = data["pingOnNotif"]
