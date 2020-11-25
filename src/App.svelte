<script>
	import Modal from 'svelte-simple-modal';
	import { Card, Header } from './components'

	import cata from './catas/JavaScript/3__Make_a_spiral'

	console.log(cata)
</script>

<template>
	<main class="app-content">
		<Modal>
			<Header/>
		</Modal>
		<pre class="x"><code>
						{cata}
			</code></pre>
		<h1 class="xxx">Hello!</h1>
		<Card/>
	</main>
</template>

<style lang="scss">
	@import './src/styles/vars.scss';

	pre, code {
		font-family: monospace, monospace;
	}
	pre {
		overflow: auto;
	}
	pre > code {
		display: block;
		padding: 1rem;
		word-wrap: normal;
	}

	.app-content {
		min-height: 100vh;
		background-color: $surface-secondary;
	}
</style>