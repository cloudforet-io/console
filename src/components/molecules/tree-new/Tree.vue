<template>
    <div class="p-tree-container" @click.right.stop.prevent="onTreeRightClick">
        <tree ref="tree"
              v-model="selectedNode"
              :options="treeOptions"
              @tree:data:fetch="onFetch"
              @node:clicked="$emit('nodeClick', $event)"
              @node:dragging:start="$emit('dragStart', $event)"
              @node:dragging:finish="$emit('dragFinish', $event)"
        >
            <template #default="{node}">
                <span v-if="!selectMode" class="tree-scope"
                      @click.right.stop.prevent="onNodeRightClick(node)"
                >
                    <span>
                        <p-i :name="!node.hasChildren() ? icons.leaf :
                                 node.expanded() ? icons.expanded : icons.collapsed"
                             color="transparent inherit"
                             width="1rem" height="1rem"
                        />
                        {{ node.text }}
                    </span>
                    <p-lottie v-if="loading && fetchingNodeId === node.id"
                              name="spinner" auto
                              height="auto" width="1rem"
                    />
                </span>
                <span v-else-if="selectMode" class="tree-scope"
                      @click.right.stop.prevent="onNodeRightClick(node)"
                      @click.left.stop="node.select(false)"
                >
                    <span>
                        <p-i :name="!node.hasChildren() ? icons.leaf :
                                 node.expanded() ? icons.expanded : icons.collapsed"
                             color="transparent inherit"
                             width="1rem" height="1rem"
                        />
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
    reactive, toRefs, defineComponent, computed,
} from '@vue/composition-api';
import _ from 'lodash';
import {
    TreePropsInterface, getTreeProps, TreeOptionsInterface, TreeItemInterface,
} from './TreeData';
import PI from '@/components/atoms/icons/PI.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { isNotEmpty } from '@/lib/util';

export default defineComponent({
    name: 'PTreeNew',
    components: {
        PI,
        PLottie,
    },
    props: {
        getTreeProps,
        selectMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: TreePropsInterface, { emit }) {
        const state:any = reactive({
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

        const onFetch = (node) => {
            state.fetchingNodeId = node.id;
        };

        const onTreeRightClick = (e) => {
            if (e.currentTarget.className.includes('tree-root') || e.currentTarget.className.includes('p-tree-container')) {
                emit('emptyRightClick');
            }
        };

        const onNodeRightClick = (node) => {
            emit('nodeRightClick', node);
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

        return {
            ...toRefs(state),
            onFetch,
            onTreeRightClick,
            onNodeRightClick,
            deleteNode,
            addNode,
        };
    },
});
</script>

<style lang="scss">
    @mixin tree-arrow($url) {
        border: 0;
        width: 1rem;
        height: 1rem;
        left: 0;
        background: $gray;
        background-repeat: no-repeat;
        transition: background-image .25s;
        transform: rotate(0deg) translateY(-50%) translateX(0);
        mask-image: url(#{$url});
    }

    @mixin tree-selected($bg-color, $color) {
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
                color: $gray;
            }
        }
        .tree-arrow {
            height: 16px;
            margin-left: 24px;
            &.has-child {
                margin-left: 8px;
                width: 16px;
                &:after {
                    @include tree-arrow("~@/assets/icons/ic_tree_arrow.svg");
                }
                &.expanded:after {
                    @include tree-arrow("~@/assets/icons/ic_tree_arrow--opened.svg");
                }
            }
        }
        .tree-anchor {
            padding-left: 0;
        }
        .tree-node {
            &.selected > .tree-content {
                @include tree-selected($primary2, $white);
                &:hover {
                    @include tree-selected($primary2, $dark);
                }
            }
            > .tree-content:hover {
                @include tree-selected(transparent, $dark);
            }
        }
    }

    .tree-scope {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
</style>
