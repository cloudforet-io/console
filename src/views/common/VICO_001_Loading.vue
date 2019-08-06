<template>
  <div class="spinner-container">
    <span class="spinner"><i class="fal fa-spinner fa-pulse" /></span>
  </div>
</template>

<script>
export default {
    name: 'Loading'
};
</script>

<style lang="scss" scoped>
.spinner-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    background: linear-gradient($blue, $violet);
    .spinner {
      position: absolute;
      display: inline-block;
      top: 50%;
      left: 50%;
      width: 60px;
      height: 60px;
      transform: translate(-50%, -50%);
      font-size: 50px;
      color: $white;
      text-align: center;
      overflow: hidden;
      i {
        vertical-align: top;
      }
    }
  }
</style>
