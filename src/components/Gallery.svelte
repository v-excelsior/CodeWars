<script>
  import Card from './Card.svelte'

  import catas from '../data/catas'

  console.log(catas.forEach(x => console.log(x.lang)))
</script>

{#each catas as cata}
    <p>
        <Card data={cata}/>
    </p>
{/each}