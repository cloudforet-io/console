<template>
    <div class="p-grid-layout" :style="containerStyle">
        <div v-for="(item, index) in items"
             :key="index"
             :class="cardClass(item, index)"
             :style="cardStyle(item, index)"
             @click="$emit('card:click',item,$event)"
        >
            <slot name="card" :item="item" :index="index">
                {{ item }}
            </slot>
        </div>
    </div>
</template>

<script lang="ts">
import { reactive, computed, toRefs } from '@vue/composition-api';
import { gridLayoutProps } from '@/components/molecules/layouts/grid-layout/PGridLayout.toolset';

export default {
    name: 'PGridLayout',
    components: {
    },
    props: gridLayoutProps,
    setup(props, context) {
        const state = reactive({
            containerStyle: computed(() => ({
                display: 'grid',
                'grid-template-columns': `repeat(${props.fixColumn || 'auto-fill'}, minmax(${props.cardMinWidth}, ${props.cardMaxWidth}))`,
                'grid-auto-rows': props.cardHeight,
                'row-gap': props.rowGap,
                'column-gap': props.columnGap,
            })),
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
    .icon {
        @apply inline-block;
    }

    .card-item {
        @apply bg-white border border-gray-200;
        border-radius: 2px;
        cursor: pointer;
        &:hover {
             @apply border-l border-secondary;
             cursor: pointer;
         }
    }

</style>
