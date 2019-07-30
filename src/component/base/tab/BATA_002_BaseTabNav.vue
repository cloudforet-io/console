<template>
  <b-row>
    <b-col class="base-tab-nav col-xs-6 col-sm-6 col-md-12 col-lg-12">
      <b-nav tabs :fill="fill">
        <b-nav-item
          v-for="(ntab, idx) in navTabs"
          :key="idx"
          :class="{active: selectedTab === ntab.component}"
          :active="selectedTab === ntab.component"
          @click="selectedTab = ntab.component"
        >
          {{ ntab.tabTitle }}
        </b-nav-item>
      </b-nav>
      <template v-if="keepAlive">
        <keep-alive>
          <component :is="selectedTab" />
        </keep-alive>
      </template>
      <template v-else>
        <component :is="selectedTab" />
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
  components: {
  },
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
    isFooterVisible: {
      tyep: Boolean,
      default: false
    },
    isCreatable: {
      tyep: Boolean,
      default: false
    },
    isUpdatable: {
      tyep: Boolean,
      default: false
    },
    isDeletable: {
      tyep: Boolean,
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
      prosData: {},
      selectedTab: this.tab,
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
      this.$parent.$store.dispatch('modal/closeModal');
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
