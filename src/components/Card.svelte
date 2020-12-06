<script>
  export let data

  import Icon from './Icon.svelte'
  import icons from './icon_map'

  const { lang, name, q } = data
</script>

<div class="card">
    <Icon IconImage={icons[lang]} class="cata-icon"/>
    <div class="q">{q}</div>
    <p>{name}</p>

</div>

<style lang="scss">
  @import "src/styles/vars";

  .card {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $surface-card;
    border-radius: 4px;
    font-family: 'Code';
    color:$text-primary;
    padding:4px 30px;
    min-height: 64px;
    text-align: center;
    position: relative;

    .q{
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      right:4px;
      bottom:4px;
      font-size: 20px;
      width: 24px;
      height: 24px;
      color: $accent;
    }

    &:hover{
      background-color:  $surface-card__hover;
    }
  }
</style>