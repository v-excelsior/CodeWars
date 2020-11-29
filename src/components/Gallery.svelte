<script>
  import Card from './Card'

  import catas from '../data/catas'

  console.log(catas)
</script>

<template>
    {#each catas as cata}
        <Card data={cata}/>
    {/each}
</template>