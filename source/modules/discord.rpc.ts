// @ts-ignore
import * as RPC from "discord-rpc";

/**
 * @see https://discord.com/developers/docs/rich-presence/how-to
 */
export type RichPresence = {
	state?: string,
	details?: string,
	startTimestamp?: number,
	endTimestamp?: number,
	largeImageKey?: string,
	largeImageText?: string,
	smallImageKey?: string,
	smallImageText?: string,
	partyId?: string,
	partySize?: number,
	partyMax?: number,
	matchSecret?: string,
	spectateSecret?: string,
	joinSecret?: string,
	instance?: boolean;
};

/**
 * @see https://discord.com/developers/applications/{application_id}/information
 */
class DiscordRPC {
	private avilable: boolean = true;
	private activity: RichPresence = {};
	readonly client = new RPC.Client({ transport: "ipc" });
	constructor(client_id: string) {
		this.client.once("ready", () => {
			this.update();
		});
		this.client.login({ clientId: client_id }).catch(() => {
			this.avilable = false;
		});
	}
	private update() {
		if (!this.avilable) {
			return;
		}
		this.client.setActivity(this.activity);
	}
	public get_activity() {
		return this.activity;
	}
	public set_activity(activity: RichPresence, preserve: boolean = true) {
		if (!this.avilable) {
			return;
		}
		if (preserve) {
			for (const key of Object.keys(activity)) {
				// @ts-ignore
				if (activity[key]) {
					// @ts-ignore
					this.activity[key] = activity[key];
				} else {
					// @ts-ignore
					delete this.activity[key];
				}
			}
		} else {
			this.activity = activity;
		}
		this.update();
	}
}
export default (new DiscordRPC("526951055079112724"));
