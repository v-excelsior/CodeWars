<script>
	import Modal from 'svelte-simple-modal';
	import { Card, Header, Gallery } from './components'

	import cata from './data/catas/3_make_a_spiral'
</script>


<main class="app-content">
	<Modal>
		<Header/>
	</Modal>
	<Gallery/>
	<pre class="language-javascript code"><code>
			{cata.code}
		</code></pre>
	<Card/>
</main>

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