import { StaticEvent } from "@/statics";
import { BridgeEvent, API_COMMAND } from "@/common";

declare global {
	interface Window {
		readonly API: (command: API_COMMAND) => Promise<any>,
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
