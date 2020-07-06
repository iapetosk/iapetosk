import { Component, Vue} from "vue-property-decorator";

@Component({})
export default class TitleBar extends Vue {
	private focus: boolean = false;
	private restore: boolean = false;
	created(): void {
	}
}