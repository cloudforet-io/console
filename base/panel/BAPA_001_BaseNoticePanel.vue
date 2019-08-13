<template>
  <div class="row">
    <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-12">
      <b-card class="base summary border-top-0">
        <template v-if="useSlot">
          <slot name="header" />
          <slot name="contents" />
          <slot name="footer" />
        </template>
        <div v-else id="server-summary-warning-linux" class="alert tab-content-detail-warning">
          <h4>
            <b class="text-primary">
              <i :class="selectIconHtml(selectedHeader.headerIcon, true)" />&nbsp;&nbsp;{{ selectedHeader.text }}
            </b>
          </h4>
          <br>
          <div class="mt-15 tab-content-detail-warning-msg">
            <div v-for="(opt, idx) in selectedContents" :key="idx">
              <div>
                {{ idx+1 }}.  {{ opt.text }}
              </div>
              <br>
            </div>
            <div class="mt-15">
              <b class="mr-10">{{ selectedFooter.title }}</b> {{ selectedFooter.text }}
            </div>
          </div>
        </div>
      </b-card>
    </b-col>
  </div>
</template>

<script>
export default {
    name: 'BaseNoticePanel',
    props: {
        useSlot: {
            type: Boolean,
            default: false
        },
        noticePanelData: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            selectedHeader: this.noticePanelData.header,
            selectedContents: this.noticePanelData.contents,
            selectedFooter: this.noticePanelData.footer
        };
    }
};
</script>

<style lang="scss" scoped>
  .data-content-tab .tab-content-detail .alert {
    margin: 10px;
  }

  .data-content-tab .tab-content-detail div {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .data-content-tab .tab-content-detail-warning-msg {
    line-height: 180%;
  }
  .text-pink {
    color: #f76397;
  }
  .label-inverse {
    background-color: #4c5667;
  }
</style>
