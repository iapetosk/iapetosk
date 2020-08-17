<template>
	<keep-alive>
		<main id="treeview" class="contrast">
			<section id="wrapper" class="contrast" v-for="(instance, hostname) in treeview" :key="hostname" :class="{ active: instance.active }">
				<figure id="instance" class="contrast" @click="instance.active = !instance.active">
					<canvas id="favicon" class="contrast" :style="{ 'background-image': `url(${instance.favicon})` }"></canvas>
					<legend id="hostname">{{ hostname }}</legend>
				</figure>
				<figure id="collapse">
					<button class="contrast" v-for="(id, index) in instance.list" :key="index">{{ id }}</button>
				</figure>
			</section>
		</main>
	</keep-alive>
</template>
<script src="./treeview.ts"></script>
<style scoped src="./treeview.scss"></style>
