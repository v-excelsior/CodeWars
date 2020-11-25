<script>
  import  links from '../data/social.json'
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