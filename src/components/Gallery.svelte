<script>
  import Card from './Card.svelte'

  import catas from '../data/catas'
</script>

    {#each catas as cata}
        <p>
            <Card data={cata}/>
        </p>
    {/each}