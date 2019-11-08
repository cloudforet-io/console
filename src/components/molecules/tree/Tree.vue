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
        @nodecontextmenu="nodeContextMenu">
        <template #title="{ node }">
            <span v-if="node.data.init" class="fas fa-exclamation-triangle"/>
            <slot name="icon" v-bind="node">
                <span v-if="!node.data.init" class="item-icon">
                     <f-i v-if="node.isLeaf" :icon="'fas fa-cube'"/>
                     <f-i v-else-if="node.isExpanded" :icon="'fal fa-folder-open'"/>
                     <f-i v-else :icon="'fal fa-folder-minus'"/>
                </span>
            </slot>
            <span class="item-title">{{ node.title }}</span>
        </template>
        <template #toggle="{ node }">
                <f-i v-if="node.isExpanded" :icon="'fal fa-angle-down'"/>
                <f-i v-else :icon="'fal fa-angle-right'" />
        </template>
    </sl-vue-tree>
</template>

<script>

import SlVueTree from 'sl-vue-tree';
import FI from '@/components/atoms/icons/FI';
export default {
    name: 'PTree',
    events: [],
    components: {
        FI,
        SlVueTree,
    },
    props: {
        /**
         *  Tree Node Data
         */
        treeData: {
            type: Array,
            default: () => [],
        },
        /**
         *  Initial Tree panel Width
         */
        initialTreeWidth: {
            type: String,
            default: '300px',
        },
        /**
         *  Allow select multiple Nodes
         */
        useMultiSelect: {
            type: Boolean,
            default: true,
        },
        /**
         * Ues Y/N to user default Node icon on Tree
         */
        useDefaultTreeIcon: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            currentTreeData: null,
            clickedNode: null,
        };
    },
    computed: {
        computedTreeData: {
            get() {
                let returnVal = this.treeData;
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
                this.currentTreeData = value;
            },
        },
    },
    methods: {
        nodeClick(node) {
            this.$emit('nodeClick', node);
        },
        beforeDrop(node, position, cancel) {
            this.$emit('beforeDrop', node, position, cancel);
        },
        nodeToggle(node) {
            if (!node.isExpanded) {
                this.setClickedNodeItem(node);
                if (!node.data.is_cached) {
                    this.$emit('nodeToggle', {node, treeV: this.$refs.slVueTree});
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
        addClickedClass(node) {
            const elem = this.getNodeEl(node);
            if (elem) {
                elem.classList.add('sl-vue-node-clicked');
                return true;
            }
            return false;
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
