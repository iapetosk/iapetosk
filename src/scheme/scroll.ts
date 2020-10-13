import listener from "@/modules/listener";
import utility from "@/modules/utility";

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
		listener.emit("scroll.listen", value, this.get());
		// override
		Scroll.state = {
			...value,
			index: utility.clamp(value.index, 0, value.size - 1)
		};
	}
}
export default (new Scroll());
