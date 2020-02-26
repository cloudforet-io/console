<template>
    <div class="p-tree-container">
        <liquor-tree ref="tree"
                     :data="data"
                     :options="options"
        >
            <template #default="{node}">
                <span class="tree-text">
                    <p-i v-if="!node.hasChildren()"
                         :name="node.data.leafIcon || 'ic_tree_project'"
                         color="transparent inherit"
                         width="1rem" height="1rem"
                    />
                    <p-i v-else-if="node.expanded()"
                         :name="node.data.expandedIcon || 'ic_tree_folder--opened'"
                         color="transparent inherit"
                         width="1rem" height="1rem"
                    />
                    <p-i v-else
                         :name="node.data.foldedIcon || 'ic_tree_folder'"
                         color="transparent inherit"
                         width="1rem" height="1rem"
                    />
                    {{ node.text }}
                </span>
            </template>
        </liquor-tree>
    </div>
</template>

<script lang="ts">
/**
 * Vue Plugin 'LiquorTree'
 * Reference: https://amsik.github.io/liquor-tree
 */

import {
    ref, reactive, toRefs, watch, defineComponent, onMounted,
} from '@vue/composition-api';
import _ from 'lodash';
import TreeItem, { TreeOptionsType } from './TreeData';
import PI from '@/components/atoms/icons/PI.vue';
import { makeProxy } from '@/lib/compostion-util';

export default defineComponent({
    name: 'PTreeNew',
    components: {
        PI,
    },
    props: {
        data: {
            type: Array,
            default: () => [],
        },
        options: {
            type: Object, // as () => TreeOptionsType,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            // proxyData: makeProxy('data', props, emit),
            // proxyOptions: makeProxy('options', props, emit),
            tree: null,
        });

        /**
         * LiquorTree's data & options are not reactive.
         */
        watch(() => props.data, (data) => {
            // @ts-ignore
            if (state.tree) state.tree.tree.setModel(data);
        });
        watch(() => props.options, (options) => {
            // @ts-ignore
            if (state.tree) state.tree.tree.options = options;
            // if (state.tree) state.tree.tree.setOptions(options);
        });

        return { ...toRefs(state) };
    },
});
</script>

<style lang="scss">
    @mixin tree($url) {
        border: 0;
        width: 1rem;
        height: 1rem;
        background: $gray;
        background-repeat: no-repeat;
        transition: background-image .25s;
        transform: rotate(0deg) translateY(-50%) translateX(0);
        mask-image: url(#{$url});
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
            &.has-child {
                &:after {
                    @include tree("~@/assets/icons/ic_tree_arrow.svg");
                }
                &.expanded:after {
                    @include tree("~@/assets/icons/ic_tree_arrow--opened.svg");
                }
            }
        }
        .tree-anchor {
            padding-left: 0;
        }
        .tree-node.selected {
            > .tree-content {
                background: $primary2;

                .tree-arrow.has-child {
                    &:after {
                        background: $white;
                    }
                    &.expanded:after {
                        background: $white;
                    }
                }

                > .tree-anchor {
                    color: $white;
                }
            }
        }

    }
</style>
