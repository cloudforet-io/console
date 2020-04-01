<template>
    <div class="container" :style="containerStyle">
        <div v-for="(item, index) in items"
             :key="index"
             class="card-item"
             :class="cardClass(item, index)"
             :style="cardStyle(item, index)"
        >
            <slot name="card" :item="item">
                {{ item }}
            </slot>
        </div>
    </div>
</template>

<script>
import { reactive, computed, toRefs } from '@vue/composition-api';

export default {
    name: 'GridLayout',
    components: {
    },
    props: {
        cardMinWidth: {
            type: String,
            default: '12rem',
        },
        cardMaxWidth: {
            type: String,
            default: '1fr',
        },
        cardHeight: {
            type: String,
            default: '20rem',
        },
        rowGap: {
            type: String,
            default: '1rem',
        },
        fixColumn: {
            type: Number,
            default: 0,
        },
        columnGap: {
            type: String,
            default: '1rem',
        },
        cardClass: {
            type: Function,
            default: () => [],
        },
        cardStyle: {
            type: Function,
            default: () => ({}),
        },
        items: {
            type: Array,
            default: () => [],
        },
    },
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
        @apply inline-block
    }

    .card-item {
        @apply bg-white border border-gray3;
        box-shadow: 0 0 8px rgba(theme('colors.primary'), 0.08);
        border-radius: 2px;
    }
</style>
