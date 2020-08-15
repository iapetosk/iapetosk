<template>
	<keep-alive>
		<main id="treeview" class="contrast">
			<section id="item" class="contrast" v-for="(tree, index) in treeview" :key="index">
				<canvas id="favicon" class="contrast" :style="{ 'background-image': `url(${/^https?/.test(tree.favicon) ? tree.favicon : `https://${tree.favicon}`})` }"></canvas>
				<legend id="hostname">{{ index }}</legend>
				<!--
				<figure id="list">
					<label id="link" v-for="(link, index) in tree.list" :key="index">
						{{ link }}
					</label>
				</figure>
				-->
			</section>
		</main>
	</keep-alive>
</template>
<script src="./treeview.ts"></script>
<style scoped src="./treeview.scss"></style>
