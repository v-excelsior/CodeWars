<script>
</script>

<ul class="links-list">
    <li class="link">
        <a href="https://github.com/v-excelsior" class="">Github</a>
    </li>
    <li class="link">
        <a href="https://t.me/v_excelsior">Telegram</a>
    </li>
    <li class="link">
        <a href="https://www.codewars.com/users/Sicely">Codewars</a>
    </li>
</ul>

<template>

</template>

<style lang="scss">
  @import './src/styles/vars.scss';

  .links-list {
    display: flex;
    flex-direction: column;
    list-style: none;

    .link {
      margin: 4px auto;

      a {
        color:white;
        text-decoration: none;

        &:hover{
          color: $accent;
        }
      }
    }
  }
</style>