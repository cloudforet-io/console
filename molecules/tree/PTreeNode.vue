<template>
    <fragment>
        <div class="p-tree-node" :class="nodeClasses" @click="onClickNode">
            <span :style="{paddingLeft: depth}" />
            <slot name="node">
                <slot name="left-extra" />
                <slot v-if="children" name="toggle">
                    <p-i :name="expanded ? 'ic_tree_arrow--opened' : 'ic_tree_arrow'"
                         width="1rem" height="1rem"
                         class="toggle"
                    />
                </slot>
                <slot name="default">
                    {{ data }}
                </slot>
                <slot name="right-extra" />
            </slot>
        </div>
        <p-tree-node v-for="(child, idx) in proxyChildren" :key="idx"
                     :data="child.data"
                     :children.sync="child.children"
                     :level="level + 1" @click="onClickChild"
        />
    </fragment>
</template>

<script lang="ts">
import { TreeNodeProps, treeNodeProps } from '@/components/molecules/tree/PTreeNode.toolset';
import { computed, reactive, toRefs } from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import { makeProxy } from '@/lib/compostion-util';
import { findIndex } from 'lodash';

const PTreeNode = import('@/components/molecules/tree/PTreeNode.vue');
export default {
    name: 'PTreeNode',
    components: { PI, PTreeNode },
    props: treeNodeProps,
    setup(props: TreeNodeProps, { emit }) {
        const state = reactive({
            proxyChildren: makeProxy<any[]>('children', props, emit),
        });
        return {
            ...toRefs(state),
            nodeClasses: computed(() => {
                const classes = {
                    disabled: props.disabled,
                    selected: props.selected,
                };

                return props.classNames ? {
                    ...props.classNames.reduce((res, d) => {
                        res[d] = true;
                        return res;
                    }, classes),
                } : { ...classes, basic: true };
            }),
            depth: computed(() => {
                if (!props.padSize) return `${props.level}rem`;
                const size = props.padSize.match(/\d+/g);
                const unit = props.padSize.match(/[a-zA-Z]+/g);
                return `${props.level * (size ? Number(size[0]) : 1)}${unit ? unit[0] : 'rem'}`;
            }),
            onClickChild(e) {
                // const idx = state.proxyChildren ? findIndex(state.proxyChildren, child => child.data === e.data) : -1;
                // if (idx === -1) return;
                // console.debug('state.proxyChildren', e, state.proxyChildren, idx);
                // state.proxyChildren = state.proxyChildren.splice(idx, 1);
                emit('click', e);
            },
            onClickNode(e) {
                emit('click', {
                    level: props.level,
                    data: props.data,
                    children: props.children,
                });
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
.basic {
    @apply rounded-sm h-8 text-sm leading-normal;
    &.selected {
        @apply bg-blue-200 border border-secondary;
    }
    &.disabled {
        @apply text-gray-300;
    }
}
</style>
