<template>
  <div>
    <div class="row no-gutters" @click="contextMenuIsVisible=false">
      <transition name="tree-trans"
                  appear
                  @before-enter="beforeEnter"
                  @enter="enter"
      >
        <div v-if="showTree">
          <BaseDragVertical 
            :total-width="'100vw'"
            :left-width="getLeftTreeWidth"
            :height="dragHeight"
          >
            <template #leftContainer="{ width }">
              <div @click.right="isBackPanelHasClciked">
                <sl-vue-tree ref="slVueTree"
                             v-model="selectedTreeProp"
                             class="main-tree-col"
                             :allow-multiselect="true"
                             :style="{ width: width }"
                             @nodeclick="nodeClicked"
                             @beforedrop="beforeNodeDropped"
                             @drop="nodeDropped"
                             @toggle="nodeToggled"
                             @nodecontextmenu="showContextMenu"
                >
                  <template #title="{ node }">
                    <span v-if="node.data.init" class="fas fa-exclamation-triangle" />
                    <span v-else class="item-icon">
                      <i v-if="node.isLeaf" class="fas fa-cube" />
                      <i v-else-if="node.isExpanded" class="fal fa-folder-open" />
                      <i v-else class="fal fa-folder-minus" />
                    </span>
                    <span class="item-title">
                      {{ node.title }}
                    </span>
                  </template>
                  <template #toggle="{ node }">
                    <i v-if="node.isExpanded" class="fal fa-angle-down" />
                    <i v-else class="fal fa-angle-right" />
                  </template>
                  <!-- <template slot="sidebar" slot-scope="{ node }">
                  <span class="ellipsis" @click.stop.prevent="showContext($event, node)">
                    <i class="fal fa-ellipsis-v-alt" />
                  </span>
                </template> -->
                </sl-vue-tree>
              </div>
            </template>

            <template #rightContainer="{ width }">
              <transition name="panel-trans">
                <div v-if="hasSelected"
                     :key="getNodekeyComputed"
                     class="panel"
                     :style="{ width: width }"
                >
                  <slot name="treeSubPanel" />
                </div>
                <div v-else class="empty">
                  <span class="msg">Please, Click a item from left tree Panel.</span>
                </div>
              </transition>
            </template>
          </BaseDragVertical>

          <div v-show="contextMenuIsVisible" ref="contextmenu" class="contextmenu">
            <template v-if="treeType == 'PROJECT'">
                <template v-for="(n, i) in getDataLength(conTextObj, 'Executor')">
                    <div v-if="contextIndividualVisible[i]" @click="contextExecutor(conTextObj.Executor[i])">
                      <i :class="conTextObj.icons[i]" />    &nbsp;{{tr(conTextObj.Msg[i][0],[tr(conTextObj.Msg[i][1])])}}
                    </div>
                </template>
            </template>
          </div>
        </div>
      </transition>
    </div>

    <BaseModal ref="BATR001_checkModal"
               :use-custom-msg="true"
               :title="modalTitle"
               :text="modalContents"
               :type="'primary'"
               size="md"
               :custom-yes-or-no-msg="customBtn"
               @ok="modalOk"
               @cancel="modalCancel"
    />

    <BaseSimpleModal ref="BATR001_treeAlertNotice" 
                     :title="tr('MODAL_TITLE.NOT_ALLOW')"
                     :text="noticePanelMsg"
    />
  </div>
