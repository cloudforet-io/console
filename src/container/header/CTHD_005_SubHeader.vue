<template>
  <b-row no-gutters align-v="center" class="sub-header">
    <b-col cols="1" class="group">
      <span>identity</span>
      <span class="triangle" />
      <span class="triangle-border" />
    </b-col>
    <b-col cols="1" class="title ">
      <span>Server</span>
    </b-col>
    <b-col cols="1" class="title active">
      <span>Network</span>
    </b-col>
    <b-col cols="1" class="title">
      <span>Storage</span>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name:'SubHeader'
};
</script>

<style lang="scss" scoped>
$top-pad: 7px;

%item {
  height: 100%;
  padding-top: $top-pad;
  text-align: center;
  span {
    vertical-align: sub;
  }
}

$shape-border: 2px;
$radius: calc((#{$sub-header-height} - #{$shape-border}) / 2);
$shape-width: 20px;
%shape {
  position: absolute;
  height: 0;
  width: 0;
  top: 0px;
  border-top: $radius solid transparent;
  border-bottom: $radius solid transparent;
}

.sub-header {
  // background: $dark-gradient;
  background-color: rgba($white, .9);
  margin: 0;
  width: 100vw;
  height: $sub-header-height;
  color: $navy;
  font-weight: 500;
  font-family: $font-big;
  font-size: 0.9rem;
  box-shadow: 0px 0 5px 0px rgba($black, 0.3);
  border: 0;

  .group {
    @extend %item;
    position: relative;
    display: inline-block;
    // margin-right: 50px;
    width: 100%;
    border-bottom: 2px solid rgba($blue, 0.2);
    text-transform: uppercase;
    .triangle {
      @extend %shape;
      z-index: 2;
      right: calc(-#{$shape-width});
      border-left: $shape-width solid $white;
    }
    .triangle-border {
      @extend %shape;
      right: calc(-#{$shape-width} - #{$shape-border});
      border-left: calc(#{$shape-width} + #{$shape-border}) solid rgba($blue, 0.2);
      border-top: calc(#{$shape-width} - #{$shape-border}) solid transparent;
      border-bottom: calc(#{$shape-width} - #{$shape-border}) solid transparent;
      z-index: 1;
    }
  }
  .title {
    @extend %item;
    // margin: 0 10px;
    // border-radius: 5px;
    cursor: pointer;
    background-color: white;
    &.active {
      border-bottom: 2px solid $blue;
      background-color: rgba($blue, 0.05);
    }
    &:hover {
      background-color: rgba($blue, 0.1);
    }
  }
}
</style>