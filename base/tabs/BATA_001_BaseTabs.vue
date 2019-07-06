<template>
      <b-col xs="12" lg="12">
      <b-tabs v-model="tabIndex[0]" :fill="fill">
            <b-tab
              v-for="(tab, idx) in tabs"
              :key="tab.path"
              @click="setCurrentTab(tab)">
                <div name="tabHeader" v-if="!tab.icon" slot="title"><i  :class="tab.tabIcon" style="color:blue"></i> {{tab.tabTitle}}
                </div>
                <br>

                <slot name="tabsContentPanel">
                  <keep-alive>
                    <component
                      :is="currentTab.component"
                      class="tab"
                    ></component>
                  </keep-alive>
                </slot>
          </b-tab>
      </b-tabs>

    <b-row>
      <slot name="footerArea" >
        <div class="col-md-12">
          <div class="modal-footer" style="border-top:none; padding-right: 0px" v-show="isfooterVisible">
            <b-button size="md" variant="outline-success">Update</b-button>
            <b-button size="md" variant="outline-danger" @click="closeWindow">Cancel</b-button>
          </div>
      </div>
      </slot>
    </b-row>
      </b-col>
</template>
<script>
  import {api} from '@/setup/api'

  export default {
    name: 'BaseTabs',
    components: {
    },
    props: {
      fill:{
        type: Boolean,
        default: false,
      },
      tabs:{
        type: Array,
        default: () => []
      },
      tabIndex:{
        type: Array,
        default: () => []
      },
      isfooterVisible:{
        tyep:Boolean,
        default: false,
      }
    },

    data() {
      return {
        currentTab: this.tabs[0]
      }
    },
    methods: {
      setCurrentTab (tab) {
        this.currentTab = tab;
        tab.isActive = true;
      },
      displayFooter:() => {
        this.isfooterVisible = true;
      },
      hideFooter:() => {
        this.isfooterVisible = false;
      },
      closeWindow (e) {
        this.$parent.$store.dispatch('modal/closeModal');
      },
    }
  }
</script>

<style lang="scss" scoped>


</style>
