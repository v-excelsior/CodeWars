<script>
	export let code
</script>

<div class="code">
    <pre class="language-javascript code">
		<code>
			{code}
		</code>
	</pre>
</div>

<style lang="scss">
	@import '../styles/vars.scss';

	.code {
		max-height: 70vh;

		&::-webkit-scrollbar {
			height: 6px;
			width: 6px;
			border-radius: 2px;
		}

		&::-webkit-scrollbar-track {
			margin: 0;
			background: $surface-primary;
		}

		&::-webkit-scrollbar-thumb {
			border-radius: 2px;
			background: gray;
		}

		&::-webkit-scrollbar-corner {
			background: $surface-primary;
		}
	}
</style>