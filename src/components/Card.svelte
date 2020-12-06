<script>
  export let data

  import Icon from './Icon.svelte'
  import icons from './icon_map'

  const { lang, name, q } = data
</script>

<div class="card">
    <Icon IconImage={icons[lang]}/>
    <p>{lang}</p>
    <p>{name}</p>
    <p>{q}</p>
</div>

<style lang="scss">
  @import "src/styles/vars";

  .card {
    background-color: $surface-card;
    border-radius: 4px;
    text-align: center;

    &:hover{
      background-color:  $surface-card__hover;
    }
  }
</style>