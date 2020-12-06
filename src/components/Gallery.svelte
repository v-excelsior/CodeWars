<script>
  import Card from './Card.svelte'
  import catas from '../data/catas'

</script>

{#each catas as cata}
    <>
        <Card data={cata}/>
    </>
{/each}