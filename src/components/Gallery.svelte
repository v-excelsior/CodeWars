<script>
  import Card from './Card.svelte'
  import catas from '../data/catas'
</script>

<div class="container grid-gallery">
    {#each catas as cata}
        <Card data={cata}/>
    {/each}
</div>