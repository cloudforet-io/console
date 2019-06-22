<template>
  <div>
    <div class="row m-t-15">
      <div class="col-xl-2 col-sm-3 col-xs-12" style="background: white">
        <div class="navigation-tree" style="text-color: #000">
          <b-tree-view
            :data="treeData"
            :contextMenuItems="contextMenuItems"
            :showIcons="true"
            :showIcon="true"></b-tree-view>
        </div>
      </div>
      <div class="col-xl-10 col-sm-9 col-xs-12"></div>
    </div>
  </div>

</template>
<script>
  import { api } from '@/setup/api'
  import { bTreeView } from 'bootstrap-vue-treeview'
  export default {
    name: "Project",
    components: {
      bTreeView,
    },
    props:{

    },
    mounted: function () {
      //TODO: Please find a way to check minimize, side bar

      /*$('.sidebar-minimizer').click();
      console.log( "BaseSide Bar Status previous: " , BaseSidebar.state.isSlidedIn)
      const slideState = BaseSidebar.state.isSlidedIn == true ? true : false;
      BaseSidebar.state.isSlidedIn = slideState;
      console.log( "BaseSide Bar Status after: " , BaseSidebar.state.isSlidedIn)*/
    },
    data: function() {
      return {
        count: 1,
        currentUser: null,
        treeData: [{"id": 2, "name": "Venus" , "children": [{"id": 3, "name": "Neptune"}, {"id": 4, "name": "Stratus"} ] } ],
        selectedNode: null,
        treeFilter:'',
        contextMenuItems:[
          { code: 'ADD_CHILD_NODE', label: 'Add Child' },
          { code: 'DELETE_NODE', label: 'Delete node' },
          { code: 'RENAME_NODE', label: 'Rename node' },
        ],
      }
    },
    methods: {

    },
    computed:{
    }
  };
</script>
<style scoped>

</style>
