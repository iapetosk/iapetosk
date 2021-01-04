export enum ipcEvent {
	CLOSE = "close",
	BEFORE_CLOSE = "before_close",
	FOCUS = "focus",
	BLUR = "blur",
	MINIMIZE = "minimize",
	MAXIMIZE = "maximize",
	UNMAXIMIZE = "unmaximize",
	ENTER_FULL_SCREEN = "enter_full_screen",
	LEAVE_FULL_SCREEN = "leave_full_screen"
};
export default (new class Listener extends require("events").EventEmitter { });
