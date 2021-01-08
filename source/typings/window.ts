import { BridgeEvent, API_COMMAND } from "@/common";
import { StaticEvent } from "@/statics";

declare global {
	interface Window {
		readonly API: {
			[API_COMMAND.CLOSE]: () => Promise<void>,
			[API_COMMAND.FOCUS]: () => Promise<void>,
			[API_COMMAND.BLUR]: () => Promise<void>,
			[API_COMMAND.MINIMIZE]: () => Promise<void>,
			[API_COMMAND.MAXIMIZE]: () => Promise<void>,
			[API_COMMAND.UNMAXIMIZE]: () => Promise<void>,
			[API_COMMAND.ENTER_FULL_SCREEN]: () => Promise<void>,
			[API_COMMAND.LEAVE_FULL_SCREEN]: () => Promise<void>,
			[API_COMMAND.IS_PACKAGED]: () => Promise<boolean>,
			[API_COMMAND.GET_PATH]: () => Promise<string>;
		},
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
