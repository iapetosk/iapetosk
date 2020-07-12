<template>
	<keep-alive>
		<main id="iterable" @wheel="wheel">
			<section id="scroll_area">
				<section id="process" class="contrast" v-for="(download, index) in downloadable" :key="index" :class="{ highlight: scroll_index === index }">
					<legend id="title" class="contrast center">{{ download.title }}</legend>
					<figure id="wrapper" class="contrast" @click="scroll_index = index">
						<canvas id="thumbnail" class="contrast"></canvas>
					</figure>
				</section>
			</section>
			<section id="scroll_track" class="contrast">
				<button id="scroll_metre" v-for="index in 10" :key="index" :class="{ highlight: downloadable.length < 10 ? (scroll_index) * (1.0 / downloadable.length) < (index / 10) && (index / 10) <= (scroll_index + 1.0) * (1.0 / downloadable.length) : (index - 1.0) * (downloadable.length / 10) <= scroll_index && scroll_index < (index) * (downloadable.length / 10) }" @click="scroll_index = Math.round((index - 1.0) * (downloadable.length / 10))"></button>
			</section>
		</main>
	</keep-alive>
</template>
<script src="./iterable.ts"></script>
<style scoped src="./iterable.scss"></style>
