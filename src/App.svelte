<script>
	import Modal from 'svelte-simple-modal';
	import { Header, Gallery } from './components'
</script>


<main class="app-content">
	<Modal>
		<Header/>
		<Gallery/>
	</Modal>
</main>

<style lang="scss">
	@import './src/styles/vars.scss';

	.app-content {
		min-height: 100vh;
		background-color: $surface-secondary;
	}
</style>