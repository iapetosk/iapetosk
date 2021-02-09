import { ipcRenderer } from "electron";

import * as node_events from "events";

import { API_COMMAND } from "@/common";

// @ts-ignore
window.API = (command: API_COMMAND) => {
	return ipcRenderer.invoke("API", command).then((result) => {
		return result;
	});
};
// @ts-ignore
window.bridge = new class BridgeListener extends node_events.EventEmitter { };
// @ts-ignore
window.static = new class StaticListener extends node_events.EventEmitter { };
