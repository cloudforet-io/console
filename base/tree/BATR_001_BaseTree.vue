<template>
  <div>
    <div class="row no-gutters" @click="contextMenuIsVisible=false">
      <transition name="tree-trans"
                  @before-enter="beforeEnter"
                  @enter="enter"
      >
        <div v-if="showTree">
          <!-- class="col-xs-6 col-sm-6 col-md-6 col-lg-2 main-tree-col" -->
          <BaseDragVertical>
            <template #container="{ width }">
              <sl-vue-tree ref="slVueTree"
                           v-model="treeData"
                           class="main-tree-col"
                           :allow-multiselect="true"
                           :style="{ width: `${width}px` }"
                           @select="nodeSelected"
                           @drop="nodeDropped"
                           @nodecontextmenu="showContextMenu"
              >
                <template slot="title" slot-scope="{ node }">
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

                <template slot="toggle" slot-scope="{ node }">
                  <i v-if="node.isExpanded" class="fal fa-angle-down" />
                  <i v-else class="fal fa-angle-right" />
                </template>

              <!-- <template slot="sidebar" slot-scope="{ node }">
              <span class="ellipsis" @click.stop.prevent="showContext($event, node)">
                <i class="fal fa-ellipsis-v-alt" />
              </span>
            </template> -->
              </sl-vue-tree>
            </template>
          </BaseDragVertical>
        </div>
      </transition>

      <div v-show="contextMenuIsVisible" ref="contextmenu" class="contextmenu">
        <div class="contextmenuleaf" @click="excSelected('PG')">
          <i class="fal fa-folder-minus" />&nbsp; Add a Project Group
        </div>
        <div class="contextmenuleaf" @click="excSelected('PR')">
          <i class="fal fa-cube" />&nbsp; Add a Project
        </div>
        <div class="contextmenuleaf" @click="excSelected('SR')">
          <i class="fal fa-pencil" />&nbsp; Edit Selected Project
        </div>
        <div class="node-leaf-last" @click="excSelected">
          <i class="fal fa-trash" />&nbsp; Remove Selected Item
        </div>
      </div>
      <transition name="panel-trans">
        <div v-if="hasSelected" :key="nodeKey"
             class="panel col-xs-6 offset-xs-6 col-lg-10 offset-lg-2"
        >
          <slot name="treeSubPanel" />
        </div>
      </transition>
    </div>
  </div>
</template>
    
  </div>
</template>

<script>
import BaseDragVertical from '@/components/base/drag/BADG_002_BaseDragVertical.vue';
import SlVueTree from 'sl-vue-tree';

export default {
    name: 'BaseTree',
    components: {
        BaseDragVertical,
        SlVueTree
    },
    props: {
        treeProp: {
            type: Array,
            default: () => []
        },
        treeWidth: {
            type: Number,
            default: 250
        }
    },
    data () {
        return {
      /*
         *  nodeKey is a key to reload any component that has node selected at treeSubPanel
         */
            nodeKey: 0,
            contexteActionFlag: null,
            treeData: this.treeProp,
            hasSelected: false,
            lastEvent: null,
            contextMenuIsVisible: false,
            contextTopMenuIsVisible: false,
            showTree: false
        };
    },
    mounted: function () {
        this.showTree = true;
        window.slVueTree = this.$refs.slVueTree;
    },
    methods: {
        nodeSelected (nodes, event) {
            this.nodeKey = (this.nodeKey) > 0 ? 0 : 1;
            this.lastEvent = nodes;
            this.hasSelected = true;
      /*
         * This is a Emit event for Parents vue.
         */
            this.$emit('selected', nodes);
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
            $contextMenu.style.left = (hasClicked) ? coordinateX - 182 + 'px' : coordinateX + 'px';
            $contextMenu.style.top = coordinateY + 'px';
            console.log('Final :: coordinate X: ' + coordinateX + ' & coordinate Y: ' + coordinateY);
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
            const treeV = this.$refs.slVueTree;
            const msg = {};
            const params = {
                tree: treeV
            };
        // TODO:: Please, Change to Enum in Vue, and add all those MSG into i18n en.json & ko.json
            if (flag === 'PG') {
                msg['title'] = 'Create a Project Group';
                msg['content'] = 'Do you want to create a root Project Group?';
                params['flag'] = 'PG';
                this.procSelected('edited', params, msg);
            } else if (flag === 'PR') {
                msg['title'] = 'Create a Project';
                msg['content'] = 'Do you want to create a root Project?';
                params['flag'] = 'PR';
                this.procSelected('edited', params, msg);
            } else if (flag === 'SR') {
                params['flag'] = 'SR';
                let msgTitle = params.tree.getSelected()[0].isLeaf ? 'Edit a Project' : 'Edit a Project Group';
                msg['title'] = msgTitle;
                this.procSelected('edited', params, msg);
            } else {
                this.deleteSelected(params.tree);
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
        beforeEnter (el, done) {
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
            // el.style.transition = 'all .4s ease-in-out';
            done();


            // el.style.transform = `translateX(-${this.treeWidth})`;
            // el.style.opacity = 0;
            // debugger;
            // done();
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
    padding: $top-pad $side-pad $bottom-pad $side-pad;
  }

</style>
