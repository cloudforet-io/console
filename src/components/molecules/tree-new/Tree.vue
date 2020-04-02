<template>
    <div class="p-tree-container" @click.right.stop.prevent="onTreeRightClick">
        <tree ref="tree"
              v-model="selectedNode"
              :options="treeOptions"
              v-on="treeListeners"
        >
            <template #default="{node}">
                <span class="tree-scope"
                      @click="onNodeClick(node, $event)"
                      @click.right.stop.prevent="onNodeRightClick(node, $event)"
                >
                    <span>
                        <slot name="icon"
                              :node="node"
                              :hasChildren="node.hasChildren()"
                              :isExpanded="node.expanded()"
                        >
                            <p-i :name="!node.hasChildren() ? icons.leaf :
                                     node.expanded() ? icons.expanded : icons.collapsed"
                                 color="transparent inherit"
                                 width="1rem" height="1rem"
                            />
                        </slot>
                        {{ node.text }}
                    </span>
                    <p-lottie v-if="loading && fetchingNodeId === node.id"
                              name="spinner" auto
                              height="auto" width="1rem"
                    />
                </span>
            </template>
        </tree>
    </div>
</template>

<script lang="ts">
/**
 * Vue Plugin 'LiquorTree'
 * Reference: https://amsik.github.io/liquor-tree
 */

import {
    reactive, toRefs, defineComponent, computed, getCurrentInstance,
} from '@vue/composition-api';
import {
    TreePropsInterface, treeProps, TreeOptionsInterface, TreeItemInterface,
} from './ToolSet';
import PI from '@/components/atoms/icons/PI.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { isNotEmpty } from '@/lib/util';

export default defineComponent({
    name: 'PTreeNew',
    components: {
        PI,
        PLottie,
    },
    props: treeProps,
    setup(props: TreePropsInterface, { emit }) {
        const vm: any = getCurrentInstance();
        const state: any = reactive({
            tree: null,
            selectedNode: null,
            fetchingNodeId: null,
            treeOptions: computed(() => {
                const result: TreeOptionsInterface = {
                    nodeIndent: 8,
                    ...props.options,
                };
                if (isNotEmpty(props.data) && !result.fetchData) {
                    result.fetchData = () => new Promise((resolve) => {
                        resolve(props.data);
                    });
                }
                return result;
            }),
        });

        const onNodeClick = (node, e) => {
            if (props.selectMode) {
                e.stopPropagation();
                node.select();
            }
        };

        const onTreeRightClick = (e) => {
            if (e.currentTarget.className.includes('tree-root') || e.currentTarget.className.includes('p-tree-container')) {
                emit('tree:clicked:right');
            }
        };

        const onNodeRightClick = (node, e) => {
            emit('node:clicked:right', node, e);
        };

        const deleteNode = (node, propagation: boolean = true, multiple: boolean = false) => {
            if (!state.tree) return;
            if (propagation) node.children = [];
            state.tree.remove({ text: node.data.text }, multiple);
        };

        type addType = 'append' | 'prepend' | 'before' | 'after';
        const addNode = (node, newItem:string | TreeItemInterface = { text: '' }, type: addType = 'append') => {
            node[type](newItem);
        };

        const onFetch = (node) => {
            state.fetchingNodeId = node.id;
            emit('tree:data:fetch', node);
        };

        const onNodeCollapsed = (node) => {
            if (!props.cacheMode) {
                node.children = [];
                node.isBatch = true;
            }
            emit('node:collapsed', node);
        };

        const treeListeners = {
            ...vm.$listeners,
            'tree:data:fetch': onFetch,
            'node:collapsed': onNodeCollapsed,
        };

        return {
            ...toRefs(state),
            onNodeClick,
            onTreeRightClick,
            onNodeRightClick,
            deleteNode,
            addNode,
            treeListeners,
        };
    },
});
</script>

<style lang="postcss">
    @define-mixin tree-arrow $url {
        border: 0;
        width: 1rem;
        height: 1rem;
        left: 0;
        background: theme('colors.gray.default');
        background-repeat: no-repeat;
        transition: background-image .25s;
        transform: rotate(0deg) translateY(-50%) translateX(0);
        mask-image: url($(url));
    }

    @define-mixin tree-selected $bg-color, $color {
        background: $bg-color;

        .tree-arrow.has-child {
            &:after {
                background: $color;
            }
            &.expanded:after {
                background: $color;
            }
        }

        > .tree-anchor {
            color: $color;
        }
    }

    .p-tree-container .tree-root {
        padding: 1.5rem .5rem;
        .tree-content {
            padding: .5rem 0;
            height: 2rem;
            font-size: .875rem;
            border-radius: 2px;
            .tree-anchor {
                @apply text-gray;
            }
        }
        .tree-arrow {
            /**
             * This is for override liquor tree's css.
             * DO NOT CHANGE belows from px to rem system.
             */
            height: 16px;
            margin-left: 24px;
            &.has-child {
                margin-left: 8px;
                width: 16px;
                &:after {
                    @mixin tree-arrow "~@/assets/icons/ic_tree_arrow.svg";
                }
                &.expanded:after {
                    @mixin tree-arrow "~@/assets/icons/ic_tree_arrow--opened.svg";
                }
            }
        }
        .tree-anchor {
            padding-left: 0;
        }
        .tree-node {
            &.selected > .tree-content {
                @mixin tree-selected theme('colors.primary2'), theme('colors.white');
                &:hover {
                    @mixin tree-selected theme('colors.primary2'), theme('colors.gray.900');
                }
            }
            > .tree-content:hover {
                @mixin tree-selected transparent, theme('colors.gray.900');
            }
        }
    }

    .tree-scope {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
</style>
