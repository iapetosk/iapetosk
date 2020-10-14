import Listener from "@/modules/listener";
import Utility from "@/modules/utility";

class Scroll {
	private static state: {
		length: number,
		index: number,
		size: number;
	} = {
		length: 0,
		index: 0,
		size: 0
	};
	public get(): typeof Scroll.state {
		return Scroll.state;
	}
	public set(value: typeof Scroll.state): void {
		// listener [new, old]
		Listener.emit("scroll", value, this.get());
		// override
		Scroll.state = {
			...value,
			index: Utility.clamp(value.index, 0, value.size - 1)
		};
	}
}
export default (new Scroll());
