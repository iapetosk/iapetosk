<template>
	<keep-alive>
		<header id="titlebar" class="contrast draggable">
			<button id="focus" class="none-draggable" @click="app.minimize()">
				<!--
				<object :data="require(`@/assets/focus.svg`).default" type="image/svg+xml"></object>
				-->
				<svg v-html="require(`!html-loader!@/assets/icons/focus.svg`)"></svg>
			</button>
			<button id="restore" class="none-draggable" @click="restore = !restore">
				<!--
				<object :data="require(`@/assets/minimize.svg`).default" type="image/svg+xml"></object>
				-->
				<svg v-html="require(`!html-loader!@/assets/icons/${restore ? `minimize` : `maximize`}.svg`)"></svg>
			</button>
			<button id="close" class="none-draggable" @click="app.close()">
				<!--
				<object :data="require(`@/assets/close.svg`).default" type="image/svg+xml"></object>
				-->
				<svg v-html="require(`!html-loader!@/assets/icons/close.svg`)"></svg>
			</button>
		</header>
	</keep-alive>
</template>
<script src="./titlebar.ts"></script>
<style scoped src="./titlebar.scss"></style>
