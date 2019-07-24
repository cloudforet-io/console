<template>
  <b-col xs="12" lg="12">
    <b-tabs :fill="fill">
      <b-tab v-for="(tab, idx) in tabs"
             :key="idx"
             :lazy="true"
             @click="setCurrentTab(tab)">
        <div v-if="!tab.icon" slot="title" name="tabHeader">
          <i :class="tab.tabIcon" style="color:blue" />
          {{ tab.tabTitle }}
        </div>
        <br>
        <slot name="tabsContentPanel">
          <component
            :is="currentTab.component"
            ref="popupTab"
            :selected-data="dataForTab"
            :is-creatable="isCreate"
            :is-updatable="isUpdate"
            :is-deletable="isDelete"
            class="tab"
          />
        </slot>
      </b-tab>
    </b-tabs>
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
</template>
<script>
import { api } from '@/setup/api';
let baseTabParams = {};
export default {
  name: 'BaseTabs',
  components: {
  },
  props: {
    fill: {
      type: Boolean,
      default: false
    },
    tabs: {
      type: Array,
      default: () => []
    },
    tabIndex: {
      type: Array,
      default: () => []
    },
    isCreatable: {
      type: Boolean,
      default: false
    },
    isUpdatable: {
      type: Boolean,
      default: false
    },
    isDeletable: {
      type: Boolean,
      default: false
    },
    isFooterVisible: {
      type: Boolean,
      default: false
    },
    selectedData: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      prosData: {},
      currentTab: this.tabs[0],
      dataForTab: this.selectedData,
      tabContentData: {},
      isCreate: this.isCreatable,
      isUpdate: this.isUpdatable,
      isDelete: this.isDeletable
    };
  },
  created () {
    this.$bus.$on('setTabData', this.setTabData);
  },
  mounted () {
  },
  beforeDestroy: function () {
    this.$bus.$off('setTabData');
  },
  methods: {
    setTabData (dataToSet) {
      for (let key in dataToSet) {
        this.tabContentData[key] = dataToSet[key];
      }
    },
    setCurrentTab (tab) {
      if (!tab.isSelected) {
        tab.isSelected = true;
      }
      this.currentTab = tab;
    },
    displayFooter: () => {
      this.isFooterVisible = true;
    },
    hideFooter: () => {
      this.isFooterVisible = false;
    },
    createNew () {
      baseTabParams = this.dataForTab;
      baseTabParams['tabContents'] = this.$refs.popupTab;
      this.$emit('create', baseTabParams);
    },
    updateSelect () {
      baseTabParams = this.dataForTab;
      baseTabParams['tabContents'] = this.$refs.popupTab;
      this.$emit('update', baseTabParams);
    },
    deleteSelect: () => {
      baseTabParams = this.dataForTab;
      baseTabParams['tabContents'] = this.$refs.popupTab;
      this.$emit('delete', baseTabParams);
    },
    closeWindow (e) {
      this.$parent.$store.dispatch('modal/closeModal');
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
