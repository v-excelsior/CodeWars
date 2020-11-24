<script>
  import { getContext } from "svelte";

  const { close } = getContext('simple-modal')
</script>

<template>
    <button on:click={close} class="modal-button">+</button>
</template>


<style lang="scss">
  @import './src/styles/vars.scss';

  .modal-button {
    display: block;
    width: 25px;
    height: 25px;
    border: none;
    font-size: 25px;
    border-radius: 50%;
    outline: none;
    line-height: 1;
    position: absolute;
    z-index: 3;
    right: 10px;
    top: 10px;
    transform: rotate(45deg);
    color: white;
    cursor: pointer;
    background-color: transparent;
    transition: 0.2s;

    &:hover, &:active, &:focus {
      color: $accent;
      transform: rotate(135deg);
    }
  }
</style>