<template>
  <b-row class="sub-header" no-gutters>
    <b-col cols="2" class="header-group">
      <span class="label">
        <i :class="subHeaderGroup.icon" />&nbsp;&nbsp;
        {{ subHeaderGroup.label }}
      </span>
      <!-- <span class="triangle" /> -->
    </b-col>
    <b-col cols="10" class="row ">
      <b-col v-for="nav in subHeaderList" :key="nav.label" cols="2">
        <div class="item" :class="{ 'active': $route.meta.label === nav.label }">
          <span class="label">
            <router-link :to="nav.link">
              {{ nav.label }}
            </router-link>
          </span>
        </div>
      </b-col>
    </b-col>
  </b-row>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name:'SubHeader',
    computed: {
        ...mapGetters('header', [
            'subHeaderGroup',
            'subHeaderList'
        ])
    }
};
</script>

<style lang="scss" scoped>
$bg-color: rgba($white, .9);
$top-pad: 7px;
$shape-height: $sub-header-height;
$shape-width: 18px;
$shape-color: darken($skyblue, 1%);
%item {
  position: relative;
  display: inline-block;
  height: $sub-header-height;
  width: 100%;
  text-align: center;
  color: darken($darkgray, 20%);
  .label {
    display: inline-block;
    padding-top: $top-pad;
    height: 100%;
    width: 100%;
    a {
      display: inline-block;
      height: 100%;
      width: 100%;
    }
  }
}

.sub-header {
  background-color: $bg-color;
  font-weight: 500;
  font-family: $font-big;
  font-size: 0.9rem;
  box-shadow: 0px 0 5px 0px rgba($black, 0.3);
  
  .header-group {
    @extend %item;
    height: $sub-header-height;
    text-transform: uppercase;
    font-size: 1.05em;
    color: $navy;
    cursor: default;
    i {
      font-size: 1.5em;
      font-weight: 500;
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

    border-style: solid;
    border-image: linear-gradient(to right, transparent, transparent);
    border-image-slice: 1;
    border-image-width: 0 0 2px 0;
    &.active {
      font-weight: 500;
      color: darken($blue, 10%);

      border-image: linear-gradient(to right, lighten($blue, 5%), darken($blue, 15%));
      border-image-slice: 1;
      border-image-width: 0 0 2px 0;
      &:hover {
        color: darken($blue, 10%);
        background-color: lighten($shape-color, 3%);
        background: linear-gradient(to right, transparent, $lightgray, transparent);
        
        border-image: linear-gradient(to right, lighten($blue, 5%), darken($blue, 15%));
        border-image-slice: 1;
        border-image-width: 0 0 2px 0;
      }
    }
    &:hover {
      font-weight: 600;
      color: darken($darkgray, 20%);
      background: linear-gradient(to right, transparent, $lightgray, transparent);
      
      border-image: linear-gradient(to right, $lightgray, $gray, $lightgray);
      border-image-slice: 1;
      border-image-width: 0 0 2px 0;
    }
  }
}

</style>