</template>
<script>
import SlVueTree from 'sl-vue-tree';
import BaseDragVertical from '@/components/base/drag/BADG_001_BaseDragVertical';
import BaseSimpleModal from '@/components/base/modal/BAMO_002_BaseSimpleModal';
import BaseModal from '@/components/base/modal/BAMO_001_BaseModal';
import { GlobalEnum } from '@/setup/enum';
import { mapGetters } from 'vuex';
export default {
    name: 'BaseTree',
    components: {
        BaseDragVertical,
        SlVueTree,
        BaseModal,
        BaseSimpleModal
    },
    props: {
        treeProp: {
            type: Array,
            default: () => []
        },
        contextInit: {
            type: Boolean,
            default: false
        },
        treeWidth: {
            type: Number,
            default: 250
        },
        conTextObj: {
            type: Object,
            default: () => {},
            required: true
        },
        treeType: {
            type: String,
            default: 'TREE',
            required: true
        }
    },
    data () {
        return {
            currentType: null,
            customBtn: { NO: 'No', YES: 'Yes' },
            selectedLeftWidth: 300,
            nodeKey: 0,
            treeData: null,
            hasSelected: false,
            lastEvent: null,
            contextMenuIsVisible: false,
            showTree: false,
            modalTitle: '',
            modalContents: '',
            modalContext: {},
            modalEvent: '',
            contextIndividualVisible: this.conTextObj.ContextVisible,
            noticePanelMsg: '',
            clickedNode: null
        };
    },
    computed: {
        ...mapGetters('layout', [
            'headerHeight'
        ]),
        dragHeight() {
            return self.innerHeight - this.headerHeight;
        },
        selectedTreeProp:  {
            get:  function() {
                let returnVal = this.treeProp;
                if (this.isEmpty(returnVal)){
                    returnVal = [{ title: '!Please, Right Click me',
                        isLeaf: true,
                        init: true }];
                }
                return returnVal;
            },
            set: function (value) {
                this.treeData = value;
            }
        },
        getNodekeyComputed(){
            return this.nodeKey;
        },
        getLeftTreeWidth()  {
            const keyName = this.$parent.$options.name + '_treeWidth';
            return localStorage.hasOwnProperty(keyName) ? parseInt(localStorage[keyName]) : this.selectedLeftWidth;
        }
    },
    mounted() {
        this.showTree = true;
        this.currentType = this.treeType;
    },
    methods: {
        getDataLength(objOrArr, key){
            return this.isEmpty(key) ? objOrArr.length : objOrArr[key].length;
        },
        isBackPanelHasClciked(e) {
            if (!this.contextMenuIsVisible){
                const treeV = this.$refs.slVueTree;
                let selectedNode = treeV.getSelected();
                if (this.isEmpty(selectedNode)){
                    const lastNode = treeV.getLastNode();
                    console.log(lastNode);
                    treeV.select(lastNode.path, { addToSelection: false });
                    selectedNode = treeV.getSelected()[0];
                } else {
                    selectedNode = selectedNode[0];
                }
                selectedNode.data['back_panel_click'] = true;
                this.showContextMenu(selectedNode, e);
            }

        },
        nodeClicked (node) {
            if (this.clickedNode) {
                this.removeClickedClass(this.clickedNode);
            }
            this.clickedNode = node;
            this.addClickedClass(node);
            
            if (!node.data.hasOwnProperty('init')) {
                this.nodeKey = (this.nodeKey !== node.data.id) ? node.data.id : this.nodeKey;
                this.hasSelected = true;
                this.$emit('selected', { node: node, treeV: this.$refs.slVueTree });
            } else {
                this.hasSelected = false;
            }
        },
        nodeToggled (node) {
            if (!node.isExpanded ) {
                this.setClickedNodeItem(node);
                if (!node.data.is_cached){
                    this.$emit('toggled', { node: node, treeV: this.$refs.slVueTree });
                }
            }
        },
        setClickedNodeItem (node) {
            let hasNoClickedItem = false;
            if (this.clickedNode) {
                hasNoClickedItem = node.path.some((path, i) => {
                    return path !== this.clickedNode.path[i];
                });
            } else {
                hasNoClickedItem = true;
            }

            if (!hasNoClickedItem) {
                let addClassInterval = setInterval(() => {
                    if (this.addClickedClass(this.clickedNode)) {
                        clearInterval(addClassInterval);
                    }
                }, 10);
            }
        },
        getNodeEl (node) {
            return this.$refs.slVueTree.$el.querySelector(`[path="${node.pathStr}"]`);
        },
        addClickedClass (node) {
            let elem = this.getNodeEl(node);
            if (elem) {
                elem.classList.add('sl-vue-node-clicked');
                return true;
            }
            return false;
        },
        removeClickedClass (node) {
            let elem = this.getNodeEl(node);
            if (elem) {
                elem.classList.remove('sl-vue-node-clicked');
            }
        },
        showContextMenu (node, event, hasClicked) {
            if (!hasClicked) {
                event.preventDefault();
            }
            if (!this.isEmpty(this._.get(node,'data.init')) || this._.get(node,'data.back_panel_click')){
                this.contextIndividualVisible =  [true, false, false, false, false];
                delete node.data.back_panel_click;
            } else if (node.isLeaf){
                this.contextIndividualVisible =  [false, false, false, true, true];
            } else {
                this.contextIndividualVisible =  [false, true, true, true, true];
            }

            this.contextMenuIsVisible = true;
            const $contextMenu = this.$refs.contextmenu;
            let coordinateX = event.clientX;
            let coordinateY = event.clientY;
            this.$refs.slVueTree.select(node.path);
            $contextMenu.style.left = (hasClicked) ? `${coordinateX - 128}px` : `${coordinateX}px`;
            $contextMenu.style.top = `${coordinateY - this.headerHeight}px`;
        },
        contextExecutor (flag, exData) {
            /*********************
           * Flag:
           * NG:  Node Group
           * RNG: Root Node Group
           * SNG: Selected Node Group
           *-------------------------
           * ND:  Node
           * RND: Root Node
           * SND: Selected Node
           *-------------------------
           * SN:  Selected Node Group or Node
           ***********************/
            const treeV = this.$refs.slVueTree;
            this.contextMenuIsVisible = false;
            this.modalContext = {
                tree: treeV
            };

            switch (flag) {
            case 'RG'://Node Group
                this.modalTitle = 'Create a Project Group';
                this.modalContents = 'Do you want to create a root Project Group?';
                this.modalContext['flag'] = 'NG';
                this.modalEvent = 'edited';
                this.modalOk ();
                break;
            case 'NG'://Node Group
                this.modalTitle = 'Create a Project Group';
                this.modalContents = 'Do you want to create a root Project Group?';
                this.modalContext['flag'] = 'NG';
                this.modalEvent = 'edited';
                //In case of No Node is available for Trees which means Init Node to Create first Node Group.
                this.modalCancel ();
                break;
            case 'ND'://Node
                this.modalTitle = 'Create a Project';
                this.modalContents = 'Do you want to create a root Project?';
                this.modalContext['flag'] = 'ND';
                this.modalEvent = 'edited';
                this.modalCancel ();
                break;
            case 'SN'://Selected Node Group or Node
                this.modalContext['flag'] = 'SN';
                this.modalTitle = this.modalContext.tree.getSelected()[0].isLeaf ? 'Edit a Project' : 'Edit a Project Group';
                this.modalContents = 'Do you want to create a root Project';
                this.modalContents += this.modalContext.tree.getSelected()[0].isLeaf ? '?' : ' Group?';
                this.modalEvent = 'edited';
                this.modalOk ();
                break;
            case 'MV':
                this.modalContext['flag'] = 'MV';
                this.modalContext['dropData'] = exData;
                this.modalEvent = 'dropped';
                this.modalOk ();
                break;
            default:
                this.modalTitle = 'Delete a Project';
                this.modalContents = 'Selected item has a nested items underneath, Do you want to delete it?';
                this.modalContext['flag'] = 'D';
                if (this.modalContext.tree.getSelected()[0].children.length > 0) {
                    this.$refs.BATR001_checkModal.showModal();
                } else {
                    this.deleteSelected(this.modalContext.tree);
                }
                break;
            }
        },
        modalOk () {
            if (['NG', 'ND'].includes(this.modalContext.flag)) {
                this.modalContext['flag'] = 'R' + this.modalContext['flag'];
                this.$emit(this.modalEvent, this.modalContext);
            } else if (this.modalContext.flag === 'D') {
                this.deleteSelected(this.modalContext.tree);
            } else {
                this.$emit(this.modalEvent, this.modalContext);
            }
        },
        modalCancel () {
            this.modalContext['flag'] = 'S' + this.modalContext['flag'];
            if (!this.modalContext.tree.getSelected()[0].isLeaf) {
                this.$emit(this.modalEvent, this.modalContext);
            } else if (this.modalContext.flag === 'D') {
                this.$alertify.error('Cancel');
            } else {
                this.$notify({
                    group: 'auth',
                    type: 'warn',
                    title: 'Not Allowed Action',
                    text: 'Can not Add any Project or Project Group to <b> project </b>. \n Please, Build a Project Group first.',
                    duration: 10000,
                    speed: 500
                });
            }
        },
        doTheyShareSameParent(fromNode, toNode){
            let isNeedToProcessOnSC = false;
            if (!toNode.node.data.is_cached) {
                let sourceNode_path = JSON.parse(JSON.stringify(fromNode[0].path));
                let toNode_path = JSON.parse(JSON.stringify(toNode.node.path));
                if (sourceNode_path.length === toNode_path.length){
                    sourceNode_path.pop();
                    toNode_path.pop();
                    if (JSON.stringify(sourceNode_path) === JSON.stringify(toNode_path)){
                        isNeedToProcessOnSC = true;
                    }
                }
            }
            return isNeedToProcessOnSC;
        },
        beforeNodeDropped (node, position, cancel) {
            let trStringKey = 'TREE_TYPE';
            const srcNode = node[0];
            const srcNodeDT = srcNode.data;
            const targetNodeDT = position.node.data;
            if (srcNodeDT.group === 'PROJECT'){
                if (position.node.path.length  == 1 && position.placement !== 'inside' && srcNodeDT.item_type === 'PROJECT'){
                    cancel(true);
                    this.noticePanelMsg = this.tr('MODAL_MSG.LEAF_NOMOVE',[this.tr(`${trStringKey}.${srcNodeDT.item_type}`)]);
                    this.$refs.BATR001_treeAlertNotice.showModal();
                    return;
                }
                const acceptable = GlobalEnum['TREE'][targetNodeDT.group][targetNodeDT.item_type].accept;
                if (!acceptable.includes(srcNodeDT.item_type)){
                    cancel(true);
                    this.noticePanelMsg = this.tr('MODAL_MSG.LEAF_PUSHTO',[this.tr(`${trStringKey}.${srcNodeDT.item_type}`), this.tr(`${trStringKey}.${targetNodeDT.item_type}`)]);
                    this.$refs.BATR001_treeAlertNotice.showModal();
                    return;
                }
            } else if (srcNodeDT.group === 'DATA_CENTER'){

            }

            const treeV = this.$refs.slVueTree;
            const shareParam = this.doTheyShareSameParent(node, position);
            const isCanceled = shareParam ? true: false;

            if (!position.node.data.is_cached) {
                treeV.remove(treeV.getSelected().map(node => node.path));
                cancel(true);
            }

            this.$emit('noCacheDrop', {
                nodes: node,
                position: position,
                treeV: this.$refs.slVueTree,
                cancel: cancel,
                isCanceled: isCanceled
            });

            if (this.doTheyShareSameParent(node, position)) {
                return;
            }
        },
        nodeDropped (node, position, cancel) {
            /*if (this.doTheyShareSameParent(node, position)) {
                const treeV = this.$refs.slVueTree;
                this.$emit('afterDrop', { node: position.node, treeV:treeV , cancel: cancel });
            }*/

        },
        deleteSelected(tree){
            const prams = {
                path: tree.getSelected().map(node => node.path),
                tree: tree
            };
            this.$emit('delete', prams);
        },
        beforeEnter (el) {
            this.$velocity(el, {
                translateX: `-${this.treeWidth}px`,
                opacity: 0
            });
        },
        enter (el, done) {
            this.$velocity(el, 
                { 
                    translateX: '0px',
                    opacity: 1 
                }, 
                { 
                    duration: 400, 
                    complete () {
                        done(); 
                    } 
                }
            );
            done();
        }
    }
};
</script>

