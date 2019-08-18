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
              <div :key="treeKey">
                <sl-vue-tree ref="slVueTree"
                             v-model="selectedTreeProp"
                             style="width:400px"
                             class="main-tree-col"
                             :allow-multiselect="true"
                             :style="{ width: width }"
                             @select="nodeSelected"
                             @drop="nodeDropped"
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
            <div class="contextmenuleaf"
                 @click="excSelected('PG')"
            >
              <i class="fal fa-folder-minus" />&nbsp; Add a Project Group
            </div>
            <div class="contextmenuleaf"
                 @click="excSelected('PR')"
            >
              <i class="fal fa-cube" />&nbsp; Add a Project
            </div>
            <div v-show="selectedContexProp"
                 class="contextmenuleaf"
                 @click="excSelected('SR')"
            >
              <i class="fal fa-pencil" />&nbsp; Edit Selected Project
            </div>

            <div v-show="selectedContexProp"
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
               :title="modalTitle"
               :text="modalContents"
               size="md"
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
            /**
             *  nodeKey is a key to reload any component that has node selected at treeSubPanel
             */
            treeKey: 0,
            nodeKey: 0,
            treeData: null,
            contexteActionFlag: null,
            hasSelected: false,
            lastEvent: null,
            contextMenuIsVisible: false,
            contextTopMenuIsVisible: true,
            showTree: false,
            modalTitle: '',
            modalContents: '',
            modalContext: {},
            modalEvent: ''
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
        selectedContexProp () {
            return this.contextInit;
        }
    },
    mounted() {
        if (!this.treeKey){
            this.treeKey = 1;
            console.log(this.treeKey);
        }
        console.log('#############', this.contextInit);
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
            this.lastEvent = `Node ${node.title} is ${node.isExpanded ? 'expanded' : 'collapsed'}`;
        },
        nodeDropped (nodes, position) {
            this.lastEvent = `Nodes: ${nodes.map(node => node.title).join(', ')} are dropped ${position.placement} ${position.node.title}`;
        },
        showContext (event, node) {
            this.showContextMenu(node, event, 'Clicked');
        },

        showContextMenu (node, event, hasClicked) {
            if (!hasClicked) {
                event.preventDefault();
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
      /*
        * Flag:
        * PG:  Project Group
        * -----------------------
        * RPG: Root Project Group
        * SPG: Selected Project Group
        * PR:  Project
        * -----------------------
        * RPR: Root Project
        * SPR: Selected Project
        * SR:  Selected Project Group or Project
        *  */
            this.contextTopMenuIsVisible = false;
            this.contextMenuIsVisible = false;
            this.modalContext = {
                tree: this.$refs.slVueTree
            };
            const treeV = this.$refs.slVueTree;
            const msg = {};
            const params = {
                tree: treeV
            };

        // TODO:: Please, Change to Enum in Vue, and add all those MSG into i18n en.json & ko.json

            switch (flag) {
            case 'PG':
                this.modalTitle = 'Create a Project Group';
                this.modalContents = 'Do you want to create a root Project Group?';
                this.modalContext['flag'] = 'PG';
                this.modalEvent = 'edited';
                this.$refs.checkModal.showModal();
                break;
            case 'PR':
                this.modalTitle = 'Create a Project';
                this.modalContents = 'Do you want to create a root Project?';
                this.modalContext['flag'] = 'PR';
                this.modalEvent = 'edited';
                this.$refs.checkModal.showModal();

                // msg['title'] = 'Create a Project';
                // msg['content'] = 'Do you want to create a root Project?';
                // params['flag'] = 'PR';
                // this.procSelected('edited', params, msg);
                break;
            case 'SR':
                this.modalContext['flag'] = 'SR';
                this.modalTitle = this.modalContext.tree.getSelected()[0].isLeaf ? 'Edit a Project' : 'Edit a Project Group';
                this.modalContents = 'Do you want to create a root Project';
                this.modalContents += this.modalContext.tree.getSelected()[0].isLeaf ? '?' : ' Group?';
                this.modalEvent = 'edited';
                this.$refs.checkModal.showModal();
  
                // params['flag'] = 'SR';
                // msg['title'] = params.tree.getSelected()[0].isLeaf ? 'Edit a Project' : 'Edit a Project Group';
                // this.procSelected('edited', params, msg);
                break;
            default:
                this.modalTitle = 'Delete a Project';
                this.modalContents = 'Selected item has a nested items underneath, Do you want to delete it?';
                this.modalContext['flag'] = 'D';
                if (this.modalContext.tree.getSelected()[0].children.length > 0) {
                    this.$refs.checkModal.showModal();
                } else {
                    const path = this.modalContext.tree.getSelected().map(node => node.path);
                    this.modalContext.tree.remove(path);
                }
                
                // this.deleteSelected(params.tree);
                break;
            }
        },
        modalOk () {
            if (['PG', 'PR'].includes(this.modalContext.flag)) {
                this.modalContext['flag'] = 'R' + this.modalContext['flag'];
                this.$emit(this.modalEvent, this.modalContext);
            } else if (this.modalContext.flag === 'D') {
                const path = this.modalContext.tree.getSelected().map(node => node.path);
                this.modalContext.tree.remove(path);
                this.$alertify.success('Okay');
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
        procSelected (emitMethodName, prams, msg) {
            if (['PG', 'PR'].includes(prams.flag)) {
                this.$alertify.confirmWithTitle(
                    msg.title,
                    msg.content,
                    () => {
                        prams['flag'] = 'R' + prams['flag'];
                        this.$emit(emitMethodName, prams);
                    },
                    () => {
                        prams['flag'] = 'S' + prams['flag'];
                        if (!prams.tree.getSelected()[0].isLeaf) {
                            this.$emit(emitMethodName, prams);
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
                    }
                );
            } else {
                this.$emit(emitMethodName, prams);
            }
        },
        deleteSelected (treeV) {
            if (treeV.getSelected()[0].children.length > 0) {
                this.$alertify.confirmWithTitle(
                    'Delete a Project',
                    'Selected item has a nested items underneath, Do you want to delete it?',
                    () => {
                        const path = treeV.getSelected().map(node => node.path);
                        treeV.remove(path);
                        this.$alertify.success('Okay');
                    },
                    () => {
                        this.$alertify.error('Cancel');
                    }
                );
            } else {
                const path = treeV.getSelected().map(node => node.path);
                treeV.remove(path);
            }
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
