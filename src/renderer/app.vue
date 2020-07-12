<template>
	<keep-alive>
		<main id="container">
			<titlebar></titlebar>
			<article id="content">
				<querybox></querybox>
				<treeview></treeview>
				<iterable></iterable>
			</article>
			<taskbar></taskbar>
		</main>
	</keep-alive>
</template>
<script src="./app.ts"></script>
<style src="./app.scss"></style>
