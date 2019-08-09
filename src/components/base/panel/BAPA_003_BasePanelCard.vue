<template>
  <div class="row">
    <b-col v-for="(asset, idx) in panelCard"
           :key="idx"
           :class="colSelector(panelCard.length)"
    >
      <b-row align-h="between" align-v="center" class="assets">
        <b-col cols="6" class="asset-info">
          <span class="asset-icon"><i :class="selectIconHtml(asset.panelIcon, true)" /></span>
          <br>
          <span class="asset-name">{{ asset.asKey }}</span>
        </b-col>
        <b-col cols="6">
          <h6>
            <span class="asset-count">{{ asset.assetValue }} <i class="arrow fal fa-angle-double-right" /></span>
          </h6>
        </b-col>
        <!-- <b-col cols="4" class="text-right">
          <h6>
            <a :href="asset.linkURL">{{ asset.assetValue }}</a>
          </h6>
        </b-col> -->
      </b-row>
    </b-col>
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
    @extend %sheet;
    padding: 15px;
    margin: 15px 0;
    background-color: $white;
    a {
      text-decoration: underline;
    }
  }
  .asset-info {
    text-align: center;
  }
  .asset-count {
    display: block;
    text-align: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: $blue;
    margin-top: 20px;
    margin-bottom: 20px;
    .arrow {
      color: $black;
      font-size: .7em;
      margin-left: 5px;
      vertical-align: middle;
    }
  }
  .asset-icon {
    position: relative;
    display: inline-block;
    height: 35px;
    width: 35px;
    line-height: 35px;
    background-color: $skyblue;
    border-radius: 100%;
    text-align: center;
    vertical-align: middle;
    margin-bottom: 3px;
    i {
      vertical-align: middle;
    }
  }
  .asset-name {
    vertical-align: middle;
    font-size: 1.15rem;
    font-weight: 500;
  }

</style>
