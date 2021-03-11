import { app, session, globalShortcut, BrowserWindow, ipcMain } from "electron";

import { BridgeEvent, API_COMMAND } from "@/common";

let terminal = false;

app.on("ready", () => {
	// create window
	const window = new BrowserWindow({
		icon: "source/assets/icons/icon.ico",
		show: false,
		frame: false,
		minWidth: 775,
		minHeight: 565,
		backgroundColor: "#000000",
		webPreferences: {
			// webpack or ASAR
			preload: require("path").resolve(__dirname, "preload.js"),
			// allow renderer interacts with nodejs
			nodeIntegration: true,
			// isolate preload
			contextIsolation: false
		}
	});
	// webpack or ASAR
	window.loadFile("build/index.html");
	// development
	if (!app.isPackaged) {
		// hot-reload
		require("fs").watch("build/main.js").on("change", () => {
			window.reload();
		});
		require("fs").watch("build/preload.js").on("change", () => {
			window.reload();
		});
		require("fs").watch("build/renderer.js").on("change", () => {
			window.reload();
		});
	}
	// bypass origin policy
	session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ["*://*.hitomi.la/*"] }, (details, callback) => {
		details.requestHeaders["referer"] = "https://hitomi.la/";
		return callback({ requestHeaders: details.requestHeaders });
	});
	// behaviours
	window.on("ready-to-show", () => {
		window.show();
	});
	window.on("unresponsive", () => {
		window.reload();
	});
	// window to ipcMain
	window.on(BridgeEvent.CLOSE, () => {
		window.webContents.send(BridgeEvent.CLOSE);
	});
	window.on(BridgeEvent.FOCUS, () => {
		window.webContents.send(BridgeEvent.FOCUS);
	});
	window.on(BridgeEvent.BLUR, () => {
		window.webContents.send(BridgeEvent.BLUR);
	});
	window.on(BridgeEvent.MINIMIZE, () => {
		window.webContents.send(BridgeEvent.MINIMIZE);
	});
	window.on(BridgeEvent.MAXIMIZE, () => {
		window.webContents.send(BridgeEvent.MAXIMIZE);
	});
	window.on(BridgeEvent.UNMAXIMIZE, () => {
		window.webContents.send(BridgeEvent.UNMAXIMIZE);
	});
	window.on(BridgeEvent.ENTER_FULL_SCREEN, () => {
		window.webContents.send(BridgeEvent.ENTER_FULL_SCREEN);
	});
	window.on(BridgeEvent.LEAVE_FULL_SCREEN, () => {
		window.webContents.send(BridgeEvent.LEAVE_FULL_SCREEN);
	});
	globalShortcut.register("F5", () => {
		window.webContents.send(terminal ? BridgeEvent.CLOSE_TERMINAL : BridgeEvent.OPEN_TERMINAL);
		// switch state
		terminal = !terminal;
	});
	// preload communication
	ipcMain.handle("API", async (event, command: API_COMMAND, args: any[]) => {
		switch (command) {
			case API_COMMAND.CLOSE: {
				return window.close();
			}
			case API_COMMAND.FOCUS: {
				return window.focus();
			}
			case API_COMMAND.BLUR: {
				return window.blur();
			}
			case API_COMMAND.MINIMIZE: {
				return window.minimize();
			}
			case API_COMMAND.MAXIMIZE: {
				return window.maximize();
			}
			case API_COMMAND.UNMAXIMIZE: {
				return window.unmaximize();
			}
			case API_COMMAND.ENTER_FULL_SCREEN: {
				return window.setFullScreen(true);
			}
			case API_COMMAND.LEAVE_FULL_SCREEN: {
				return window.setFullScreen(false);
			}
			case API_COMMAND.IS_PACKAGED: {
				return app.isPackaged;
			}
			case API_COMMAND.GET_PATH: {
				return app.getPath("exe").replace(/(electron|waifu-material).exe$/, "");
			}
		}
	});
});