<style lang="scss" scoped>
  .panel-trans-enter-active {
    transition: all .4s ease-in-out;
  }
  .panel-trans-enter {
    opacity: 0;
  }

  $main-height: calc(100vh - #{$header-height} - 30px);

  .main-tree-col {
    @extend %sheet;
    border-radius: 0;
    padding: 15px 8px;
    background-color: $white;
    height: $main-height;
    overflow: scroll;
    .leaf-space {
        display: inline-block;
        width: 20px;
    }
    .item-icon {
        display: inline-block;
        text-align: center;
        width: 20px;
    }
    .ellipsis {
        padding: 0px 3px 0px 10px;
        cursor: pointer;
    }
  }


  .contextmenu {
    position: absolute;
    background-color: $navy;
    color: $lightgray;
    cursor: pointer;
    z-index: 99999;
    border-radius: 5px;
    box-shadow: 0 0 4px 0 rgba($black, 0.4);
    > div {
      padding: 6px 10px;
      margin: 5px;
      border-radius: 5px;
      &:hover {
        background-color: rgba($whiteblue, 0.15);
      }
    }
  }

  .panel {
    padding: 50px $side-pad $bottom-pad $side-pad;
  }
  .empty {
    text-align: left;
    margin-top: 20px;
    .msg {
      color: $darkgray;
      font-size: 1.3rem;
      font-weight: 600;
    }

  }
</style>
