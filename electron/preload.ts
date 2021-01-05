import { ipcRenderer } from "electron";

import * as node_events from "events";

import { API_COMMAND } from "@/common";

// @ts-ignore
window.API = {
	close: () => {
		ipcRenderer.send("API", API_COMMAND.CLOSE);
	},
	focus: () => {
		ipcRenderer.send("API", API_COMMAND.FOCUS);
	},
	blur: () => {
		ipcRenderer.send("API", API_COMMAND.BLUR);
	},
	minimize: () => {
		ipcRenderer.send("API", API_COMMAND.MINIMIZE);
	},
	maximize: () => {
		ipcRenderer.send("API", API_COMMAND.MAXIMIZE);
	},
	unmaximize: () => {
		ipcRenderer.send("API", API_COMMAND.UNMAXIMIZE);
	},
	enter_full_screen: () => {
		ipcRenderer.send("API", API_COMMAND.ENTER_FULL_SCREEN);
	},
	leave_full_screen: () => {
		ipcRenderer.send("API", API_COMMAND.LEAVE_FULL_SCREEN);
	},
	isPackaged: () => {
		return Boolean(process.env.npm_package_version);
	},
	getPath: () => {
		return process.env.execPath;
	}
};
/*
// @ts-ignore
window.node_fs = {
	[FS.EXIST]: (path: string) => {
		return ipcRenderer.invoke("node_fs", FS.EXIST, [path]).then((result) => {
			return result;
		});
	},
	[FS.STATUS]: (path: string) => {
		return ipcRenderer.invoke("node_fs", FS.STATUS, [path]).then((result) => {
			return result;
		});
	},
	[FS.MAKE_FILE]: (path: string, content: string) => {
		return ipcRenderer.invoke("node_fs", FS.MAKE_FILE, [path, content]).then((result) => {
			return result;
		});
	},
	[FS.READ_FILE]: (path: string) => {
		return ipcRenderer.invoke("node_fs", FS.READ_FILE, [path]).then((result) => {
			return result;
		});
	},
	[FS.WIPE_FILE]: (path: string) => {
		return ipcRenderer.invoke("node_fs", FS.WIPE_FILE, [path]).then((result) => {
			return result;
		});
	},
	[FS.MAKE_DIRECTORY]: (path: string) => {
		return ipcRenderer.invoke("node_fs", FS.MAKE_DIRECTORY, [path]).then((result) => {
			return result;
		});
	},
	[FS.READ_DIRECTORY]: (path: string) => {
		return ipcRenderer.invoke("node_fs", FS.READ_DIRECTORY, [path]).then((result) => {
			return result;
		});
	},
	[FS.WIPE_DIRECTORY]: (path: string) => {
		return ipcRenderer.invoke("node_fs", FS.WIPE_DIRECTORY, [path]).then((result) => {
			return result;
		});
	},
	[FS.CREATE_READ_STREAM]: (path: string) => {
		return ipcRenderer.invoke("node_fs", FS.CREATE_READ_STREAM, [path]).then((result) => {
			return result;
		});
	},
	[FS.CREATE_WRITE_STREAM]: (path: string) => {
		return ipcRenderer.invoke("node_fs", FS.CREATE_WRITE_STREAM, [path]).then((result) => {
			return result;
		});
	}
};
// @ts-ignore
window.node_path = {
	[PATH.ABSOLUTE]: (...path: string[]) => {
		return ipcRenderer.invoke("node_path", PATH.ABSOLUTE, [...path]).then((result) => {
			return result;
		});
	},
	[PATH.RELATIVE]: (...path: string[]) => {
		return ipcRenderer.invoke("node_path", PATH.RELATIVE, [...path]).then((result) => {
			return result;
		});
	},
	[PATH.DIRECTORY_NAME]: (path: string) => {
		return ipcRenderer.invoke("node_path", PATH.DIRECTORY_NAME, [...path]).then((result) => {
			return result;
		});
	},
	[PATH.EXTENSION_NAME]: (path: string) => {
		return ipcRenderer.invoke("node_path", PATH.EXTENSION_NAME, [...path]).then((result) => {
			return result;
		});
	}
};
// @ts-ignore
window.node_http = {
	[HTTP.AGENT]: (options: node_http.AgentOptions = {}) => {
		return ipcRenderer.invoke("node_http", HTTP.AGENT, [options]).then((result) => {
			return result;
		});
	},
	[HTTP.REQUEST]: (options: node_https.RequestOptions) => {
		return ipcRenderer.invoke("node_http", HTTP.REQUEST, [options]).then((result) => {
			return result;
		});
	}
};
// @ts-ignore
window.node_https = {
	[HTTPS.AGENT]: (options: node_https.AgentOptions = {}) => {
		return ipcRenderer.invoke("node_https", HTTPS.AGENT, [options]).then((result) => {
			return result;
		});
	},
	[HTTPS.REQUEST]: (options: node_https.RequestOptions) => {
		return ipcRenderer.invoke("node_https", HTTPS.REQUEST, [options]).then((result) => {
			console.log(result)
			return result;
		});
	}
};
*/
// @ts-ignore
window.bridge = new class BridgeListener extends node_events.EventEmitter { };
// @ts-ignore
window.static = new class StaticListener extends node_events.EventEmitter { };
