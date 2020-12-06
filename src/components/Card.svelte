<script>
  import icons from './icon_map'

  import Icon from './Icon.svelte'
  import Code from './Code.svelte'
  import { getContext } from 'svelte'

  const { open } = getContext('simple-modal')

  export let data
  const { lang, name, q,code } = data

  const openModal = () => open(Code, {code}, {
    styleWindow : {
      width          : '100%',
      maxWidth       : '720px',
      backgroundColor: '#303133'
    },
    styleContent: {
      padding: '2px',
      borderRadius:'4px'
    },
    styleCloseButton:{
      display:'none'
    }
  })
</script>

<div class="card" on:click={openModal}>
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