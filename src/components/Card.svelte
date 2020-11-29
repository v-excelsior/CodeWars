<script>
  export let data

  console.log(data.lang)
</script>

<template>
    <div class="card">
<!--        <span>{data?.lang || 'чу'}</span><br>-->
<!--        <span>{data?.name || 'чу'}</span><br>-->
<!--        <span>{data?.q || 'чу'}</span><br>-->
    </div>
</template>

<style lang="scss">
  .card {
    height: 200px;
    width: 200px;
    background-color: pink;
    margin: 10px;
  }
</style>