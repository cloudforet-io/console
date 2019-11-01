<template>
    <div>
        <div class="row no-gutters"  @click="contextMenuIsVisible=false">
            <transition name="tree-trans" appear @before-enter="beforeEnter" @enter="enter">
                <div>
                    <BaseDragVertical :total-width="'100vw'" :left-width="getLeftTreeWidth" :height="dragHeight">
                        <template #leftContainer="{ width }">
                            <div  v-show="showTree"
                                  @click.right="isRootClicked">
                                <PTree ref="primeTree" :tree-data="treeData" :initial-tree-width="width"
                                       @nodeClick="nodeClicked"
                                       @beforeDrop="beforeDropped"
                                       @nodeToggle="nodeToggled"
                                       @nodeContextMenu="showContextMenu">
                                    <template slot="icon" slot-scope="node">
                                        <slot name="icon" v-bind="node"/>
                                    </template>
                                </PTree>
                            </div>
                        </template>
                        <template #rightContainer="{ width }">
                            <transition name="panel-trans">
                                <div v-if="hasSelected" :key="getNodekeyComputed" class="panel" :style="{ width: width }">
                                    <slot name="treeSubPanel" />
                                </div>
                                <div v-else class="empty">
                                    <span class="msg"> {{tr('ORGANISMS.CLICK_RIGHT')}} </span>
                                </div>
                            </transition>
                        </template>
                    </BaseDragVertical>

                    <div v-show="contextMenuIsVisible" ref="contextmenu" class="contextmenu">
                        <slot name="contextMenu" />
                    </div>

                </div>
            </transition>
        </div>
        <slot
            v-if="useModalInAction"
            name="modal"
        />
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import PTree from '@/components/molecules/tree/Tree';
import BaseDragVertical from '@/components/base/drag/BaseDragVertical';


export default {
    name: 'DefaultTree',
    components: {
        BaseDragVertical,
        PTree,
    },
    mixins: [PTree],
    props: {
        showTree: {
            type: Boolean,
            default: false,
        },
        useDefaultContext: {
            type: Boolean,
            default: false,
        },
        useDefaultContextMSG: {
            type: Boolean,
            default: false,
        },
        privateContextMSG: {
            type: Array,
            default: () => [],
        },
        useMultiSelect: {
            type: Boolean,
            default: false,
        },
        useModalInAction: {
            type: Boolean,
            default: true,
        },
        treeWidth: {
            type: Number,
            default: 250,
        },

    },
    data() {
        return {
            selectedLeftWidth: 300,
            nodeKey: 0,
            hasSelected: false,
            contextMenuIsVisible: false,
            noticePanelMsg: '',
            clickedNode: null,
        };
    },
    computed: {
        ...mapGetters('layout', [
            'headerHeight',
        ]),
        dragHeight() {
            return self.innerHeight - this.headerHeight;
        },
        getNodekeyComputed() {
            return this.nodeKey;
        },
        getLeftTreeWidth() {
            const keyName = `${this.$parent.$options.name}_treeWidth`;
            return localStorage.hasOwnProperty(keyName) ? parseInt(localStorage[keyName]) : this.selectedLeftWidth;
        },
    },
    methods: {
        getTree() {
            return this.$refs.primeTree.$refs.slVueTree;
        },
        getNodeEl(node) {
            return this.$refs.primeTree.$refs.slVueTree.$el.querySelector(`[path="${node.pathStr}"]`);
        },
        isRootClicked(e) {
            const actionObj = {
                tree: this.getTree(),
                menuVisible: this.contextMenuIsVisible,
                event: e,
            };
            this.$emit('DTisRootClicked', actionObj);
        },
        nodeClicked(node) {
            this.$emit('DTNodeClicked', node, this.getTree());
        },
        nodeToggled(node) {
            this.$emit('DTNodeToggled',node, this.getTree());
        },
        beforeDropped(node, position, cancel){
            this.$emit('DTBeforeDropped', node, position, cancel, this.getTree());
        },
        showContextMenu(node, event, hasClicked) {
            this.$emit('DTContextVisible', node, event, hasClicked, this.getTree());
        },
        removeClickedClass(node) {
            const elem = this.getNodeEl(node);
            if (elem) {
                elem.classList.remove('sl-vue-node-clicked');
            }
        },
        beforeEnter(el) {
            this.$velocity(el, {
                translateX: `-${this.treeWidth}px`,
                opacity: 0,
            });
        },
        enter(el, done) {
            this.$velocity(el, { translateX: '0px', opacity: 1 },
                {
                    duration: 400,
                    complete() {
                        done();
                    },
                });
            done();
        },
    },
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
