<template>
  <b-row>
    <b-col cols="12" class="base-tab-nav">
      <template v-if="pill">
        <b-nav pills :fill="fill">
          <b-nav-item
            v-for="(curTab, idx) in navTabs"
            :key="idx"
            :class="{active: selectedTab.component === curTab.component}"
            :active="selectedTab.tabTitle === curTab.tabTitle"
            @click="selectedTab = curTab"
          >
            {{ curTab.tabTitle }}
          </b-nav-item>
        </b-nav>
      </template>
      <template v-else>
        <b-nav tabs :fill="fill">
          <b-nav-item
            v-for="(curTab, idx) in navTabs"
            :key="idx"
            :class="{active: selectedTab.component === curTab.component}"
            :active="selectedTab.tabTitle === curTab.tabTitle"
            @click="selectedTab = curTab"
          >
            {{ curTab.tabTitle }}
          </b-nav-item>
        </b-nav>
      </template>
      <slot v-if="useSlot" :name="setTabName(selectedTab)" />
      <template v-else>
        <template v-if="keepAlive">
          <keep-alive>
            <component :is="selectedTab.component" />
          </keep-alive>
        </template>
        <template v-else>
          <component :is="selectedTab.component" />
        </template>
      </template>
      <b-row>
        <slot name="footerArea">
          <div class="col-md-12">
            <div v-show="isFooterVisible" class="modal-footer" style="border-top:none; padding-right: 0px">
              <b-button v-show="isCreatable" size="md" variant="outline-primary" @click="createNew">
                Create
              </b-button>
              <b-button v-show="isUpdatable" size="md" variant="outline-success" @click="updateSelect">
                Update
              </b-button>
              <b-button v-show="isDeletable" size="md" variant="outline-danger" @click="deleteSelect">
                Delete
              </b-button>
              <b-button size="md" variant="outline-warning" @click="closeWindow">
                Cancel
              </b-button>
            </div>
          </div>
        </slot>
      </b-row>
    </b-col>
  </b-row>
</template>
<script>
import { api } from '@/setup/api';
let baseTabParams = {};
export default {
    name: 'BaseTabs',
    event: ['close'],
    props: {
        navTabs: {
            type: Array,
            default: () => []
        },
        keepAlive: {
            type: Boolean,
            default: false
        },
        fill: {
            type: Boolean,
            default: false
        },
        defaultTab: {
            type: Number,
            default: 0
        },
        useSlot: {
            type: Boolean,
            default: false
        },
        isFooterVisible: {
            type: Boolean,
            default: false
        },
        isCreatable: {
            type: Boolean,
            default: false
        },
        isUpdatable: {
            type: Boolean,
            default: false
        },
        pill: {
            type: Boolean,
            default: false
        },
        isDeletable: {
            type: Boolean,
            default: false
        },
        selectedData: {
            type: Object,
            default: () => {}
        },
        tab: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            selectedTab: this.navTabs[this.defaultTab],
            isCreate: this.isCreatable,
            isUpdate: this.isUpdatable,
            isDelete: this.isDeletable
        };
    },
    created () {

    },
    beforeDestroy: function () {

    },
    methods: {
        displayFooter: () => {
            this.isFooterVisible = true;
        },
        hideFooter: () => {
            this.isFooterVisible = false;
        },
        createNew () {
            baseTabParams = this.dataforTab;
            baseTabParams['tabContents'] = this.$refs.popupTab;
            this.$emit('create', baseTabParams);
        },
        updateSelect () {
            baseTabParams = this.dataforTab;
            baseTabParams['tabContents'] = this.$refs.popupTab;
            this.$emit('update', baseTabParams);
        },
        deleteSelect: () => {
            baseTabParams = this.dataforTab;
            baseTabParams['tabContents'] = this.$refs.popupTab;
            this.$emit('delete', baseTabParams);
        },
        closeWindow (e) {
            this.$emit('close');
        },
        setTabName (selectedData) {
            return (selectedData.hasOwnProperty('tabIdxTitle')) ? selectedData.tabIdxTitle : selectedData.tabTitle;
        }

    }
};
</script>

<style lang="scss" scoped>
    .base-tab-nav .nav-tabs {
        border: none;
        .nav-item {
            z-index: 1;
            &.active {
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
                box-shadow: 0px -7px 7px -1px rgba($black, 0.1);
            }
            .nav-link {
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
                border: none;
                &.active{
                    border-top: 3px $blue solid;
                    color: $blue;
                    font-weight: bold;
                    background-color: $white;
                }
                &:hover{
                    font-weight: bold;
                }
            }
        }
    }

</style>
