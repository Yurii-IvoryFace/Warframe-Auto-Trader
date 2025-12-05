import json, requests
from datetime import datetime, timedelta
import pandas as pd
import os
import numpy as np
import time
import config
import logging
from itertools import chain
import services.custom_logger as customLogger
from services.legacy.AccessingWFMarket import WFM_API

logging.basicConfig(format='{levelname:7} {message}', style='{', level=logging.DEBUG)

customLogger.clearFile("relicsAPICalls.log")
customLogger.writeTo("relicsApiCalls.log", "Started Stats Scraper")

os.makedirs(config.DATA_DIR, exist_ok=True)

allItemsLink = "https://api.warframe.market/v2/items"
r = requests.get(allItemsLink)
customLogger.writeTo("wfmAPICalls.log", f"GET:{allItemsLink}\tResponse:{r.status_code}")
itemList = r.json()["data"]
itemNameList = [x["slug"] for x in itemList if "relic" not in x["slug"]]
urlLookup = {x["i18n"]["en"]["name"] : x["slug"] for x in itemList if x.get("i18n")}

csvFileName = config.DATA_DIR / "allItemData.csv"

try:
    os.rename(csvFileName, config.DATA_DIR / "allItemDataBackup.csv")
except FileNotFoundError:
    pass
except FileExistsError:
    config.setConfigStatus("runningStatisticsScraper", False)
    raise Exception("Remove the backup or the main csv file, one shouldn't be there for this to run.")


def isFullData(data):
    if len(data) == 0:
        return False
    if "mod_rank" in data[0].keys() and len(data) == 6:
        return True
    if "mod_rank" not in data[0].keys() and len(data) == 3:
        return True
    return False

def getDataLink(dayStr):
    if config.platform != "pc":
        return f"https://relics.run/history/{config.platform}/price_history_{dayStr}.json"
    else:
        return f"https://relics.run/history/price_history_{dayStr}.json"

def getDayStr(daysBack):
    day = datetime.utcnow() - timedelta(daysBack)
    dayStr = datetime.strftime(day, '%Y-%m-%d')
    return dayStr

def fast_flatten(input_list):
    return list(chain.from_iterable(input_list))


lastManyDays = [getDayStr(x) for x in range(1, 15)]
#print(lastManyDays)

df = pd.DataFrame()

foundData = 0
frames = []
for dayStr in lastManyDays:
    if foundData >= 7:
        continue
    link = getDataLink(dayStr)
    r = requests.get(link)
    customLogger.writeTo("relicsApiCalls.log", f"GET:{link}\tResponse:{r.status_code}")
    if str(r.status_code)[0] != "2":
        continue
    foundData += 1
    for name, data in r.json().items():
        if isFullData(data):
            #print(name)
            #print(len(data))
            itemDF = pd.DataFrame.from_dict(data)
            #display(itemDF)
            try:
                itemDF = itemDF.drop(["open_price", "closed_price", "donch_top", "donch_bot"], axis=1)
                itemDF = itemDF.fillna({"order_type" : "closed"})
                itemDF["name"] = urlLookup[name]
                itemDF["range"] = itemDF["max_price"] - itemDF["min_price"]
                if "mod_rank" not in itemDF.columns:
                    itemDF["mod_rank"] = np.nan
                else:
                    itemDF = itemDF[itemDF["mod_rank"] != 0]
                #display(itemDF)
                
                itemDF = itemDF[["name", "datetime", "order_type", "volume", "min_price", "max_price","range", "median", "avg_price", "mod_rank"]]
                
                frames.append(itemDF)
            except KeyError:
                pass
    

COLUMN_NAMES = frames[0].columns
df_dict = dict.fromkeys(COLUMN_NAMES, [])
for col in COLUMN_NAMES:
    extracted = (frame[col] for frame in frames)

    # Flatten and save to df_dict
    df_dict[col] = fast_flatten(extracted)
df = pd.DataFrame.from_dict(df_dict)[COLUMN_NAMES]
    
    
countDF = df.groupby("name").count().reset_index()
popularItems = countDF[countDF["datetime"] == 21]["name"]
df = df[df["name"].isin(popularItems)]
df = df.sort_values(by="name")
itemListDF = pd.DataFrame.from_dict(itemList)
#itemListDF
#df = df.drop("Unnamed: 0", axis=1)
df["item_id"] = df.apply(lambda row : itemListDF[itemListDF["slug"] == row["name"]].reset_index().loc[0, "id"], axis=1)
df["order_type"] = df.get("order_type").str.lower()
df.to_csv(csvFileName, index=False)

try:
    os.remove(config.DATA_DIR / "allItemDataBackup.csv")
except FileNotFoundError:
    pass

config.setConfigStatus("runningStatisticsScraper", False)
