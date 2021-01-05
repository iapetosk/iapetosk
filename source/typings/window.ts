import { BridgeEvent} from "@/common";
import { StaticEvent } from "@/statics";

declare global {
	interface Window {
		readonly API: {
			close: () => void,
			focus: () => void,
			blur: () => void,
			minimize: () => void,
			maximize: () => void,
			unmaximize: () => void,
			enter_full_screen: () => void,
			leave_full_screen: () => void,
			isPackaged: () => boolean,
			getPath: () => string;
		},
		/*
		readonly node_fs: {
			[FS.EXIST]: (path: string) => Promise<boolean>,
			[FS.STATUS]: (path: string) => Promise<node_fs.Stats>,
			[FS.MAKE_FILE]: (path: string, content: string) => Promise<void>,
			[FS.READ_FILE]: (path: string) => Promise<string>,
			[FS.WIPE_FILE]: (path: string) => Promise<void>,
			[FS.MAKE_DIRECTORY]: (path: string) => Promise<void>,
			[FS.READ_DIRECTORY]: (path: string) => Promise<string[]>,
			[FS.WIPE_DIRECTORY]: (path: string) => Promise<void>,
			[FS.CREATE_READ_STREAM]: (path: string) => Promise<node_fs.ReadStream>,
			[FS.CREATE_WRITE_STREAM]: (path: string) => Promise<node_fs.WriteStream>;
		},
		readonly node_path: {
			[PATH.ABSOLUTE]: (...path: string[]) => Promise<string>,
			[PATH.RELATIVE]: (...path: string[]) => Promise<string>,
			[PATH.DIRECTORY_NAME]: (path: string) => Promise<string>,
			[PATH.EXTENSION_NAME]: (path: string) => Promise<string>;
		},
		readonly node_http: {
			[HTTP.AGENT]: (options?: node_http.AgentOptions) => Promise<node_http.Agent>,
			[HTTP.REQUEST]: (options: node_https.RequestOptions) => Promise<node_http.IncomingMessage>;
		},
		readonly node_https: {
			[HTTPS.AGENT]: (options?: node_https.AgentOptions) => Promise<node_https.Agent>,
			[HTTPS.REQUEST]: (options: node_https.RequestOptions) => Promise<node_http.IncomingMessage>;
		},
		*/
		readonly bridge: {
			on: (event: BridgeEvent, callback: (args?: any[]) => void) => void,
			emit: (event: BridgeEvent, args?: any[]) => void;
		},
		readonly static: {
			on: (event: StaticEvent, callback: (args?: any[]) => void) => void,
			emit: (event: StaticEvent, args?: any[]) => void;
		};
	}
};
export default {};
