import { ipcRenderer } from "electron";

import * as node_events from "events";

import { API_COMMAND } from "@/common";

// @ts-ignore
window.API = {
	[API_COMMAND.CLOSE]: () => {
		return ipcRenderer.invoke("API", API_COMMAND.CLOSE).then((result) => {
			return result;
		});
	},
	[API_COMMAND.FOCUS]: () => {
		return ipcRenderer.invoke("API", API_COMMAND.FOCUS).then((result) => {
			return result;
		});
	},
	[API_COMMAND.BLUR]: () => {
		return ipcRenderer.invoke("API", API_COMMAND.BLUR).then((result) => {
			return result;
		});
	},
	[API_COMMAND.MINIMIZE]: () => {
		return ipcRenderer.invoke("API", API_COMMAND.MINIMIZE).then((result) => {
			return result;
		});
	},
	[API_COMMAND.MAXIMIZE]: () => {
		return ipcRenderer.invoke("API", API_COMMAND.MAXIMIZE).then((result) => {
			return result;
		});
	},
	[API_COMMAND.UNMAXIMIZE]: () => {
		return ipcRenderer.invoke("API", API_COMMAND.UNMAXIMIZE).then((result) => {
			return result;
		});
	},
	[API_COMMAND.ENTER_FULL_SCREEN]: () => {
		return ipcRenderer.invoke("API", API_COMMAND.ENTER_FULL_SCREEN).then((result) => {
			return result;
		});
	},
	[API_COMMAND.LEAVE_FULL_SCREEN]: () => {
		return ipcRenderer.invoke("API", API_COMMAND.LEAVE_FULL_SCREEN).then((result) => {
			return result;
		});
	},
	[API_COMMAND.IS_PACKAGED]: () => {
		return ipcRenderer.invoke("API", API_COMMAND.IS_PACKAGED).then((result) => {
			return result;
		});
	},
	[API_COMMAND.GET_PATH]: () => {
		return ipcRenderer.invoke("API", API_COMMAND.GET_PATH).then((result) => {
			return result;
		});
	}
};
// @ts-ignore
window.bridge = new class BridgeListener extends node_events.EventEmitter { };
// @ts-ignore
window.static = new class StaticListener extends node_events.EventEmitter { };
