<template>
    <div>
        <div class="row no-gutters" @click="contextMenuIsVisible=false">
            <transition appear name="tree-trans" @before-enter="beforeEnter"
                        @enter="enter"
            >
                <div v-if="showTree">
                    <vertical-layout :autoSaveLeftWidth="true">
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
                                <div v-if="hasSelected" :key="getNodekeyComputed" class="panel">
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
                    </vertical-layout>
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
import PTree from '@/components/molecules/tree/Tree';
import PI from '@/components/atoms/icons/PI';
import styles from '@/styles/_variables.scss';

import VerticalLayout from '@/components/organisms/layouts/vertical-layout/VerticalLayout';

export default {
    name: 'DefaultTree',
    components: {
        PTree,
        VerticalLayout,
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
    data() {
        return {
            showContextFirst: false,
            selectedLeftWidth: 300,
            nodeKey: 0,
            hasSelected: false,
            contextMenuIsVisible: false,
            showTree: false,
            noticePanelMsg: '',
            clickedNode: null,
        };
    },
    computed: {
        getNoSelectMSG() {
            return [this.tr(this.noSelectMSG[0]), this.tr(this.noSelectMSG[1])];
        },
        getCurrentNode() {
            const node = this.getTree();
            return this.isEmpty(node) ? null : node;
        },
        selectedTreeProp() {
            let returnVal = this.treeProp;
            if (this.isEmpty(returnVal)) {
                returnVal = [{
                    title: '!Please, Right Click me',
                    isLeaf: true,
                    init: true,
                }];
            }
            return returnVal;
        },
        getNodekeyComputed() {
            return this.nodeKey;
        },
    },
    mounted() {
        this.showTree = true;
    },
    methods: {
        setContextVisible(flag) {
            if (this.isSelectedType(flag, 'b')) {
                this.contextMenuIsVisible = flag;
            }
        },
        getTree() {
            return this.isEmpty(this) ? null : _.get(this, '$refs.primeTree.$refs.slVueTree');
        },
        getNodeEl(node) {
            return this.$refs.primeTree.$refs.slVueTree.$el.querySelector(`[path="${node.pathStr}"]`);
        },
        addClickedClass(node) {
            const elem = this.getNodeEl(node);
            if (elem) {
                elem.classList.add('sl-vue-node-clicked');
                return true;
            }
            return false;
        },
        removeAllClass() {
            const elem = this.$refs.primeTree.$refs.slVueTree.$el.querySelectorAll('.sl-vue-tree-nodes-list .sl-vue-tree-node .sl-vue-node-clicked');
            elem.forEach((curItem) => {
                curItem.classList.remove('sl-vue-node-clicked');
            });
        },
        removeClickedClass(node) {
            const elem = this.getNodeEl(node);
            if (elem) {
                elem.classList.remove('sl-vue-node-clicked');
            }
        },
        isRootClicked(e) {
            this.preventEvent(e);
            const treeV = this.getTree();
            let selectedNode = treeV.getSelected();

            this.contextMenuIsVisible = false;
            if (!this.contextMenuIsVisible) {
                if (this.isEmpty(selectedNode)) {
                    const lastNode = treeV.getLastNode();
                    treeV.select(lastNode.path, { addToSelection: false });
                    selectedNode = treeV.getSelected()[0];
                } else {
                    selectedNode = selectedNode[0];
                }
                selectedNode.data.back_panel_click = true;
            }

            this.showContextMenu(selectedNode, e);
            const actionObj = {
                tree: treeV,
                menuVisible: this.contextMenuIsVisible,
                event: e,
            };
            this.$emit('DTIsRootClicked', actionObj);
        },
        nodeClicked(node) {
            this.removeAllClass();
            this.addClickedClass(node);
            if (!node.data.hasOwnProperty('init')) {
                this.nodeKey = (this.nodeKey !== node.data.id) ? node.data.id : this.nodeKey;
                this.hasSelected = true;
                this.$emit('DTNodeClicked', node, this.getTree());
            } else {
                this.hasSelected = false;
            }
        },
        nodeToggled(node) {
            this.$emit('DTNodeToggled', node, this.getTree());
        },
        beforeDropped(node, position, cancel) {
            this.$emit('DTBeforeDropped', node, position, cancel, this.getTree());
        },
        showContextMenu(node, event, hasClicked) {
            if (event.currentTarget.id !== 'rootPanel') {
                node.data.back_panel_click = false;
            }

            if (!hasClicked) {
                event.preventDefault();
            }

            event.stopPropagation();

            if (this.contextMenuIsVisible) {
                this.contextMenuIsVisible = false;
            }

            this.removeAllClass(node);
            this.addClickedClass(node);

            this.$emit('DTContextVisible', node, event, hasClicked, this.getTree());
            this.contextMenuIsVisible = true;
            const $contextMenu = this.$refs.contextmenu;
            const coordinateX = event.clientX;
            const coordinateY = event.clientY;
            this.getTree().select(node.path);

            $contextMenu.style.left = `${coordinateX - parseFloat(styles.gnbWidth)}px`;
            $contextMenu.style.top = `${coordinateY - parseFloat(styles.lnbHeight)}px`;
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
        preventEvent(e, flag) {
            if (this.isEmpty(flag)) {
                e.stopPropagation();
                e.preventDefault();
            } else {
                e.preventDefault();
            }
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
