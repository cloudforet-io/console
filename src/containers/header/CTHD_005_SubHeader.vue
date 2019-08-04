<template>
  <div class="sub-header">
    <div v-for="(nav, idx) in subHeaderList" :key="nav.label"
        :class="{ 'group-title' :idx === 0,
                  'item' : idx !== 0,
                  'active' : $route.meta.label === nav.label }">
      <span class="title"><router-link :to="nav.link">{{ nav.label }}</router-link></span>
      <span v-if="idx === 0" class="triangle" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name:'SubHeader',
    computed: {
      ...mapGetters('subHeader', [
        'subHeaderList'
      ])
    },
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
    a {
      cursor: default;
    }

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