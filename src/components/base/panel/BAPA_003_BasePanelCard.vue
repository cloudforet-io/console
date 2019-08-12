<template>
  <div style="padding: 15px">
    <b-row class="row" align-h="between">
      <b-col v-for="(asset, idx) in panelCard"
             :key="idx" 
             cols="12" md="10" lg="6"
             class="asset-container"
      >
        <b-row align-v="center" class="asset">
          <span class="asset-icon"><i :class="selectIconHtml(asset.panelIcon, true)" /></span>
          <b-col cols="7" class="asset-info">
            <span class="asset-name">{{ asset.asKey }}</span>
          </b-col>
          <b-col cols="5" class="asset-count">
            <a :href="asset.linkURL">
              <span>{{ asset.assetValue }}</span>
              <i class="arrow fal fa-angle-double-right" />
            </a>
          </b-col>
        </b-row>
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

  .asset-container {
    text-align: center;
    max-width: 320px;
    min-width: 280px;
    }
  .asset {
    position: relative;
    padding-top: 35px;
    margin: 30px 0;
    background-color: $white;
    border-radius: 3px;
    box-shadow: $box-shadow;
    z-index: 1;
    a {
      text-decoration: underline;
    }
  }
  .asset-icon {
    position: absolute;
    top: -15px;
    left: 20px;
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
    padding-right: 25px;
    a {
      text-decoration: none;
    }
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
      color: $navy;
      font-size: .6em;
    }
  }
  

</style>
