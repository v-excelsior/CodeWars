<script>
  export let data

  import js_icon from '../../public/assets/js.svg'

</script>

<div class="card">
    <p>{data?.lang}</p>
    <p>{data?.name}</p>
    <p>{data?.q}</p>
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