<template>
  <div class="animated fadeIn">
    <b-col cols="12" sm="12" md="12" class="mb-12" style="padding-left: 0; padding-bottom: 0">
      <b-card>
        <div class="btn-toolbar item-list-actions">
          <slot name="buttons"></slot>
          <div class="d-flex align-items-center ml-2">
            Current actions: {{ lastEvent }}
          </div>
          <BaseModal ref="EditModal" :name="'Edit selected Project'" :title="'Edit a Project'" :centered="true" :hide-footer="true">
            <template #contents>

            </template>
          </BaseModal>
        </div>
      </b-card>
    </b-col>
    <div id="project-tree-panel" @click="contextMenuIsVisible=false">
      <div class="row">
        <div class="col-sm-9 col-md-6 col-lg-8 col-xl-2" style="padding-right: 0px" >
          <sl-vue-tree v-model="nodes" ref="slVueTree" :allow-multiselect="true" @select="nodeSelected" @drop="nodeDropped" @dblclick="editNode" @nodecontextmenu="showContextMenu">

            <template slot="title" slot-scope="{ node }">
              <span class="item-icon">
                <i class="fa fa-file" v-if="node.isLeaf"></i>
                <i class="fa fa-folder" v-if="!node.isLeaf"></i>
              </span>
              {{ node.title }}
            </template>

            <template slot="toggle" slot-scope="{ node }">
              <span v-if="!node.isLeaf">
                <i v-if="node.isExpanded" class="fa fa-chevron-down"></i>
                <i v-if="!node.isExpanded" class="fa fa-chevron-right"></i>
              </span>
            </template>

            <template slot="draginfo">
                <b>{{selectedNodesTitle}}</b>
            </template>
          </sl-vue-tree>
        </div>
        <div class="contextmenu" ref="contextmenu" v-show="contextMenuIsVisible">
          <div class="contextmenuleaf" @click="addBaseNode"><i class="fa fa-folder"></i>&nbsp Add a Project Group</div>
          <div class="contextmenuleaf"><i class="fa fa-file"></i>&nbsp Add a Project</div>
          <div class="contextmenuleaf" @click="editNode"><i class="fa fa-edit"></i>&nbsp Edit Selected Project</div>
          <div class="node-leaf-last" @click="removeNode"><i class="fa fa-remove"></i>&nbsp Remove Selected Item</div>
        </div>

        <div class="col-sm-9 col-md-6 col-lg-8 col-xl-10" style="padding-left: 0">
          <b-col xs="12" lg="12">
            <b-card>
              <b-tabs v-model="tabIndex[0]">
                <b-tab active>
                  <template slot="title">
                    <i class="icon-calculator"></i> {{tabs[0]}}
                  </template>
                  <br>
                </b-tab>
                <b-tab>
                  <template slot="title">
                    <i class="icon-basket-loaded"></i> {{tabs[1]}}
                  </template>
                  <br>
                </b-tab>
                <b-tab>
                  <template slot="title">
                    <i class="icon-pie-chart"></i> {{tabs[2]}}
                  </template>
                  <br>
                </b-tab>
              </b-tabs>
            </b-card>
            <b-row>
            </b-row>
          </b-col>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  let project = [
    {
      "title": "Item1",
      "isLeaf": true
    },
    {
      "title": "Item2",
      "isLeaf": true,
      "data": {
        "visible": false
      }
    },
    {
      "title": "Folder1",
      "isSelected": false,
      "isExpanded": false
    },
    {
      "title": "Folder2",
      "isExpanded": false,
      "children": [
        {
          "title": "Item3",
          "isLeaf": true
        },
        {
          "title": "Item4",
          "isLeaf": true
        },
        {
          "title": "Folder3",
          "children": [
            {
              "title": "Item5",
              "isLeaf": true
            }
          ]
        }
      ],
      "isSelected": true
    },
    {
      "title": "Folder5",
      "isExpanded": false
    },
    {
      "title": "Item6",
      "isLeaf": true
    },
    {
      "title": "Item7",
      "isLeaf": true,
      "data": {
        "visible": false
      }
    },
    {
      "title": "Folder6",
      "children": [
        {
          "title": "Folder7",
          "children": [
            {
              "title": "Item8",
              "isLeaf": true
            },
            {
              "title": "Item9",
              "isLeaf": true
            }
          ]
        }
      ]
    }
  ];
  const BaseModal = () => import('@/components/base/BaseModal.vue')
  import {api} from '@/setup/api'
  import SlVueTree from "sl-vue-tree"
  import VueAlertify from 'vue-alertify';

  export default {
    name: 'Project',
    components: {
      SlVueTree,
      BaseModal,
      VueAlertify
    },
    mounted: function () {
      window.slVueTree = this.$refs.slVueTree;
      //TODO: Please find a way to check minimize, side bar
      /*$('.sidebar-minimizer').click();
     console.log( "BaseSide Bar Status previous: " , BaseSidebar.state.isSlidedIn)
     const slideState = BaseSidebar.state.isSlidedIn == true ? true : false;
     BaseSidebar.state.isSlidedIn = slideState;
     console.log( "BaseSide Bar Status after: " , BaseSidebar.state.isSlidedIn)*/
    },
    data() {
      return {
        nodes: project,
        modalVisible: false,
        contextMenuIsVisible: false,
        lastEvent: 'Right-Click to open context menus on tree.',
        selectedNodesTitle: '',
        tabIndex: [0, 0],
        tabs: [
          'SUMMARY',
          'MEMBER',
          'AUDIT'
        ]
      }
    },
    methods: {

      nodeSelected(nodes, event) {
        this.selectedNodesTitle = nodes.map(node => node.title).join(', ');
        this.lastEvent = `Select nodes: ${this.selectedNodesTitle}`;
      },

      nodeToggled(node, event) {
        this.lastEvent = `Node ${node.title} is ${node.isExpanded ? 'expanded' : 'collapsed'}`;
      },
      nodeDropped(nodes, position, event) {
        this.lastEvent = `Nodes: ${nodes.map(node => node.title).join(', ')} are dropped ${position.placement} ${position.node.title}`;
      },

      setMenu: function(top, left) {
        largestHeight = window.innerHeight - this.$$.right.offsetHeight - 25;
        largestWidth = window.innerWidth - this.$$.right.offsetWidth - 25;
        if (top > largestHeight) top = largestHeight;
        if (left > largestWidth) left = largestWidth;
        this.top = top + 'px';
        this.left = left + 'px';
      },

      closeMenu: function() {
        this.viewMenu = false;
      },

      openMenu: function(e) {
        this.viewMenu = true;
        Vue.nextTick(function() {
          this.$$.right.focus();
          this.setMenu(e.y, e.x)
        }.bind(this));
        e.preventDefault();
      },

      showContextMenu(node, event) {
        event.preventDefault();
        this.contextMenuIsVisible = true;
        const $contextMenu = this.$refs.contextmenu;
        console.log('X: ' + event.clientX+ ' :Y: '+ event.clientY);
        $contextMenu.style.left = event.clientX + 'px';
        $contextMenu.style.top = event.clientY + 'px';
      },
      viewAllNode() {
        this.contextMenuIsVisible = false;
        const treeV = this.$refs.slVueTree;
        console.log('slVueTree', treeV);
        const paths = treeV.getSelected().map(node => node.path);

      },
      addBaseNode() {
        this.contextMenuIsVisible = false;
        const treeV = this.$refs.slVueTree;
        console.log('slVueTree', treeV);
        const paths = treeV.getSelected().map(node => node.path);

      },
      addNode(fn, stat, isDir) {
        this.contextMenuIsVisible = false;
        const treeV = this.$refs.slVueTree;
        const paths = treeV.getSelected().map(node => node.path);
        treeV.remove(paths);
      },
      removeNode() {
        this.contextMenuIsVisible = false;
        const treeV = this.$refs.slVueTree;
        if(treeV.getSelected()[0].children.length > 0 ) {
          this.$alertify.confirmWithTitle(
            'Remove a Project',
            'Selected item has a nested items underneath, Do you want to delete it?',
            () =>{
              const path = treeV.getSelected().map(node => node.path);
              treeV.remove(path);
              this.$alertify.success('Okay')
            },
            () =>{
              this.$alertify.error('Cancel')
            }
          );
        }
      },

      editNode(currentNode) {
        this.contextMenuIsVisible = false;
        const treeV = this.$refs.slVueTree;
        const paths = treeV.getSelected()[0].path;
        this.$refs.EditModal.showModal();
       // treeV.updateNode(paths, {title: "this is an new item"} );
      },

      displayinfo(){
        this.contextMenuIsVisible = false;
      }

    },
    created() {
      /*Promise.all([
        store.dispatch('initCategories')
      ]).then();*/
    }

  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/css/sl-vue-tree-ecessntial.css';
  .conmenu-leaf{
    border-bottom: #181b1e;
  }

  .contextmenu {
    position: absolute;
    background-color: #fff;
    color: #23282c;
    border: 1px solid #c8ced3;
    border-color: #20a8d8;
    border-radius: 0.25rem;
    cursor: pointer;
    z-index: 99999;
  }

  .contextmenu > div  {
    padding: 10px;
  }

  .contextmenuleaf{
   border-bottom: 0.5px solid #c8ced3;
  }

  .contextmenu > div:hover {
    background-color: rgba(159, 206, 255, 0.5);
  }


  .last-event {
    color: white;
    background-color: rgba(100, 100, 255, 0.5);
    padding: 10px;
    border-radius: 2px;
  }

  .tree-container {
    flex-grow: 1;
  }

  .sl-vue-tree.sl-vue-tree-root {
    flex-grow: 1;
    overflow-x: hidden;
    overflow-y: auto;
    height: 600px;
    //height: 50vw;
  }

  .item-icon {
    display: inline-block;
    text-align: left;
    width: 20px;
  }
</style>
