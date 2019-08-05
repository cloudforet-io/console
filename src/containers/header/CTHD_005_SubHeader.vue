<template>
  <!-- <div class="sub-header">
    <div v-for="(nav, idx) in subHeaderList" :key="nav.label"
         :class="{ 'header-group': idx === 0,
                   'item': idx !== 0,
                   'active': $route.meta.label === nav.label }"
    >
      <span class="title">
        <router-link :to="nav.link">
          <template v-if="nav.icon"><i :class="nav.icon" />&nbsp;&nbsp;</template>
          {{ nav.label }}
        </router-link>
      </span>
      <span v-if="idx === 0" class="triangle" />
    </div>
  </div> -->
  <b-row class="sub-header" no-gutters>
    <b-col cols="1" class="header-group">
      <span class="label"><i :class="subHeaderGroup.icon" />&nbsp;&nbsp;{{ subHeaderGroup.label }}</span>
      <span class="triangle" />
    </b-col>
    <b-col v-for="nav in subHeaderList" :key="nav.label" cols="1">
      <div class="item" :class="{ 'active': $route.meta.label === nav.label }">
        <span class="label">
          <router-link :to="nav.link">
            {{ nav.label }}
          </router-link>
        </span>
      </div>
    </b-col>
  </b-row>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name:'SubHeader',
    computed: {
        ...mapGetters('subHeader', [
            'subHeaderGroup',
            'subHeaderList'
        ])
    }
};
</script>

<style lang="scss" scoped>
$bg-color: rgba($white, .9);
$top-pad: 9px;
%item {
  position: relative;
  display: inline-block;
  height: $sub-header-height;
  text-align: center;
  color: darken($darkgray, 20%);
  .label {
    display: inline-block;
    padding-top: $top-pad;
    vertical-align: sub;
  }
}
$shape-height: $sub-header-height;
$shape-width: 18px;
$shape-color: darken($skyblue, 1%);

.sub-header {
  background-color: $bg-color;
  font-weight: 500;
  font-family: $font-big;
  font-size: 0.9rem;
  box-shadow: 0px 0 5px 0px rgba($black, 0.3);
  
  .header-group {
    @extend %item;
    width: 100vw;
    height: $sub-header-height;
    border: 0;
    text-transform: uppercase;
    font-size: 1.05em;
    background-color: $shape-color;
    color: $navy;
    cursor: default;
    i {
      font-size: 1.1em;
      font-weight: 600;
    }
    .triangle {
      position: absolute;
      height: 0;
      width: 0;
      top: 0px;
      right: calc(-#{$shape-width});
      border-top: $shape-height solid $shape-color;
      border-right: $shape-width solid transparent;
      z-index: 2;
    }
  }

  .item {
    @extend %item;
    cursor: pointer;
    min-width: 150px;
    width: 100%;
    &.active {
      border-bottom: 2px solid $blue;
      color: darken($blue, 10%);
      font-weight: 500;
    }
    &:hover {
      font-weight: 600;
      color: $navy;
      background-color: rgba($skyblue, 0.3);
    }
  }
}

</style>