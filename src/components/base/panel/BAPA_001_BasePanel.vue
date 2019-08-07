<template>
  <div class="row">
    <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-12">
      <b-card class="base summary border-top-0">
        <slot v-if="useSlot" :name="privatePanel" />
        <template v-for="(item, index) in Panels" v-else :name="Panels[index].panelTitle">
          <h5 :key="item.panelTitle" class="page-header m-t-0">
            <span v-html="iTagBuilder(item.panelIcon)"/>
            &nbsp;&nbsp {{ item.panelTitle }}
          </h5>
          <hr>

          <b-container fluid>
            <dl class="dl-horizontal m-b-0 row">
              <div v-for="(info, idx) in Panels[index].data" :key="idx" class="col-sm-12 col-md-6 summary">
                <dt>{{ info.title }}</dt>
                <dd>{{ info.contents }}</dd>
                <span v-b-tooltip.hover
                      class="copy-clipboard"
                      title="Copy to Clipboard"
                      @click="CopyToClipboard(info.contents)"
                >
                  <i class="fal fa-copy" />
                </span>
              </div>
            </dl>
          </b-container>
        </template>
      </b-card>
    </b-col>
  </div>
</template>

<script>
export default {
    name: 'BasePanel',
    props: {
        useSlot: {
            type: Boolean,
            default: false
        },
        panels: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        CopyToClipboard (text) {
            this.selectToCopyToClipboard(text);
        },
        iTagBuilder (iconObject) {
            return this.selectIconHtml(iconObject);
        }
    }
};
</script>

<style lang="scss" scoped>
  .summary > dt {
    float: left;
    width: 160px;
    overflow: hidden;
    clear: left;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-height: 20px;
    font-weight: 900;
    color: #777777
  }

  .summary > dd {
    float: left;
    margin-left: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-height: 20px;
    color: #000000
  }

  .centerLabel {
    position: absolute;
    left: 2px;
    top: 2px;
    width: 256px;
    line-height: 256px;
    text-align: center;
    font-size: 36px;
    color: maroon;
  }

  .copy-clipboard i {
    visibility: hidden;
    padding: 0px 3px 0px 10px;
    cursor: pointer
  }

  .copy-clipboard:hover i {
    visibility: visible;
  }

  .card.base {
    margin-top: 10px;
    margin-bottom: 10px;
    &.summary {
      margin-top: 0;
      border-top-left-radius: 0px !important;
    }
  }

</style>
