<template>
  <b-row no-gutters>
    <b-col cols="12">
      <b-card>
        <slot v-if="useSlot" :name="privatePanel" />
        <template v-for="(item) in panelList" v-else :name="item.panelTitle">
          <div :key="item.panelTitle">
            <b-row class="page-header m-t-0" align-h="between">
              <b-col>
                <h5>
                  <i :class="selectIconHtml(item.panelIcon, true)" />
                  &nbsp;&nbsp; {{ item.panelTitle }}
                </h5>
              </b-col>
              <b-col class="text-right">
                <span v-if="item.editable" 
                      class="edit-btn"
                      @click="$emit('edit')"
                >
                  <i class="fal fa-edit" />
                </span>
              </b-col>
            </b-row>
            <hr>
            <b-container fluid>
              <template v-if="indexChecker(item.data.length) === 0">
                <dl>
                  <div class="warning-panel" style="display: block;">
                    {{ tr('PANEL.NO_ITEM', [item.panelTitle]) }}
                  </div>
                </dl>
              </template>
              <dl class="dl-horizontal mb-0 row">
                <div v-for="(info, idx) in item.data" :key="idx" class="col-sm-12 col-md-6 summary">
                  <template v-if="indexChecker(item.data.length, idx) === 1">
                    <dt class="title">
                      {{ info.title }}
                    </dt>
                    <template v-if="!isEmpty(info.link)">
                      <dd>
                        <b><a :href="info.link" target="_blank" class="ddlink"> {{ info.contents }}</a></b>
                      </dd>
                    </template>

                    <template v-else-if="!isEmpty(info.status)">
                      <dd :style="getVariantSize(info.status)">
                        <b-badge :variant="getBadge(info.status)">
                          {{ capitalizeFirstLetter(info.status) }}
                        </b-badge>
                      </dd>
                    </template>

                    <template v-else-if="!isEmpty(info.state)">
                      <dd>
                        <BaseStateTag :state="info.stateType" 
                                      :data="info.state" 
                                      inline
                        />
                      </dd>
                    </template>

                    <template v-else-if="!isEmpty(info.badge)">
                      <dd>
                        <BaseBadgeTag :enum-key="info.badgeType" 
                                      :data="info.badge" 
                                      inline
                        />
                      </dd>
                    </template>

                    <template v-else-if="info.contents instanceof Array">
                      <dd><div v-for="(contents, i) in info.contents" :key="i">
                        {{ contents }}
                      </div>
                      </dd>
                    </template>
                    <template v-else>
                      <dd>{{ info.contents }}</dd>
                    </template>

                    <span v-if="useCopyToSelect(info.copyFlag) && !isEmpty(info.contents)"
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
const BaseStateTag = () => import('@/components/base/tags/BATG_002_BaseStateTag');
const BaseBadgeTag = () => import('@/components/base/tags/BATG_003_BaseBadgeTag');
export default {
    name: 'BasePanel',
    event: ['edit'],
    components: {
        BaseStateTag,
        BaseBadgeTag
    },
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
    computed: {
        panelList() {
            return this.panels;
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
        },
        capitalizeFirstLetter(s) {
            return s.hasOwnProperty('text') ? this.capitalize(s.text) : s.hasOwnProperty('flag') ? this.capitalize(s.flag) : '';
        },
        getVariantSize(size) {
            let variantFontSize = 3;
            if (size.hasOwnProperty('variantSize')){
                variantFontSize = size.variantSize;
            }
            return this.setFontSize(variantFontSize);
        },
        getBadge(status) {
            let badge = '';
            if (this.isEmpty(status)){
                status = badge;
            } else if (status.hasOwnProperty('flag')){
                badge = status.flag;
            }
            return this.selectBadges(badge);
        }
    }
};
</script>

<style lang="scss" scoped>
  .ddlink{
    color: $blue;
    &:hover {
      color: $red;
      text-decoration: underline;
    }
  }
  .summary > .title {
    float: left;
    width: 160px;
    overflow: hidden;
    clear: left;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-height: 20px;
    font-weight: 900;
  }

  .summary > dd {
    float: left;
    margin-left: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-height: 20px;
    color: $black;
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
    color: darken($red, 5%);
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
    color: $gray;
    font-size: 18px;
  }
  .card {
    border: 0;
  }

  .edit-btn {
      color: $black;
      font-size: 1.2em;
      cursor: pointer;
  }

</style>
