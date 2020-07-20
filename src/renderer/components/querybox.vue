<template>
	<keep-alive>
		<section id="querybox">
			<input id="query" class="contrast" autocomplete="off" placeholder="https://www.youtube.com/watch?v=aNqFhyNeibs&t=31" :value="$store.getters[`querybox/query`]" @keyup.enter="$store.commit(`querybox/query`, { value: $event.target.value })">
		</section>
	</keep-alive>
</template>
<script src="./querybox.ts"></script>
<style scoped src="./querybox.scss"></style>
