<template>
      <b-col xs="12" lg="12">
          <b-tabs v-model="tabIndex[0]" :fill="fill">
                <b-tab
                  :lazy="true"
                  v-for="(tab, idx) in tabs"
                  :key="tab.path"
                  @click="setCurrentTab(tab)">
                    <div name="tabHeader" v-if="!tab.icon" slot="title">
                        <i  :class="tab.tabIcon" style="color:blue"></i>
                        {{tab.tabTitle}}
                    </div>
                    <br>
                  <keep-alive>
                    <slot name="tabsContentPanel">
                      <component
                        :is="currentTab.component"
                        class="tab">
                      </component>
                    </slot>
                  </keep-alive>
              </b-tab>

          </b-tabs>
    <b-row>
      <slot name="footerArea" >
        <div class="col-md-12">
          <div class="modal-footer" style="border-top:none; padding-right: 0px" v-show="isfooterVisible">
            <b-button size="md" v-show="isCreatable" @click="CreateNew" variant="outline-primary">Create</b-button>
            <b-button size="md" v-show="isUpdatable" @click="updateSelect" variant="outline-success">Update</b-button>
            <b-button size="md" v-show="isDeletable" @click="deleteSelect" variant="outline-danger">Delete</b-button>
            <b-button size="md" variant="outline-warning" @click="closeWindow">Cancel</b-button>
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
      isCreatable:{
        tyep:Boolean,
        default: false,
      },
      isUpdatable:{
        tyep:Boolean,
        default: false,
      },
      isDeletable:{
        tyep:Boolean,
        default: false,
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
        if(!tab.isSelected){
          tab.isSelected = true;
        }
        this.currentTab = tab;
      },
      displayFooter:() => {
        this.isfooterVisible = true;
      },
      hideFooter:() => {
        this.isfooterVisible = false;
      },
      displayCreatable:() => {
        this.isCreatable = true;
      },
      hideCreatable:() => {
        this.isCreatable = false;
      },
      displayUpdatable:() => {
        this.isUpdatable = true;
      },
      hideUpdatable:() => {
        this.isUpdatable = false;
      },
      displayDeletable:() => {
        this.isDeletable = true;
      },
      hideDeletable:() => {
        this.isDeletable = false;
      },
      CreateNew:() => {

      },
      updateSelect:() => {

      },
      deleteSelect:() => {

      },
      closeWindow (e) {
        this.$parent.$store.dispatch('modal/closeModal');
      },
    }
  }
</script>

<style lang="scss" scoped>


</style>
