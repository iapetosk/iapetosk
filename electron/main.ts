import { app, session, BrowserWindow, ipcMain } from "electron";

import { API_COMMAND, BridgeEvent } from "@/common";

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
			preload: require("path").resolve("build/preload.js"),
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
	// preload communication
	ipcMain.on("API", (event, command: API_COMMAND, args: any[]) => {
		switch (command) {
			case API_COMMAND.CLOSE: {
				window.close();
				break;
			}
			case API_COMMAND.FOCUS: {
				window.focus();
				break;
			}
			case API_COMMAND.BLUR: {
				window.blur();
				break;
			}
			case API_COMMAND.MINIMIZE: {
				window.minimize();
				break;
			}
			case API_COMMAND.MAXIMIZE: {
				window.maximize();
				break;
			}
			case API_COMMAND.UNMAXIMIZE: {
				window.unmaximize();
				break;
			}
			case API_COMMAND.ENTER_FULL_SCREEN: {
				window.setFullScreen(true);
				break;
			}
			case API_COMMAND.LEAVE_FULL_SCREEN: {
				window.setFullScreen(false);
				break;
			}
		}
	});
	/*
	ipcMain.handle("node_fs", async (event, command: FS, args: any[]) => {
		switch (command) {
			case FS.EXIST: {
				const [path] = args as [string];
				return node_fs.existsSync(path);
			}
			case FS.STATUS: {
				const [path] = args as [string];
				return node_fs.statSync(path);
			}
			case FS.MAKE_FILE: {
				const [path, content] = args as [string, string];
				return node_fs.writeFileSync(path, content, "utf-8");
			}
			case FS.READ_FILE: {
				const [path] = args as [string];
				return node_fs.readFileSync(path);
			}
			case FS.WIPE_FILE: {
				const [path] = args as [string];
				return node_fs.unlinkSync(path);
			}
			case FS.MAKE_DIRECTORY: {
				const [path] = args as [string];
				return node_fs.mkdirSync(path, { recursive: true });
			}
			case FS.READ_DIRECTORY: {
				const [path] = args as [string];
				return node_fs.readdirSync(path);
			}
			case FS.WIPE_DIRECTORY: {
				const [path] = args as [string];
				return node_fs.rmdirSync(path);
			}
			case FS.CREATE_READ_STREAM: {
				const [path] = args as [string];
				return node_fs.createReadStream(path);
			}
			case FS.CREATE_WRITE_STREAM: {
				const [path] = args as [string];
				return node_fs.createWriteStream(path);
			}
		}
	});
	ipcMain.handle("node_path", async (event, command: PATH, args: any[]) => {
		switch (command) {
			case PATH.ABSOLUTE: {
				const [...path] = args as string[];
				return node_path.resolve(...path);
			}
			case PATH.RELATIVE: {
				const [...path] = args as string[];
				return node_path.join(...path);
			}
			case PATH.DIRECTORY_NAME: {
				const [path] = args as [string];
				return node_path.dirname(path);
			}
			case PATH.EXTENSION_NAME: {
				const [path] = args as [string];
				return node_path.extname(path);
			}
		}
	});
	ipcMain.handle("node_http", async (event, command: HTTP, args: any[]) => {
		switch (command) {
			case HTTP.AGENT: {
				const [options] = args as [node_http.AgentOptions];
				return new node_http.Agent({ ...options });
			}
			case HTTP.REQUEST: {
				const [options] = args as [node_https.RequestOptions];
				return await new Promise((resolve, reject) => {
					node_http.request(options, (response) => {
						return resolve(response);
					}).end();
				});
			}
		}
	});
	ipcMain.handle("node_https", async (event, command: HTTPS, args: any[]) => {
		switch (command) {
			case HTTPS.AGENT: {
				const [options] = args as [node_https.AgentOptions];
				return new node_https.Agent({ ...options });
			}
			case HTTPS.REQUEST: {
				const [options] = args as [node_https.RequestOptions];
				return await new Promise((resolve, reject) => {
					node_https.request(options, (response) => {
						return resolve(response);
					}).end();
				});
			}
		}
	});
	*/
});
