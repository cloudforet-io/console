<template>
    <div>
        <div class="row no-gutters" @click="contextMenuIsVisible=false">
            <transition appear name="tree-trans"
                        @before-enter="beforeEnter"
                        @enter="enter"
            >
                <div v-if="showTree">
                    <p-vertical-layout :auto-save-left-width="true">
                        <template #leftContainer="{ width }">
                            <div id="rootPanel"
                                 @click.right.stop="isRootClicked"
                            >
                                <PTree ref="primeTree"
                                       :tree-data="treeData"
                                       :initial-tree-width="width"
                                       @nodeClick="nodeClicked"
                                       @beforeDrop="beforeDropped"
                                       @nodeToggle="nodeToggled"
                                       @nodeContextMenu="showContextMenu"
                                >
                                    <template slot="icon" slot-scope="node">
                                        <slot name="icon" v-bind="node" />
                                    </template>
                                </PTree>
                            </div>
                        </template>
                        <template #rightContainer>
                            <transition name="panel-trans">
                                <div v-if="hasSelected" :key="getNodeKeyComputed" class="panel">
                                    <slot name="treeSubPanel" />
                                </div>
                                <div v-else class="empty">
                                    <p-i :width="'14rem'" :height="'14rem'" :name="'ic_no_selected_proj'" />
                                    <div class="msg">
                                        {{ getNoSelectMSG[0] }}
                                    </div><br>
                                    <div class="dt">
                                        {{ getNoSelectMSG[1] }}
                                    </div>
                                </div>
                            </transition>
                        </template>
                    </p-vertical-layout>
                    <div v-show="contextMenuIsVisible" ref="contextmenu" class="contextmenu">
                        <slot name="context" v-bind="getCurrentNode" />
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>
<script>
import _ from 'lodash';
import {
    reactive, toRefs, computed, onMounted,
} from '@vue/composition-api';
import PTree from '@/components/molecules/tree/Tree.vue';
import PI from '@/components/atoms/icons/PI.vue';
import styles from '@/styles/_variables.scss';
import PVerticalLayout from '@/components/organisms/layouts/vertical-layout/VerticalLayout.vue';
import { Util } from '@/lib/global-util';

