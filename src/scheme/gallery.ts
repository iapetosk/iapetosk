import { GalleryBlock } from '@/modules/hitomi';
import { Scheme, Schema } from "@/scheme";

class Gallery extends Schema<GalleryBlock[]> {
	public get() {
		return this.$get();
	}
	public set(value: Gallery["state"]) {
		return this.$set(value);
	}
}
export default (new Gallery([], Scheme.GALLERY));
