//import Image from 'next/image'
//import styles from './page.module.css'
import { environment } from "@/environment";
import { useState, useEffect } from "react";

interface SettingsProps {
  onShow: () => void; // Replace `void` with the actual return type if needed
}

const Settings: React.FC<SettingsProps> = ({ onShow }) => {
  const [allItemNames, setAllItemNames] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [unselectedItems, setUnselectedItems] = useState<string[]>([]);

  const [filteredSelected, setFilteredSelected] = useState<string[]>([]);
  const [filteredUnselected, setFilteredUnselected] = useState<string[]>([]);
  const [filterStringSel, setFilterStringSel] = useState<string>("");
  const [filterStringUnsel, setFilterStringUnsel] = useState<string>("");


  const [displayingBlacklist, setDisplayingBlacklist] = useState<boolean>(false);
  const [displayingWhitelist, setDisplayingWhitelist] = useState<boolean>(false);
  const [listSaved, setListSaved] = useState<boolean>(true);

  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch(`${environment.API_BASE_URL}/all_items`)
      .then((response) => response.json())
      .then((data) => {
        setAllItemNames(data.item_names);
        setSelectedItems([]);
      })
      .catch((error) => console.log(error));
    fetch(`${environment.API_BASE_URL}/settings`)
      .then((response) => response.json())
      .then((data) => {
        setSettings(data);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    setUnselectedItems(subtractList(allItemNames, selectedItems));
  }, [selectedItems]);

  useEffect(() => {
    if (!listSaved) {
      if (displayingBlacklist) {
        setSelectedItems(settings["blacklistedItems"] || []);
      }
      else if (displayingWhitelist) {
        setSelectedItems(settings["whitelistedItems"] || []);
      }
    }
  }, [listSaved])

  useEffect(() => {
    setFilteredUnselected(unselectedItems.filter(item => item.includes(filterStringUnsel)));
  }, [filterStringUnsel, unselectedItems])

  useEffect(() => {
    setFilteredSelected(selectedItems.filter(item => item.includes(filterStringSel)));
  }, [filterStringSel, selectedItems])


  const subtractList = (largerList: string[], smallerList: string[]) => {
    return largerList.filter(item => !smallerList.includes(item));
  }

  const addToList = (name: string) => {
    setSelectedItems(prevItems => [...prevItems, name]);
  }

  const removeFromList = (name: string) => {
    setSelectedItems(subtractList(selectedItems, [name]));
  }

  const toggleShowBlacklist = () => {
    setDisplayingBlacklist(true);
    setListSaved(false);
  }

  const toggleShowWhitelist = () => {
    setDisplayingWhitelist(true);
    setListSaved(false);
  }

  const saveList = () => {
    console.log("Selected before saving", selectedItems);
    if (displayingBlacklist) {
      setSettings(prevState => ({
        ...prevState,
        "blacklistedItems" : selectedItems
    }));
    }
    if (displayingWhitelist) {
      setSettings(prevState => ({
        ...prevState,
        "whitelistedItems" : selectedItems
    }));
    }
    setDisplayingBlacklist(false);
    setDisplayingWhitelist(false);
    setSelectedItems([]);
    setListSaved(true);
  }

  const discardList = () => {
    setDisplayingBlacklist(false);
    setDisplayingWhitelist(false);
    setSelectedItems([]);
    setListSaved(true);
  }

  const pushToSelected = () => {
    setSelectedItems(selectedItems.concat(filteredUnselected));
    const filterElement = document.getElementById("filter-unselect") as HTMLInputElement | null;
    if (filterElement) {
      filterElement.value = "";
    }
    setFilterStringUnsel("");
  }

  const pushToUnselected = () => {
    setSelectedItems(subtractList(selectedItems, filteredSelected));
    const filterElement = document.getElementById("filter-select") as HTMLInputElement | null;
    if (filterElement) {
      filterElement.value = "";
    }
    setFilterStringSel("");
  }

  const writeSettings = async () => {
    try {
      const response = await fetch(`${environment.API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        console.log('Settings successfully saved!');
      } else {
        console.error('Failed to save settings.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">  
      <div className="w-[min(1100px,96vw)] max-h-[90vh] overflow-auto rounded-2xl border border-white/10 bg-[#141b2b]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="mb-4 text-center text-2xl font-bold">
          Settings
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[200px] text-right">
            <button
            className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            onClick={onShow}>
            Discard
            </button>
          </div>
          <div className="flex-1 min-w-[200px] text-left">
            <button
            className="rounded-lg bg-gradient-to-r from-[#6be5ff] to-[#73e2a7] px-4 py-2 text-sm font-semibold text-[#04101f] transition hover:-translate-y-0.5"
            onClick={() => {writeSettings(); onShow();}}>
            Save
            </button>
          </div>
        </div>
        

        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            Price Shift Threshold:
            <input
            type="number"
            id="priceShiftThreshold"
            className="rounded-lg border border-white/10 bg-[#0e1320] px-3 py-2 text-white"
            value={settings["priceShiftThreshold"] ?? ""}
            onChange={(event) => setSettings(prevState => ({
              ...prevState,
              "priceShiftThreshold" : +event.target.value
            }))}
            />
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            Volume Threshold:
            <input
            type="number"
            id="volumeThreshold"
            className="rounded-lg border border-white/10 bg-[#0e1320] px-3 py-2 text-white"
            value={settings["volumeThreshold"] ?? ""}
            onChange={(event) => setSettings(prevState => ({
              ...prevState,
              "volumeThreshold" : +event.target.value
            }))}
            />
          </div>
        </div>

        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            Range Threshold:
            <input 
            type="number"
            id="rangeThreshold"
            className="rounded-lg border border-white/10 bg-[#0e1320] px-3 py-2 text-white"
            value={settings["rangeThreshold"] ?? ""}
            onChange={(event) => setSettings(prevState => ({
              ...prevState,
              "rangeThreshold" : +event.target.value
            }))}
            />
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            Avg. Price Cap:
            <input 
            type="number"
            id="avgPriceCap"
            className="rounded-lg border border-white/10 bg-[#0e1320] px-3 py-2 text-white"
            value={settings["avgPriceCap"] ?? ""}
            onChange={(event) => setSettings(prevState => ({
              ...prevState,
              "avgPriceCap" : +event.target.value
            }))}
            />
          </div>
        </div>

        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            Max Total Plat Cap:
            <input 
            type="number"
            id="maxTotalPlatCap"
            className="rounded-lg border border-white/10 bg-[#0e1320] px-3 py-2 text-white"
            value={settings["maxTotalPlatCap"] ?? ""}
            onChange={(event) => setSettings(prevState => ({
              ...prevState,
              "maxTotalPlatCap" : +event.target.value
            }))}
            />
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <span>Strict Whitelist</span>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input 
                type="checkbox"
                className="h-5 w-5 accent-[#7cf3ff]"
                checked={!!settings["strictWhitelist"]}
                onChange={() => setSettings(prevState => ({
                  ...prevState,
                  "strictWhitelist" : !prevState["strictWhitelist"]
                }))}
                id="strictWhitelist"/>
                <span className="text-sm text-[#9aa9c1]">Enabled</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <span>Ping On Notif</span> 
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input 
              type="checkbox"
              className="h-5 w-5 accent-[#7cf3ff]"
              checked={!!settings["pingOnNotif"]}
              onChange={() => setSettings(prevState => ({
                ...prevState,
                "pingOnNotif" : !prevState["pingOnNotif"]
              }))}
              id="pingOnNotif"/>
              <span className="text-sm text-[#9aa9c1]">Enabled</span>
            </label>
          </div>
        </div>

        {listSaved && <div className="mb-3 flex flex-wrap items-center justify-center gap-3">
          <div>
            <button
            className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            onClick={toggleShowBlacklist}>
            Edit Blacklist
            </button>
          </div>
          <div>
            <button
            className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            onClick={toggleShowWhitelist}>
            Edit Whitelist
            </button>
          </div>
        </div>}
        
        {(displayingBlacklist || displayingWhitelist) && <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            {displayingBlacklist && <div className="text-lg font-semibold">Editing Blacklist</div>}
            {displayingWhitelist && <div className="text-lg font-semibold">Editing Whitelist</div>}
          </div>

          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <button
              className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              onClick={discardList}>
              Discard Changes
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <button
              className="rounded-lg bg-gradient-to-r from-[#6be5ff] to-[#73e2a7] px-4 py-2 text-sm font-semibold text-[#04101f] transition hover:-translate-y-0.5"
              onClick={saveList}>
              Save Changes (w/o writing to json)
              </button>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_1fr] md:items-center">
            <div className="flex flex-col gap-2">
              <input 
              type="text"
              id="filter-unselect"
              placeholder="Filter Unlisted"
              className="rounded-lg border border-white/10 bg-[#0e1320] px-3 py-2 text-white placeholder:text-[#9aa9c1]"
              onChange={(event) => setFilterStringUnsel(event.target.value.replace(/\s+/g, "_").toLowerCase())}/>
            </div>
            <div className="flex justify-center">
              <button
              className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              onClick={pushToSelected}>
              Push all filtered to list -&gt;
              </button>
            </div>
            <div className="flex justify-center">
              <button
              className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              onClick={pushToUnselected}>
              &lt;- Push all filtered off list
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <input
              id="filter-select"
              placeholder="Filter Listed"
              className="rounded-lg border border-white/10 bg-[#0e1320] px-3 py-2 text-white placeholder:text-[#9aa9c1]"
              onChange={(event) => setFilterStringSel(event.target.value.replace(/\s+/g, "_").toLowerCase())}/>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="max-h-80 overflow-auto rounded-xl border border-white/10 bg-[#0e1320] p-3">
              {filteredUnselected.map((name) => (
                <div
                key={name}
                className="mb-2 cursor-pointer rounded-lg border border-transparent bg-white/5 px-3 py-2 transition hover:-translate-y-0.5 hover:border-[#7cf3ff]"
                onClick={(e) => {addToList(name)}}>
                  {name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </div>
              ))}
            </div>
            <div className="max-h-80 overflow-auto rounded-xl border border-white/10 bg-[#0e1320] p-3">
              {filteredSelected.map((name) => (
                <div
                key={name}
                className="mb-2 cursor-pointer rounded-lg border border-transparent bg-white/5 px-3 py-2 transition hover:-translate-y-0.5 hover:border-[#7cf3ff]"
                onClick={(e) => {removeFromList(name)}}>
                  {name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </div>
              ))}
            </div>
          </div>
        </div>}
  
      </div>
    </div>
  );
}

export default Settings;
