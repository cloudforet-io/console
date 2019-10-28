<template>
    <div>
        <div class="row no-gutters" @click="contextMenuIsVisible=false">
            <transition
                name="tree-trans"
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
                                <sl-vue-tree
                                    ref="slVueTree"
                                    v-model="selectedTreeProp"
                                    class="main-tree-col"
                                    :allow-multiselect="true"
                                    :style="{ width: width }"
                                    @nodeclick="nodeClicked"
                                    @beforedrop="beforeNodeDropped"
                                    @toggle="nodeToggled"
                                    @nodecontextmenu="showContextMenu"
                                >
                                    <template #title="{ node }">
                                        <span
                                            v-if="node.data.init"
                                            class="fas fa-exclamation-triangle"
                                        />
                                        <span
                                            v-else-if="treeType == 'PROJECT'"
                                            class="item-icon"
                                        >
                                            <i
                                                v-if="node.isLeaf"
                                                class="fas fa-cube"
                                            />
                                            <i
                                                v-else-if="node.isExpanded"
                                                class="fal fa-folder-open"
                                            />
                                            <i
                                                v-else
                                                class="fal fa-folder-minus"
                                            />
                                        </span>
                                        <span
                                            v-else-if="treeType == 'DATA_CENTER'"
                                            class="item-icon"
                                        >
                                            <i
                                                v-if="node.data.item_type == 'REGION'"
                                                class="far fa-globe-americas"
                                            />
                                            <i
                                                v-else-if="node.data.item_type == 'ZONE'"
                                                class="fab fa-cloudversify"
                                            />
                                            <i
                                                v-else
                                                class="fad fa-server"
                                            />
                                        </span>
                                        <span class="item-title">
                                            {{ node.title }}
                                        </span>
                                    </template>
                                    <template #toggle="{ node }">
                                        <i
                                            v-if="node.isExpanded"
                                            class="fal fa-angle-down"
                                        />
                                        <i
                                            v-else
                                            class="fal fa-angle-right"
                                        />
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
                                <div
                                    v-if="hasSelected"
                                    :key="getNodekeyComputed"
                                    class="panel"
                                    :style="{ width: width }"
                                >
                                    <slot name="treeSubPanel" />
                                </div>
                                <div
                                    v-else
                                    class="empty"
                                >
                                    <span class="msg">Please, Click a item from left tree Panel.</span>
                                </div>
                            </transition>
                        </template>
                    </BaseDragVertical>

                    <div
                        v-show="contextMenuIsVisible"
                        ref="contextmenu"
                        class="contextmenu"
                    >
                        <template v-if="treeType=='DATA_CENTER'">
                            <template v-for="(n, i) in getDataLength(conTextObj, 'Executor')">
                                <div
                                    v-if="contextIndividualVisible[i]"
                                    @click="contextExecutor(conTextObj.Executor[i], rootAction)"
                                >
                                    <i :class="conTextObj.icons[i]" />    &nbsp;{{ tr(conTextObj.Msg[i][0],[tr(conTextObj.Msg[i][1])]) }}
                                </div>
                            </template>
                        </template>
                        <template v-else>
                            <template v-for="(n, i) in getDataLength(conTextObj, 'Executor')">
                                <div
                                    v-if="contextIndividualVisible[i]"
                                    @click="contextExecutor(conTextObj.Executor[i], rootAction)"
                                >
                                    <i :class="conTextObj.icons[i]" />    &nbsp;{{ tr(conTextObj.Msg[i][0],[tr(conTextObj.Msg[i][1])]) }}
                                </div>
                            </template>
                        </template>
                    </div>
                </div>
            </transition>
        </div>

        <BaseModal
            ref="BATR001_checkModal"
            :use-custom-msg="true"
            :title="modalTitle"
            :text="modalContents"
            :type="'primary'"
            size="md"
            :custom-yes-or-no-msg="customBtn"
        />

        <BaseSimpleModal
            ref="BATR001_treeAlertNotice"
            :title="tr('MODAL_TITLE.NOT_ALLOW')"
            :text="noticePanelMsg"
        />
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import BaseDragVertical from '@/components/base/drag/BaseDragVertical';

