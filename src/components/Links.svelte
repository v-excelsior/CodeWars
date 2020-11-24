<script>
  const links = [{
    url : 'https://github.com/v-excelsior',
    text: 'Github'
  }, {
    url : 'https://t.me/v_excelsior',
    text: 'Telegram'
  }, {
    url : 'https://www.codewars.com/users/Sicely',
    text: 'Codewars'
  }]
</script>

<template>
    <ul class="links-list">
        {#each links as link}
            <li class="link">
                <a href={link.url} class="">{link.text}</a>
            </li>
        {/each}
    </ul>
</template>

<style lang="scss">
  @import './src/styles/vars.scss';

  .links-list {
    display: flex;
    flex-direction: column;
    list-style: none;

    .link {
      margin: 6px auto;

      a {
        color:white;
        text-decoration: none;

        &:hover, &:active, &:focus{
          color: $accent;
        }
      }
    }
  }
</style>