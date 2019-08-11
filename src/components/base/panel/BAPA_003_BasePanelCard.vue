<template>
<div style="padding: 15px">
  <b-row class="row" align-h="center">
    <b-col v-for="(asset, idx) in panelCard"
           :key="idx" 
           cols="12" md="4" lg="3"
           class="assets row no-gutters align-items-center"
    >
        <span class="asset-icon"><i :class="selectIconHtml(asset.panelIcon, true)" /></span>
        <b-col cols="6" class="asset-info">
          <span class="asset-name">{{ asset.asKey }}</span>
        </b-col>
        <b-col cols="6" class="asset-count">
          <span>{{ asset.assetValue }}</span>
          <i class="arrow fal fa-angle-double-right" />
        </b-col>
        <!-- <b-col cols="4" class="text-right">
          <h6>
            <a :href="asset.linkURL">{{ asset.assetValue }}</a>
          </h6>
        </b-col> -->
    </b-col>
  </b-row>
</div>
</template>

<script>
export default {
    name: 'BasePanelCard',
    props: {
        panelCard: {
            type: Array,
            required: true,
            default: () => []
        }
    }
};
</script>

<style lang="scss" scoped>

  .assets {
    position: relative;
    padding: 35px 15px 10px 15px;
    margin: 30px 20px 15px 20px;
    background-color: $white;
    border-radius: 3px;
    box-shadow: $box-shadow;
    z-index: 1;
    max-width: 275px;
    a {
      text-decoration: underline;
    }
  }
  .asset-icon {
    position: absolute;
    top: -15px;
    display: inline-block;
    height: 40px;
    width: 40px;
    line-height: 40px;
    background-color: rgba($blueviolet, .7);
    text-align: center;
    vertical-align: middle;
    border-radius: 3px;
    box-shadow: 0 0 5px 0 rgba($black, 0.3);
    i {
      font-size: 1.4rem;
      vertical-align: middle;
    }
  }

  .asset-info {
    text-align: center;
  }
  .asset-name {
    vertical-align: middle;
    font-size: 1.2rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  .asset-count {
    text-align: right;
    font-size: 2.5rem;
    font-weight: 700;
    // color: $violet;
    span {
      cursor: pointer;
      vertical-align: middle;
      padding-right: 10px;
      background: linear-gradient(to top, $blue, $violet);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .arrow {
      cursor: pointer;
      vertical-align: middle;
      margin-right: 25px;
      color: $navy;
      font-size: .6em;
    }
  }
  

</style>
