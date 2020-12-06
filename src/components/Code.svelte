<script>
	export let code,name

	console.log(window.Prism)
	// window.Prism.highlight(document.querySelector('.code-popup'))
</script>

<pre class="code-popup">
	<div on:click={window.Prism.highlightAll()}/>
	<h2 class="cata-name">{name}</h2>
	<code class="language-javascript language-js">
		{code}
	</code>
</pre>

<style lang="scss">
	@import '../styles/vars.scss';
	.cata-name{
		position: absolute;
		font-size:30px;
		left:50%;
		transform: translateX(-50%);
		top:10px;
	}

	.code-popup {
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