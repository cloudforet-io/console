<template>
  <div class="row" @click="contextMenuIsVisible=false">
    <div class="col-2">
        <sl-vue-tree v-model="nodes"
                     ref="slVueTree" :allow-multiselect="true"
                     @select="nodeSelected"
                     @drop="nodeDropped"
                     @dblclick="editNode"
                     @nodecontextmenu="showContextMenu">
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
        </sl-vue-tree>
    </div>

    <slot name="contextPanel">
      <div class="contextmenu" ref="contextmenu" v-show="contextMenuIsVisible">
        <div class="contextmenuleaf" @click="addBaseNode"><i class="fa fa-folder"></i>&nbsp Add a Project Group</div>
        <div class="contextmenuleaf"><i class="fa fa-file"></i>&nbsp Add a Project</div>
        <div class="contextmenuleaf" @click="editNode"><i class="fa fa-edit"></i>&nbsp Edit Selected Project</div>
        <div class="node-leaf-last" @click="removeNode"><i class="fa fa-remove"></i>&nbsp Remove Selected Item</div>
      </div>
    </slot>

    <div class="col-10">
      <b-card>
        <slot name="treeSubPanel">

        </slot>
      </b-card>
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

  import {api} from '@/setup/api'
  import SlVueTree from "sl-vue-tree"

  export default {
    name: 'BaseTree',
    components: {
      SlVueTree,
      VueAlertify,
    },
    props: {
    },
    mounted: function () {
      window.slVueTree = this.$refs.slVueTree;
    },
    data() {
      return {
        lastEvent: '',
        nodes: project,
        contextMenuIsVisible: false,
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
        }else{
          const path = treeV.getSelected().map(node => node.path);
          treeV.remove(path);
        }
      },

      editNode(currentNode) {
        this.contextMenuIsVisible = false;
        const treeV = this.$refs.slVueTree;
        const paths = treeV.getSelected()[0].path;

        if(this.$parent.$children.some(el=> el.$options.name == 'BaseModal')){
          const editTitle = treeV.getSelected()[0].isLeaf ? 'Edit a Project': 'Edit a Project Group';
          this.$parent.projectModaltitle = editTitle;
          this.$parent.$refs.Modal.showModal();
        }else{
          this.$alertify.alert('Modal Error', 'Please, Check Parents Modal');
        }

        // treeV.updateNode(paths, {title: "this is an new item"} );
      },

      displayinfo(){
        this.contextMenuIsVisible = false;
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../assets/css/sl-vue-tree-ecessntial.css';

  .conmenu-leaf {
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

  .contextmenu > div {
    padding: 10px;
  }

  .contextmenuleaf {
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
