import { ipcRenderer } from "electron";

import * as React from "react";
import * as ReactDOM from "react-dom";

import App from "@/app";

import DiscordRPC from "@/modules/discordRPC";

import { BridgeEvent } from "@/common";

const upvotes: Record<string, boolean> = {};

ipcRenderer.on(BridgeEvent.CLOSE, () => {
	window.bridge.emit(BridgeEvent.BLUR);
});
ipcRenderer.on(BridgeEvent.FOCUS, () => {
	window.bridge.emit(BridgeEvent.BLUR);
});
ipcRenderer.on(BridgeEvent.BLUR, () => {
	window.bridge.emit(BridgeEvent.BLUR);
});
ipcRenderer.on(BridgeEvent.MINIMIZE, () => {
	window.bridge.emit(BridgeEvent.MINIMIZE);
});
ipcRenderer.on(BridgeEvent.MAXIMIZE, () => {
	window.bridge.emit(BridgeEvent.MAXIMIZE);
});
ipcRenderer.on(BridgeEvent.UNMAXIMIZE, () => {
	window.bridge.emit(BridgeEvent.UNMAXIMIZE);
});
ipcRenderer.on(BridgeEvent.ENTER_FULL_SCREEN, () => {
	window.bridge.emit(BridgeEvent.ENTER_FULL_SCREEN);
});
ipcRenderer.on(BridgeEvent.LEAVE_FULL_SCREEN, () => {
	window.bridge.emit(BridgeEvent.LEAVE_FULL_SCREEN);
});
// upvotes
window.bridge.on(BridgeEvent.CLOSE, (args) => {
	const [$vote] = args as [string];

	if (upvotes[$vote]) {
		throw new Error(`DUPLICATED VOTE: ${$vote}`);
	} else {
		upvotes[$vote] = true;
	}
	if (["storage"].every((item) => { return upvotes[item]; })) {
		window.API.close();
	}
});
ReactDOM.render(<App/>, document.getElementById("app"));

// RPC
DiscordRPC.set_activity({
	details: "Starting...",
	startTimestamp: Date.now(),
	largeImageKey: "waifu_material",
	largeImageText: "Sombian#7963",
	smallImageKey: "discord",
	smallImageText: "discord.gg/Gp7tWCe",
	partyId: "https://github.com/Any-Material",
	instance: true
});
