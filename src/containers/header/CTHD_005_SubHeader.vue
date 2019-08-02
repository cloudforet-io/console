<template>
  <div class="sub-header">
    <div class="group-title">
      <span class="title">identity</span>
      <span class="triangle" />
    </div>
    <div class="item">
      <span class="title">Server</span>
    </div>
    <div class="item active">
      <span class="title">Network</span>
    </div>
    <div class="item">
      <span class="title">Storage</span>
    </div>
  </div>
</template>

<script>
export default {
  name:'SubHeader'
};
</script>

<style lang="scss" scoped>
$bg-color: rgba($white, .9);
$top-pad: 9px;
%item {
  display: inline-block;
  box-sizing: content-box;
  height: $sub-header-height;
  min-width: 150px;
  text-align: center;
  color: lighten($black, 30%);
  .title {
    display: inline-block;
    padding-top: $top-pad;
    vertical-align: sub;
  }
}

.sub-header {
  background-color: $bg-color;
  margin: 0;
  width: 100vw;
  height: $sub-header-height;
  font-weight: 500;
  font-family: $font-big;
  font-size: 0.9rem;
  box-shadow: 0px 0 5px 0px rgba($black, 0.3);
  border: 0;

  .item {
    @extend %item;
    cursor: pointer;
    &.active {
      border-bottom: 2px solid $blue;
      color: darken($blue, 10%);
      font-weight: 500;
    }
    &:hover {
      font-weight: 800;
      color: $navy;
    }
  }

  $shape-height: $sub-header-height;
  $shape-width: 25px;
  $shape-color: darken($skyblue, 1%);

  .group-title {
    @extend %item;
    position: relative;
    text-transform: uppercase;
    background-color: $shape-color;
    color: $navy;
    // margin-right: $shape-width;

    .triangle {
      position: absolute;
      height: 0;
      width: 0;
      top: 0px;
      right: calc(-#{$shape-width});
      border-top: $shape-height solid $shape-color;
      border-right: $shape-width solid transparent;
    }
  }
}
</style>