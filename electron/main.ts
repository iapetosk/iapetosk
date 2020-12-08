import { app, session, BrowserWindow } from "electron";

app.on("ready", () => {
	// create window
	const window = new BrowserWindow({
		// icon
		icon: "source/assets/icons/icon.ico",
		// hide
		show: false,
		// borderless
		frame: false,
		// minimum width
		minWidth: 775,
		// minimum height
		minHeight: 565,
		// resize flashing
		backgroundColor: "#000000",
		// renderer proccess controls
		webPreferences: {
			// allow interacts with node.js
			nodeIntegration: true,
			// https://github.com/electron/electron/blob/master/docs/breaking-changes.md#default-changed-enableremotemodule-defaults-to-false
			enableRemoteModule: true
		}
	});
	switch (process.env.NODE_ENV) {
		case "development": {
			// webpack-dev-server
			window.loadURL("http://localhost:8080");
			break;
		}
		default: {
			// asar file
			window.loadFile("build/index.html");
			break;
		}
	}
	// show om ready
	window.on("ready-to-show", () => {
		window.show();
	});
	// bypass same-origin-policy
	session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ["*://*.hitomi.la/*"] }, (details, callback) => {
		details.requestHeaders["referer"] = "https://hitomi.la/";
		return callback({ requestHeaders: details.requestHeaders });
	});
});
