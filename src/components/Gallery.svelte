<script>
  import Card from './Card.svelte'

  // import catas from '../data/catas'

  // console.log(catas.length)
  const catas = [{lang:'JS'},{lang:'JS'},{lang:'JS'},{lang:'JS'},{lang:'JS'},{lang:'JS'},{lang:'JS'},{lang:'JS'},{lang:'JS'}]
</script>

<template>
    {#each catas as cata}
        <p>
            <Card data={cata}/>
        </p>
    {/each}
</template>