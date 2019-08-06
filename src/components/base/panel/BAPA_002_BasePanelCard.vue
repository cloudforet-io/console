<template>
  <div class="row">
    <b-col v-for="(asset, idx) in PanelsCard"
           :key="idx"
           :class="colSelector(PanelsCard.length)"
    >
      <b-row align-h="between" align-v="center" class="assets">
        <b-col cols="8">
          <h6><span v-html="iTagBuilder(asset.panelIcon)">
            </span> &nbsp; {{ asset.asKey }}
          </h6>
        </b-col>
        <b-col cols="4" class="text-right">
          <h6>
            <a :href="asset.linkURL">{{ asset.assetValue }}</a>
          </h6>
        </b-col>
      </b-row>
    </b-col>
  </div>
</template>

<script>
export default {
    name: 'BasePanelCard',
    props: {
        PanelsCard: {
            type: Array,
            required: true,
            default: () => []
        }
    },
    methods: {
        iTagBuilder (iconObject) {
            return this.selectIconHtml(iconObject);
        }
    }
};
</script>

<style lang="scss" scoped>

  .assets {
    padding: 15px;
    margin: 15px 0;
    border: 1px solid lighten($blue, 30%);
    border-radius: $border-radius;
    a {
      text-decoration: underline;
    }
  }

</style>