export default {
    name: 'AreaTree',
    components: {
        PTree,
        PVerticalLayout,
        PI,
    },
    mixins: [PTree],
    props: {
        noSelectMSG: {
            type: Array,
            default: () => [],
        },
        vueTree: {
            type: Object,
            default: () => {},
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
    setup(props, context) {
        const state = reactive({
            showContextFirst: false,
            selectedLeftWidth: 300,
            nodeKey: 0,
            hasSelected: false,
            contextMenuIsVisible: false,
            showTree: false,
            noticePanelMsg: '',
            clickedNode: null,
        });

        onMounted(() => {
            state.showTree = true;
        });

        const getTree = () => (Util.methods.isEmpty(context) ? null : _.get(context, 'refs.primeTree.$refs.slVueTree'));

        const getNoSelectMSG = computed(() => [Util.methods.tr(props.noSelectMSG[0], null, context.parent), Util.methods.tr(props.noSelectMSG[1], null, context.parent)]);
        const getNodeKeyComputed = computed(() => state.nodeKey);
        const getCurrentNode = computed(() => {
            const node = getTree();
            return Util.methods.isEmpty(node) ? null : node;
        });

        const getNodeEl = node => context.refs.primeTree.$refs.slVueTree.$el.querySelector(`[path="${node.pathStr}"]`);

        const addClickedClass = (node) => {
            const elem = getNodeEl(node);
            if (elem) {
                elem.classList.add('sl-vue-node-clicked');
                return true;
            }
            return false;
        };

        const removeAllClass = () => {
            const elem = context.refs.primeTree.$refs.slVueTree.$el.querySelectorAll('.sl-vue-tree-nodes-list .sl-vue-tree-node .sl-vue-node-clicked');
            elem.forEach((curItem) => {
                curItem.classList.remove('sl-vue-node-clicked');
            });
        };

        const removeClickedClass = (node) => {
            const elem = getNodeEl(node);
            if (elem) {
                elem.classList.remove('sl-vue-node-clicked');
            }
        };

        const preventEvent = (e, flag) => {
            if (Util.methods.isEmpty(flag)) {
                e.stopPropagation();
                e.preventDefault();
            } else {
                e.preventDefault();
            }
        };

        const showContextMenu = (node, event, hasClicked) => {
            if (event.currentTarget.id !== 'rootPanel') {
                node.data.back_panel_click = false;
            }

            if (!hasClicked) {
                event.preventDefault();
            }

            event.stopPropagation();

            if (state.contextMenuIsVisible) {
                state.contextMenuIsVisible = false;
            }
            if (!node.data.init) {
                removeAllClass(node);
                addClickedClass(node);
            }

            context.emit('DTContextVisible', node, event, hasClicked, getTree());
            state.contextMenuIsVisible = true;
            const $contextMenu = context.refs.contextmenu;
            const coordinateX = event.clientX;
            const coordinateY = event.clientY;
            getTree().select(node.path);

            $contextMenu.style.left = `${coordinateX - parseFloat(styles.gnbWidth)}px`;
            $contextMenu.style.top = `${coordinateY - parseFloat(styles.lnbHeight)}px`;
        };

        const isRootClicked = (e) => {
            preventEvent(e);
            const treeV = getTree();
            let selectedNode = treeV.getSelected();

            state.contextMenuIsVisible = false;
            if (!state.contextMenuIsVisible) {
                if (Util.methods.isEmpty(selectedNode)) {
                    const lastNode = treeV.getLastNode();
                    treeV.select(lastNode.path, { addToSelection: false });
                    selectedNode = treeV.getSelected()[0];
                } else {
                    selectedNode = selectedNode[0];
                }
                selectedNode.data.back_panel_click = true;
            }

            showContextMenu(selectedNode, e);
            const actionObj = {
                tree: treeV,
                menuVisible: state.contextMenuIsVisible,
                event: e,
            };
            context.emit('DTIsRootClicked', actionObj);
        };

        const nodeClicked = (node) => {
            removeAllClass();
            addClickedClass(node);
            if (!node.data.hasOwnProperty('init')) {
                state.nodeKey = (state.nodeKey !== node.data.id) ? node.data.id : state.nodeKey;
                state.hasSelected = true;
                context.emit('DTNodeClicked', node, getTree());
            } else {
                state.hasSelected = false;
            }
        };

        const nodeToggled = (node) => {
            context.emit('DTNodeToggled', node, getTree());
        };

        const beforeDropped = (node, position, cancel) => {
            context.emit('DTBeforeDropped', node, position, cancel, getTree());
        };

        const setContextVisible = (flag) => {
            if (Util.methods.isSelectedType(flag, 'b')) {
                state.contextMenuIsVisible = flag;
            }
        };

        const beforeEnter = (el) => {
            context.parent.$velocity(el, {
                translateX: `-${props.treeWidth}px`,
                opacity: 0,
            });
        };

        const enter = (el, done) => {
            context.parent.$velocity(el, { translateX: '0px', opacity: 1 },
                {
                    duration: 400,
                    complete() {
                        done();
                    },
                });
            done();
        };


        return {
            ...toRefs(state),
            getNoSelectMSG,
            getCurrentNode,
            getNodeKeyComputed,
            getTree,
            getNodeEl,
            addClickedClass,
            removeAllClass,
            removeClickedClass,
            preventEvent,
            showContextMenu,
            isRootClicked,
            nodeClicked,
            nodeToggled,
            beforeDropped,
            setContextVisible,
            beforeEnter,
            enter
        };
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

    $main-height: calc(100vh - #{$lnb-height});
    .main-tree-col {
        height: $main-height;
    }

    .contextmenu {
        position: absolute;
        background-color: $secondary2;
        color: $lightgray;
        cursor: pointer;
        z-index: 99999;
    }

    .panel {
        padding: 20px $side-pad $bottom-pad $side-pad;
    }
    .empty {
        text-align: center;
        margin-top: 5%;
        .msg {
            letter-spacing: 0;
            font: Bold 24px/32px Arial;
            color: #A5ACCE;
            opacity: 1;
        }
        .dt {
            letter-spacing: 0;
            font: 24px/32px Arial;
            color: #A5ACCE;
            opacity: 1;
        }

    }

</style>
