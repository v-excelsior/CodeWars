<script>
	import Modal from 'svelte-simple-modal';
	import { Card, Header, Gallery } from './components'
</script>


<main class="app-content">
	<Modal>
		<Header/>
	</Modal>
	<Gallery/>
	<pre class="language-javascript code">
		<code>
			{'bla-bla'}
		</code>
	</pre>
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