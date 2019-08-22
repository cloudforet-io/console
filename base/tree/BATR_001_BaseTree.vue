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
            :line="false" 
            :total-width="'100vw'"
            :height="dragHeight"
          >
            <template #leftContainer="{ width }">
              <div>
                <sl-vue-tree ref="slVueTree"
                             v-model="selectedTreeProp"
                             style="width:400px"
                             class="main-tree-col"
                             :allow-multiselect="true"
                             :style="{ width: width }"
                             @select="nodeSelected"
                             @drop="nodeDropped"
                             @toggle="nodeToggled"
                             @nodecontextmenu="showContextMenu"
                >
                  <template #title="{ node }">
                    <span class="item-title">
                      <span class="item-icon">
                        <i v-if="node.isLeaf" class="fal fa-cube" />
                        <template v-else>
                          <i v-if="node.isExpanded" class="fal fa-folder-open" />
                          <i v-else class="fal fa-folder-minus" />
                        </template>
                      </span>
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
                     :key="nodeKey"
                     class="panel"
                     :style="{ width: width }"
                >
                  <slot name="treeSubPanel" />
                </div>
              </transition>
            </template>
          </BaseDragVertical>

          <div v-show="contextMenuIsVisible"
               ref="contextmenu"
               class="contextmenu"
          >
            <div v-if="contextIndividualVisible[0]"
                 class="contextmenuleaf"
                 @click="excSelected('NG')"
            >
              <i class="fal fa-folder-minus" />&nbsp; Add a Project Group
            </div>

              <div v-if="contextIndividualVisible[1]"
                   class="contextmenuleaf"
                   @click="excSelected('ND')"
              >
                <i class="fal fa-cube" />&nbsp; Add a Project
              </div>
              <div v-if="contextIndividualVisible[2]"
                   class="contextmenuleaf"
                   @click="excSelected('SN')"
              >
                <i class="fal fa-pencil" />&nbsp; Edit Selected Project
              </div>

              <div v-if="contextIndividualVisible[3]"
                   class="node-leaf-last"
                   @click="excSelected"
              >
                <i class="fal fa-trash" />&nbsp; Remove Selected Item
              </div>
          </div>
        </div>
      </transition>
    </div>

    <BaseModal ref="checkModal"
               :use-custom-msg="true"
               :title="modalTitle"
               :text="modalContents"
               :type="'primary'"
               size="md"
               :custom-yes-or-no-msg="customBtn"
               @ok="modalOk"
               @cancel="modalCancel"
    />
  </div>
</template>


<script>
import BaseDragVertical from '@/components/base/drag/BADG_001_BaseDragX.vue';
import SlVueTree from 'sl-vue-tree';
const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal');
import { mapGetters } from 'vuex';
//@click="getNextLayer"
export default {
    name: 'BaseTree',
    components: {
        BaseDragVertical,
        SlVueTree,
        BaseModal
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
        }
    },
    data () {
        return {
            customBtn: { NO: 'No', YES: 'Yes' },
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
            contextIndividualVisible: [true, true, true, true]
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
    },
    mounted() {
        this.showTree = true;
    },
    methods: {
        nodeSelected (nodes) {
            this.nodeKey = (this.nodeKey) > 0 ? 0 : 1;
            this.lastEvent = nodes;
            this.hasSelected = true;
            /*
            * This is a Emit event for Parents vue.
            */
            // this.$emit('selected', nodes);
            /*
            * This is a Global Event bus, so Please, make sure that Event$bus is off when components has destroyed.
            */
            this.$bus.$emit('treeSelectedEvent', nodes);
        },
        nodeToggled (node) {
            if (!node.isExpanded ) {
                if (!node.data.is_cached){
                    this.$emit('toggled', { node: node, treeV:this.$refs.slVueTree });
                }
            }
        },
        nodeDropped (nodes, position) {
            this.$emit('dropped', {
                nodes: nodes,
                position: position,
                treeV:this.$refs.slVueTree
            })
            console.log( `Nodes: ${nodes.map(node => node.title).join(', ')} are dropped ${position.placement} ${position.node.title}`);
        },

        showContextMenu (node, event, hasClicked) {
            if (!hasClicked) {
                event.preventDefault();
            }
            if (!this.isEmpty(this._.get(node,'data.init'))){
                this.contextIndividualVisible =  [true, false, false, false];
            } else if(node.isLeaf){
                this.contextIndividualVisible =  [false, false, true, true];
            } else {
                this.contextIndividualVisible =  [true, true, true, true];
            }

            this.contextMenuIsVisible = true;
            const $contextMenu = this.$refs.contextmenu;
            let coordinateX = event.clientX;
            let coordinateY = event.clientY;
            this.$refs.slVueTree.select(node.path);
            $contextMenu.style.left = (hasClicked) ? `${coordinateX - 128}px` : `${coordinateX}px`;
            $contextMenu.style.top = `${coordinateY - this.headerHeight}px`;
        },
        excSelected (flag) {
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
            this.contextMenuIsVisible = false;
            this.modalContext = {
                tree: this.$refs.slVueTree
            };

            const treeV = this.$refs.slVueTree;

            switch (flag) {
            case 'NG'://Node Group
                this.modalTitle = 'Create a Project Group';
                this.modalContents = 'Do you want to create a root Project Group?';
                this.modalContext['flag'] = 'NG';
                this.modalEvent = 'edited';
                //In case of No Node is available for Trees which means Init Node to Create first Node Group.
                if (this.isEmpty(this._.get(treeV.getSelected()[0],'data.init'))){
                    this.$refs.checkModal.showModal();
                } else {
                    this.modalOk ();
                }
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
            default:
                this.modalTitle = 'Delete a Project';
                this.modalContents = 'Selected item has a nested items underneath, Do you want to delete it?';
                this.modalContext['flag'] = 'D';
                if (this.modalContext.tree.getSelected()[0].children.length > 0) {
                    this.$refs.checkModal.showModal();
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
        displayContextByType(){
            debugger
            return false;
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

</style>
