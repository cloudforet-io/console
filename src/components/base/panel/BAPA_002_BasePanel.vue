<template>
  <b-row no-gutters>
    <b-col cols="12">
      <b-card>
        <slot v-if="useSlot" :name="privatePanel" />
        <template v-for="(item) in panels" v-else :name="item.panelTitle">
          <div :key="item.panelTitle">
            <h5 class="page-header m-t-0">
              <i :class="selectIconHtml(item.panelIcon, true)" />
              &nbsp;&nbsp; {{ item.panelTitle }}
            </h5>
            <hr>
            <b-container fluid>
              <template v-if="indexChecker(item.data.length) === 0">
                <dl>
                  <div class="warning-panel" style="display: block;">
                    No {{ item.panelTitle }}
                  </div>
                </dl>
              </template>
              <dl class="dl-horizontal mb-0 row">
                <div v-for="(info, idx) in item.data" :key="idx" class="col-sm-12 col-md-6 summary">
                  <template v-if="indexChecker(item.data.length, idx) === 1">
                    <dt>{{ info.title }}</dt>
                    <dd>{{ info.contents }}</dd>
                    <span v-if="useCopyToSelect(info.copyFlag)"
                          v-b-tooltip.hover
                          class="copy-clipboard"
                          title="Copy to Clipboard"
                          @click="CopyToClipboard(info.contents)"
                    >
                      <i class="fal fa-copy" />
                    </span>
                  </template>
                </div>
                <div v-if="indexChecker(item.data.length) === 2" class="col-sm-12 col-md-6 summary">
                  <dt />
                  <dd />
                </div>
              </dl>
            </b-container>
          </div>
        </template>
      </b-card>
    </b-col>
  </b-row>
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
        indexChecker (totalLength, currentIndex) {
            return (totalLength === 0 && this.isEmpty(currentIndex)) ? 0 : (currentIndex <= totalLength-1) ? 1 : 2;
        },
        useCopyToSelect (boolean) {
            return (this.isEmpty(boolean)) ? false: boolean;
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
    font-family: 'Noto Sans', sans-serif;
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

  .warning-panel{
    text-align: center;
    color: #888;
    font-size: 18px;
  }
  .card {
    border: 0;
  }

</style>
