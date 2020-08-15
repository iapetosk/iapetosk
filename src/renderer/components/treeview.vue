<template>
	<keep-alive>
		<main id="treeview" class="contrast">
			<section id="tree" v-for="(tree, index) in treeview" :key="index">
				<legend id="hostname">{{ index }}</legend>
			</section>
		</main>
	</keep-alive>
</template>
<script src="./treeview.ts"></script>
<style scoped src="./treeview.scss"></style>
