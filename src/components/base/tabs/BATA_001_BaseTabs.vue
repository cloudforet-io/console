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
                        ref="popupTab"
                        :is="currentTab.component"
                        :selectedData="dataforTab"
                        :isCreatable="isCreate"
                        :isUpdatable="isUpdate"
                        :isDeletable="isDelete"
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
            <b-button size="md" v-show="isCreatable" @click="createNew" variant="outline-primary">Create</b-button>
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
      },
      selectedData:{
        type: Object,
        default: () => {}
      }
    },
    created(){
      //This is Tabs
    },
    data() {
      return {
        currentTab: this.tabs[0],
        dataforTab: this.selectedData,
        isCreate: this.isCreatable,
        isUpdate: this.isUpdatable,
        isDelete: this.isDeletable
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
      createNew:() => {

      },
      updateSelect:() => {
        debugger;
        var sh = this.$refs.popupTab[0].projectBindingName;
        const treeV = this.selectedData.tree
        const path = this.selectedData.tree.getSelected()[0].path;
        treeV.updateNode(path, {title: sh});
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
