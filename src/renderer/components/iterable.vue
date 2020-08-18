<template>
	<keep-alive>
		<main id="iterable" @wheel="wheel">
			<section id="scroll_area">
				<section id="process" class="contrast" v-for="(thread, index) in $store.getters[`thread/list`]" :key="index" :class="{ highlight: scroll_index === index, [status_colour(thread.status)]: true }">
					<legend id="title" class="contrast center">{{ thread.title }} - ({{ thread.finished }} / {{ thread.files.length }})</legend>
					<figure id="wrapper" class="contrast" @click="scroll_index = index">
						<canvas id="thumbnail" class="contrast" :style="{ 'background-image': thread.files[0].written === thread.files[0].size ? `url(${thread.files[0].path.replace(/\\/g, `/`)})` : undefined }"></canvas>
					</figure>
				</section>
			</section>
			<section id="scroll_track" class="contrast">
				<button id="scroll_metre" v-for="index in 10" :key="index" :class="{ highlight: $store.getters[`thread/list`].length < 10 ? (scroll_index) * (1.0 / $store.getters[`thread/list`].length) < (index / 10) && (index / 10) <= (scroll_index + 1.0) * (1.0 / $store.getters[`thread/list`].length) : (index - 1.0) * ($store.getters[`thread/list`].length / 10) <= scroll_index && scroll_index < (index) * ($store.getters[`thread/list`].length / 10) }" @click="scroll_index = Math.round((index - 1.0) * ($store.getters[`thread/list`].length / 10))"></button>
			</section>
		</main>
	</keep-alive>
</template>
<script src="./iterable.ts"></script>
<style scoped src="./iterable.scss"></style>
