export enum BridgeEvent {
	CLOSE = "close",
	FOCUS = "focus",
	BLUR = "blur",
	MINIMIZE = "minimize",
	MAXIMIZE = "maximize",
	UNMAXIMIZE = "unmaximize",
	ENTER_FULL_SCREEN = "enter-full-screen",
	LEAVE_FULL_SCREEN = "leave-full-screen",
	BEFORE_CLOSE = "before-close",
	TOGGLE_TERMINAL = "toggle-terminal"
};
export enum API_COMMAND {
	CLOSE,
	FOCUS,
	BLUR,
	MINIMIZE,
	MAXIMIZE,
	UNMAXIMIZE,
	ENTER_FULL_SCREEN,
	LEAVE_FULL_SCREEN,
	IS_PACKAGED,
	GET_PATH
};
export type CommonProps = {
	id?: string,
	class?: Record<string, boolean>,
	children?: HTMLElement | string;
};