export default {
    name: 'BaseTree',
    components: {
        BaseDragVertical,
        SlVueTree,
        BaseModal,
        BaseSimpleModal,
    },
    props: {
        treeProp: {
            type: Array,
            default: () => [],
        },
        contextInit: {
            type: Boolean,
            default: false,
        },
        treeWidth: {
            type: Number,
            default: 250,
        },
        conTextObj: {
            type: Object,
            default: () => {},
            required: true,
        },
        treeType: {
            type: String,
            default: 'TREE',
            required: true,
        },
    },
    data() {
        return {
            customBtn: { NO: 'No', YES: 'Yes' },
            selectedLeftWidth: 300,
            rootAction: false,
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
        selectedTreeProp: {
            get() {
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
            set(value) {
                this.treeData = value;
            },
        },
        getNodekeyComputed() {
            return this.nodeKey;
        },
        getLeftTreeWidth() {
            const keyName = `${this.$parent.$options.name}_treeWidth`;
            return localStorage.hasOwnProperty(keyName) ? parseInt(localStorage[keyName]) : this.selectedLeftWidth;
        },
    },
    mounted() {
        this.showTree = true;
    },
    methods: {
        getDataLength(objOrArr, key) {
            return this.isEmpty(key) ? objOrArr.length : objOrArr[key].length;
        },
        isBackPanelHasClciked(e) {
            if (!this.contextMenuIsVisible) {
                const treeV = this.$refs.slVueTree;
                let selectedNode = treeV.getSelected();
                if (this.isEmpty(selectedNode)) {
                    const lastNode = treeV.getLastNode();
                    console.log(lastNode);
                    treeV.select(lastNode.path, { addToSelection: false });
                    selectedNode = treeV.getSelected()[0];
                } else {
                    selectedNode = selectedNode[0];
                }
                selectedNode.data.back_panel_click = true;
                this.showContextMenu(selectedNode, e);
            }
        },
        nodeClicked(node) {
            if (this.clickedNode) {
                this.removeClickedClass(this.clickedNode);
            }
            this.clickedNode = node;
            this.addClickedClass(node);

            if (!node.data.hasOwnProperty('init')) {
                this.nodeKey = (this.nodeKey !== node.data.id) ? node.data.id : this.nodeKey;
                this.hasSelected = true;
                this.$emit('selected', { node, treeV: this.$refs.slVueTree });
            } else {
                this.hasSelected = false;
            }
        },
        nodeToggled(node) {
            if (!node.isExpanded) {
                this.setClickedNodeItem(node);
                if (!node.data.is_cached) {
                    this.$emit('toggled', { node, treeV: this.$refs.slVueTree });
                }
            }
        },
        setClickedNodeItem(node) {
            let hasNoClickedItem = false;
            if (this.clickedNode) {
                hasNoClickedItem = node.path.some((path, i) => path !== this.clickedNode.path[i]);
            } else {
                hasNoClickedItem = true;
            }

            if (!hasNoClickedItem) {
                const addClassInterval = setInterval(() => {
                    if (this.addClickedClass(this.clickedNode)) {
                        clearInterval(addClassInterval);
                    }
                }, 10);
            }
        },
        getNodeEl(node) {
            return this.$refs.slVueTree.$el.querySelector(`[path="${node.pathStr}"]`);
        },
        addClickedClass(node) {
            const elem = this.getNodeEl(node);
            if (elem) {
                elem.classList.add('sl-vue-node-clicked');
                return true;
            }
            return false;
        },
        removeClickedClass(node) {
            const elem = this.getNodeEl(node);
            if (elem) {
                elem.classList.remove('sl-vue-node-clicked');
            }
        },
        showContextMenu(node, event, hasClicked) {
            if (!hasClicked) {
                event.preventDefault();
            }

            const { item_type } = node.data;
            if (this.treeType === 'PROJECT') {
                if (!this.isEmpty(this._.get(node, 'data.init')) || this._.get(node, 'data.back_panel_click')) {
                    this.contextIndividualVisible = [true, false, false, false, false];
                    this.rootAction = true;
                    delete node.data.back_panel_click;
                } else if (item_type === 'PROJECT_GROUP') {
                    this.contextIndividualVisible = [true, true, true, false, true];
                } else if (item_type === 'PROJECT') {
                    this.contextIndividualVisible = [false, false, false, true, true];
                }
            } else if (this.treeType === 'DATA_CENTER') {
                if (!this.isEmpty(this._.get(node, 'data.init')) || this._.get(node, 'data.back_panel_click')) {
                    this.contextIndividualVisible = [true, false, false, false, false, false, false];
                    this.rootAction = true;
                    delete node.data.back_panel_click;
                } else if (item_type === 'REGION') {
                    this.contextIndividualVisible = [false, true, true, false, false, false, true];
                } else if (item_type === 'ZONE') {
                    this.contextIndividualVisible = [false, false, false, true, true, false, true];
                } else {
                    this.contextIndividualVisible = [false, false, false, false, false, true, true];
                }
            }

            this.contextMenuIsVisible = true;
            const $contextMenu = this.$refs.contextmenu;
            const coordinateX = event.clientX;
            const coordinateY = event.clientY;
            this.$refs.slVueTree.select(node.path);
            $contextMenu.style.left = (hasClicked) ? `${coordinateX - 128}px` : `${coordinateX}px`;
            $contextMenu.style.top = `${coordinateY - this.headerHeight}px`;
        },
        contextExecutor(flag, action) {
            /** *******************
                 Flag:
                 CPG: Create Project Group
                 CPR: Create Project
                 UPG: Update Project Group
                 UPR: Update Project
                 RMS: Delete Selected
                 ********************** */
            const treeV = this.$refs.slVueTree;
            this.contextMenuIsVisible = false;
            this.modalContext = {
                tree: treeV,
            };

            if (action) {
                this.modalContext.root_action = true;
                this.rootAction = false;
            }
            this.modalContext.flag = flag;
            this.modalEvent = 'edited';

            if (flag === 'RMS') {
                this.deleteSelected(this.modalContext.tree);
            } else {
                this.$emit(this.modalEvent, this.modalContext);
            }
        },
        doTheyShareSameParent(fromNode, toNode) {
            let isNeedToProcessOnSC = false;
            if (!toNode.node.data.is_cached) {
                const sourceNode_path = JSON.parse(JSON.stringify(fromNode[0].path));
                const toNode_path = JSON.parse(JSON.stringify(toNode.node.path));
                if (sourceNode_path.length === toNode_path.length) {
                    sourceNode_path.pop();
                    toNode_path.pop();
                    if (JSON.stringify(sourceNode_path) === JSON.stringify(toNode_path)) {
                        isNeedToProcessOnSC = true;
                    }
                }
            }
            return isNeedToProcessOnSC;
        },
        beforeNodeDropped(node, position, cancel) {
            const trStringKey = 'TREE_TYPE';
            const srcNode = node[0];
            const srcNodeDT = srcNode.data;
            const targetNodeDT = position.node.data;
            if (srcNodeDT.group === 'PROJECT') {
                if (position.node.path.length == 1 && position.placement !== 'inside' && srcNodeDT.item_type === 'PROJECT') {
                    cancel(true);
                    this.noticePanelMsg = this.tr('MODAL_MSG.LEAF_NOMOVE', [this.tr(`${trStringKey}.${srcNodeDT.item_type}`)]);
                    this.$refs.BATR001_treeAlertNotice.showModal();
                    return;
                }

                const acceptable = GlobalEnum.TREE[targetNodeDT.group][targetNodeDT.item_type].accept;
                if (!acceptable.includes(srcNodeDT.item_type)) {
                    cancel(true);
                    this.noticePanelMsg = this.tr('MODAL_MSG.LEAF_PUSHTO', [this.tr(`${trStringKey}.${srcNodeDT.item_type}`), this.tr(`${trStringKey}.${targetNodeDT.item_type}`)]);
                    this.$refs.BATR001_treeAlertNotice.showModal();
                    return;
                }
            } else if (srcNodeDT.group === 'DATA_CENTER') {
                /* if (node[0].path.length-1 !== position.node.path.length){
                        cancel(true);
                        this.noticePanelMsg = this.tr('MODAL_MSG.LEAF_NOMOVE',[this.tr(`${trStringKey}.${srcNodeDT.item_type}`)]);
                        this.$refs.BATR001_treeAlertNotice.showModal();
                        return;
                    } */
            }

            const treeV = this.$refs.slVueTree;
            const shareParam = this.doTheyShareSameParent(node, position);
            const isCanceled = !!shareParam;

            if (!position.node.data.is_cached) {
                treeV.remove(treeV.getSelected().map(node => node.path));
                cancel(true);
            }

            this.$emit('noCacheDrop', {
                nodes: node,
                position,
                treeV: this.$refs.slVueTree,
                cancel,
                isCanceled,
            });

            if (this.doTheyShareSameParent(node, position)) {

            }
        },
        deleteSelected(tree) {
            const prams = {
                path: tree.getSelected().map(node => node.path),
                tree,
            };
            this.$emit('delete', prams);
        },
        beforeEnter(el) {
            this.$velocity(el, {
                translateX: `-${this.treeWidth}px`,
                opacity: 0,
            });
        },
        enter(el, done) {
            this.$velocity(el,
                {
                    translateX: '0px',
                    opacity: 1,
                },
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
