import { app, session, ipcMain, BrowserWindow } from "electron";

import { ipcEvent } from "@/modules/listener";

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
			// allow renderer proccess interacts with nodejs
			nodeIntegration: true
		}
	});
	// webpack or ASAR
	window.loadFile("build/index.html");
	// development
	if (!app.isPackaged) {
		// hot-reload
		require("fs").watch("build/renderer.js").on("change", () => {
			window.reload();
		});
	}
	// bypass same-origin-policy
	session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ["*://*.hitomi.la/*"] }, (details, callback) => {
		details.requestHeaders["referer"] = "https://hitomi.la/";
		return callback({ requestHeaders: details.requestHeaders });
	});
	window.on("ready-to-show", () => {
		window.show();
	});
	window.on("unresponsive", () => {
		window.reload();
	});
	window.on("focus", () => {
		window.webContents.send(ipcEvent.FOCUS);
	});
	window.on("blur", () => {
		window.webContents.send(ipcEvent.BLUR);
	});
	window.on("maximize", () => {
		window.webContents.send(ipcEvent.MAXIMIZE);
	});
	window.on("unmaximize", () => {
		window.webContents.send(ipcEvent.UNMAXIMIZE);
	});
	window.on("enter-full-screen", () => {
		window.webContents.send(ipcEvent.ENTER_FULL_SCREEN);
	});
	window.on("leave-full-screen", () => {
		window.webContents.send(ipcEvent.LEAVE_FULL_SCREEN);
	});
	ipcMain.on(ipcEvent.CLOSE, () => {
		app.exit();
	});
	ipcMain.on(ipcEvent.MINIMIZE, () => {
		window.minimize();
	});
	ipcMain.on(ipcEvent.MAXIMIZE, () => {
		window.maximize();
	});
	ipcMain.on(ipcEvent.UNMAXIMIZE, () => {
		window.unmaximize();
	});
});
