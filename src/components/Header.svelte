<script>

</script>

<header class="header">
    <div class="header_main">
        <img class="header_main" src="assets/logo-36.png" alt="CodeWars logo">
        <span class="header_heading">Codewars | stats</span>
    </div>
    <span class="header_name">v - excelsior</span>
</header>

<style lang="scss">
  @import './src/styles/vars.scss';

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 55px;
    width: 100%;
    padding: 8px;
    background-color: $surface-primary;
    font-size: 18px;

    &_main {
      display: flex;
      align-items: center;
    }

    &_heading {
      padding: 0 12px;

      color: $accent;
    }

    &_name {
      color: $accent;
      padding: 0 20px;
    }
  }
</style>