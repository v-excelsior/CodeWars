<script>
	import Modal from 'svelte-simple-modal';
	import { Card, Header } from './components'

	import cata from './catas/JavaScript/3__Make_a_spiral'

	//TODO: use Prism.js
</script>

<template>
	<main class="app-content">
		<Modal>
			<Header/>
		</Modal>
		<pre class="language-javascript code"><code>
			{cata.code}
		</code></pre>
		<Card/>
	</main>
</template>

<style lang="scss">
	@import './src/styles/vars.scss';

	.code > * {
		font-family: 'Code';
	}

	.app-content {
		min-height: 100vh;
		background-color: $surface-secondary;
	}
</style>