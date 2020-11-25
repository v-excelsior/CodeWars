<script>
	import Modal from 'svelte-simple-modal';
	import { Card, Header } from './components'

	import prettier from "https://unpkg.com/prettier/esm/standalone.mjs";

	import cata from './catas/JavaScript/3__Make_a_spiral'

	console.log(cata)
</script>

<template>
	<main class="app-content">
		<Modal>
			<Header/>
		</Modal>
		<h1 class="xxx">Hello!</h1>
		<Card/>
	</main>
</template>

<style lang="scss">
	@import './src/styles/vars.scss';

	.app-content {
		min-height: 100vh;
		background-color: $surface-secondary;
	}
</style>