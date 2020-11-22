<script>
  import { getContext } from 'svelte';
  import Links from './Links.svelte'

  const { open } = getContext('simple-modal');

  const showLinks = () => {
    open(Links, { message: "It's a modal!" });
  }
</script>

<header class="header">
    <div class="header_content container">
        <div class="header_main">
            <img class="header_icon" src="assets/logo-36.png" alt="CodeWars logo">
            <span class="header_heading">Codewars | stats</span>
        </div>

         <button class="header_name" on:click={showLinks} title="CHANGE MEEEEEEE">v - excelsior</button>
    </div>
</header>

<style lang="scss">
  @import './src/styles/vars.scss';
  @import './src/styles/mixins.scss';

  .header {
    height: 55px;
    padding: 8px;
    background-color: $surface-primary;

    @include screen('max', $M) {
      height: 40px;
    }

    &_content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    &_main {
      display: flex;
      align-items: center;
    }

    &_icon {
      @include screen('max', $M) {
        height: 24px;
      }
    }

    &_heading {
      font-size: 18px;
      padding: 0 12px;
      color: $accent;

      @include screen('max', $M) {
        font-size: 12px;
      }
    }

    &_name {
      font-size: 24px;
      padding: 0 20px 6px;
      color: $accent;

      @include screen('max', $M) {
        font-size: 16px;
        padding: 0 8px;
      }
    }
  }
</style>