<template>
    <button class="p-select-button" :class="{selected: isSelected}"
            @click="onClick"
            v-on="$listeners"
    >
        <slot />
    </button>
</template>

<script lang="ts">
import { selectState } from '@/states/select-state';
import { toRefs } from '@vue/composition-api';

export default {
    name: 'PSelectButton',
    model: {
        prop: 'selected',
        event: 'change',
    },
    props: {
        /* select props */
        selected: {
            type: [Boolean, String, Number, Object, Array],
            default: undefined,
        },
        value: {
            type: [Boolean, String, Number, Object, Array],
            default: true,
        },
        predicate: {
            type: Function,
            default: undefined,
        },
        multiSelectable: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, context) {
        const { state, onClick } = selectState(props, context);
        return {
            ...toRefs(state),
            onClick,
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-select-button {
    @apply bg-white border border-gray-300 rounded;
    padding: 0.375rem 1rem;
    line-height: 1.6;
    font-size: 0.875rem;

    &.selected {
        @apply bg-blue-500 text-white;
    }

    @media (hover: hover) {
        &:hover:not(.selected) {
            @apply bg-blue-200;
        }
    }
}
</style>
