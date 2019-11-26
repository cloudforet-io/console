<template>
    <sl-vue-tree
        ref="slVueTree"
        v-model="computedTreeData"
        class="main-tree-col"
        :allow-multiselect="useMultiSelect"
        :style="{ width: initialTreeWidth }"
        @nodeclick="nodeClick"
        @beforedrop="beforeDrop"
        @toggle="nodeToggle"
        @nodecontextmenu="nodeContextMenu"
    >
        <template #title="{ node }">
            <div v-if="node.data.init" class="empty-node" >
                <span >
                    <p-i :color="'transparent primary3'"
                         :width="'14rem'"
                         :height="'14rem'"
                         :name="'ic_no_project-group'"
                    />
                </span>
                <br>
                <span>{{ node.title }}</span>
            </div>

            <slot name="icon" v-bind="node">
                <span v-if="!node.data.init" class="item-icon">
                    <p-i v-if="node.isLeaf"
                         :color="'transparent inherit'"
                         :width="'1rem'"
                         :height="'1rem'"
                         :name="'ic_tree_project'"
                    />
                    <p-i v-else-if="node.isExpanded"
                         :color="'transparent inherit'"
                         :width="'1rem'"
                         :height="'1rem'"
                         :name="'ic_tree_folder--opened'"
                    />
                    <p-i v-else
                         :color="'transparent inherit'"
                         :width="'1rem'"
                         :height="'1rem'"
                         :name="'ic_tree_folder'"
                    />
                </span>
            </slot>
            <span v-if="!node.data.init" class="item-title" @mousedown="setTitle">{{ node.title }}</span>

        </template>
        <template #toggle="{ node }">
            <p-i v-if="node.isExpanded"
                 :color="'transparent inherit'"
                 :width="'1rem'"
                 :height="'1rem'"
                 :name="'ic_tree_arrow--opened'"
            />
            <p-i v-else
                 :color="'transparent inherit'"
                 :width="'1rem'"
                 :height="'1rem'"
                 :name="'ic_tree_arrow'"
            />
        </template>
        <template #draginfo>
            {{selectedNodesTitle}}
        </template>
    </sl-vue-tree>
</template>

<script>
import SlVueTree from 'sl-vue-tree';
import PI from '@/components/atoms/icons/PI';
export default {
    name: 'PTree',
    events: [],
    components: {
        PI,
        SlVueTree,
    },
    props: {
        /** Tree Node Data */
        treeData: {
            type: Array,
            default: () => [],
        },
        /** Initial Tree panel Width */
        initialTreeWidth: {
            type: String,
            default: '300px',
        },
        /** Allow select multiple Nodes */
        useMultiSelect: {
            type: Boolean,
            default: false,
        },
        /** Ues Y/N to user default Node icon on Tree */
        useDefaultTreeIcon: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            currentTreeData: null,
            clickedNode: null,
            selectedNodesTitle: null,
        };
    },
    computed: {
        computedTreeData: {
            get() {
                let returnVal = this.treeData;
                if (this.isEmpty(returnVal)) {
                    returnVal = [{
                        title: 'Click right button to create a new project Group.',
                        isLeaf: true,
                        init: true,
                    }];
                }
                return returnVal;
            },
            set(value) {
                this.$emit('update:treeData', value);
            },
        },
    },
    methods: {
        setTitle(e){
            this.selectedNodesTitle =  e.target.innerText
        },
        nodeClick(node) {
            if (this.clickedNode) {
                this.removeClickedClass(this.clickedNode);
            }

            this.clickedNode = node;
            this.addClickedClass(node);

            this.$emit('nodeClick', node);
        },
        beforeDrop(node, position, cancel) {
            this.$emit('beforeDrop', node, position, cancel);
        },
        nodeToggle(node) {
            if (!node.isExpanded) {
                this.setClickedNodeItem(node);
                if (!node.data.is_cached) {
                    this.$emit('nodeToggle', node);
                }
            }
        },
        nodeContextMenu(node, event, hasClicked) {
            this.$emit('nodeContextMenu', node, event, hasClicked);
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
    },
};
</script>

<style lang="scss" scoped>

    $main-height: calc(100vh - #{$header-height} - 30px);

    .main-tree-col {
        @extend %sheet;
        border-radius: 0;
        padding: 15px 8px;
        background-color: $primary4;
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
    .empty-node {
        text-align: center;
        font: 18px/21px Arial;
        letter-spacing: 0;
        color: #A5ACCE;
        opacity: 1;
    }
</style>
