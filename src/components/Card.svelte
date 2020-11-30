<script>
  export let data

  console.log(data.lang)
</script>

<div class="card">
    <span>{data?.lang}</span><br>
    <span>{data?.name}</span><br>
    <span>{data?.q}</span><br>
</div>

<style lang="scss">
  .card {
    height: 200px;
    width: 200px;
    background-color: pink;
    margin: 10px;
  }
</style>