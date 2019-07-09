<template>
  <div>
      <div class="row" @click="contextMenuIsVisible=false">
        <div class="col-xs-6 col-sm-6 col-md-6 col-lg-2">
            <sl-vue-tree v-model="treeData"
                         ref="slVueTree" :allow-multiselect="true"
                         @select="nodeSelected"
                         @drop="nodeDropped"
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

              <template slot="sidebar" slot-scope="{ node }">
                  <span class="ellipsis" style="padding:0px 3px 0px 10px; cursor:pointer" v-on:click.stop.preven="showContext($event, node)" >
                  <i  class="fa fa-ellipsis-v"></i>
                </span>
              </template>
            </sl-vue-tree>
        </div>

        <div class="contextmenu" ref="contextmenu" v-show="contextMenuIsVisible">
          <div class="contextmenuleaf" @click="excSelected('PG')"><i class="fa fa-folder"></i>&nbsp Add a Project Group</div>
          <div class="contextmenuleaf" @click="excSelected('PR')"><i class="fa fa-file"></i>&nbsp Add a Project</div>
          <div class="contextmenuleaf" @click="excSelected('SR')"><i class="fa fa-edit"></i>&nbsp Edit Selected Project</div>
          <div class="node-leaf-last"  @click="excSelected"><i class="fa fa-remove"></i>&nbsp Remove Selected Item</div>
        </div>

        <div class="col-xs-6 col-sm-6 col-md-6 col-lg-10" v-show="hasSelected">
            <slot name="treeSubPanel" >
            </slot>
        </div>
      </div>

  </div>
</template>

<script>
  import {api} from '@/setup/api'
  import SlVueTree from "sl-vue-tree"
  import { $, jQuery } from 'jquery'

  export default {
    name: 'BaseTree',
    components: {
      SlVueTree,
      VueAlertify,
    },
    props: {
      treeProp: {
        type: Array,
        default: () => []
      }
    },
    mounted: function () {
      window.slVueTree = this.$refs.slVueTree;
    },
    data() {
      return {
        contexteActionFlag: null,
        treeData: this.treeProp,
        hasSelected: false,
        lastEvent: null,
        contextMenuIsVisible: false,
        contextTopMenuIsVisible: false,
      }
    },
    methods: {
      nodeSelected(nodes, event) {
        this.lastEvent = nodes;
        this.hasSelected = true;
        this.$emit('selected', nodes)
      },
      nodeToggled(node, event) {
        this.lastEvent = `Node ${node.title} is ${node.isExpanded ? 'expanded' : 'collapsed'}`;
      },
      nodeDropped(nodes, position, event) {
        this.lastEvent = `Nodes: ${nodes.map(node => node.title).join(', ')} are dropped ${position.placement} ${position.node.title}`;
      },
      showContext (event, node) {
        this.showContextMenu(node, event, 'Clicked');
      },

      showContextMenu(node, event, hasClicked) {
          if(!hasClicked) event.preventDefault();
          this.contextMenuIsVisible = true;
          const $contextMenu = this.$refs.contextmenu;
          let coordinateX = event.clientX
          let coordinateY = event.clientY
          this.$refs.slVueTree.select(node.path);
          $contextMenu.style.left = (hasClicked) ? coordinateX-182 + 'px': coordinateX + 'px';
          $contextMenu.style.top = coordinateY + 'px';
          console.log('Final :: coordinate X: ' + coordinateX + ' & coordinate Y: '+ coordinateY);
      },
      excSelected(flag) {
        /*
        * Flag:
        * PG:  Project Group
        * RPG: Root Project Group
        * SPG: Selected Project Group
        * PR:  Project
        * RPR: Root Project
        * SPR: Selected Project
        * SR:  Selected Project Group or Project
        *  */
        this.contextTopMenuIsVisible =false;
        this.contextMenuIsVisible = false;
        const treeV = this.$refs.slVueTree
        const msg = {};
        const params = {
          tree: treeV
        };
        if(flag === 'PG'){
          msg['title'] = 'Create a Project Group';
          msg['content'] = 'Do you want to create a root Project Group?';
          params['flag'] = 'PG'
          this.procSelected('edited',params, msg);
        }else if(flag === 'PR'){
          msg['title'] = 'Create a Project';
          msg['content'] =  'Do you want to create a root Project?';
          params['flag'] = 'PR'
          this.procSelected('edited',params, msg);
        }else if(flag === 'SR'){
          params['flag'] = 'SR'
          let msgTitle = params.tree.getSelected()[0].isLeaf ? 'Edit a Project' : 'Edit a Project Group';
          msg['title'] = msgTitle;
          this.procSelected('edited',params, msg);
        }else{
            this.deleteSelected(params.tree);
        }
      },
      procSelected(emitMethodName,prams,msg){
        if(['PG','PR'].includes(prams.flag)){
          this.$alertify.confirmWithTitle(
            msg.title,
            msg.content,
            () =>{
              prams['flag'] ='R' + prams['flag'];
              this.$emit(emitMethodName, prams)
            },
            () =>{
              prams['flag'] ='S' + prams['flag'];
              this.$emit(emitMethodName, prams)
            }
          );
        }else{
          this.$emit(emitMethodName, prams)
        }
      },
      deleteSelected(treeV){
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
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/css/sl-vue-tree-ecessntial.css';

  .conmenu-leaf {
    border-bottom: #181b1e;
  }

  .contextmenutop {
    position: relative;
    background-color: #fff;
    color: #23282c;
    border: 1px solid #c8ced3;
    border-color: #20a8d8;
    border-radius: 0.25rem;
    cursor: pointer;
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

  .contextmenutop > div {
    padding: 10px;
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

  .ellipsis i{
    visibility:hidden;
  }
  .ellipsis:hover i {
    visibility:visible;
  }
</style>
