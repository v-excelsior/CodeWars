<script>
  import { Card, Header } from './index'

  import { getContext } from 'svelte';
  import Links from './Links.svelte'

  const { open } = getContext('simple-modal');

  const showLinks = () => {
    open(Links, { message: "It's a modal!" });
  }
</script>


<template>
    <button  on:click={showLinks}>XXX</button>
    <Header/>
        <h1 class="xxx">Hello!</h1>
    <Card/>
</template>
