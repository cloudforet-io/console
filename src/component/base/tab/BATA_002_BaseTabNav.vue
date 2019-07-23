<template>
   <b-col class="col-xs-6 col-sm-6 col-md-12 col-lg-12">
     <b-nav tabs :fill="fill">
       <b-nav-item
         v-for="(ntab, idx) in navTabs"
         @click="selectedTab = ntab.component"
         :active="selectedTab === ntab.component"
         :key="idx"
         >
         {{ntab.tabTitle}}
       </b-nav-item>
     </b-nav>
     <template v-if="keepAlive" >
       <keep-alive>
         <component :is="selectedTab"></component>
       </keep-alive>
     </template>
     <template v-else>
        <component :is="selectedTab"></component>
     </template>
    <b-row>
      <slot name="footerArea" >
        <div class="col-md-12">
          <div class="modal-footer" style="border-top:none; padding-right: 0px" v-show="isFooterVisible">
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
  let baseTabParams = {};
  export default {
    name: 'BaseTabs',
    components: {
    },
    props: {
      navTabs:{
        type: Array,
        default: () => []
      },
      keepAlive:{
        type: Boolean,
        default: false,
      },
      fill:{
        type: Boolean,
        default: false,
      },
      isFooterVisible:{
        tyep:Boolean,
        default: false,
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
      selectedData:{
        type: Object,
        default: () => {}
      },
      tab:{
        type: Object,
        default: () => {}
      },
    },
    created(){

    },
    beforeDestroy: function(){

      },
    data() {
      return {
        prosData: {},
        selectedTab : this.tab,
        isCreate: this.isCreatable,
        isUpdate: this.isUpdatable,
        isDelete: this.isDeletable
      }
    },
    methods: {
      displayFooter:() => {
        this.isFooterVisible = true;
      },
      hideFooter:() => {
        this.isFooterVisible = false;
      },
      createNew (){
        baseTabParams = this.dataforTab;
        baseTabParams['tabContents'] =  this.$refs.popupTab;
        this.$emit('create', baseTabParams);
      },
      updateSelect (){
        baseTabParams = this.dataforTab;
        baseTabParams['tabContents'] =  this.$refs.popupTab;
        this.$emit('update', baseTabParams);
      },
      deleteSelect:() => {
        baseTabParams = this.dataforTab;
        baseTabParams['tabContents'] =  this.$refs.popupTab;
        this.$emit('delete', baseTabParams);
      },
      closeWindow (e) {
        this.$parent.$store.dispatch('modal/closeModal');
      },
    }
  }
</script>

<style lang="scss" scoped>
  .nav>li>a {
    &.nav-link.active{
      border-top: 3px #3bafda solid;
    }

    &.active {
      color: #3bafda !important;
      font-weight: bold;
    };

    &:hover{
      border-top: 3px #3bafda solid;
      font-weight: bold;
    }
  }

</style>
