<template>
    <button class="p-select-button"
            :class="{selected: isSelected, [styleType]: true, [size]: true}"
            @click="onClick"
            v-on="listeners"
    >
        <slot />
    </button>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { computed, useAttrs } from 'vue';

import type { SelectProps } from '@/hooks/select';
import { useSelect } from '@/hooks/select';
import { SELECT_BUTTON_SIZE, SELECT_BUTTON_STYLE_TYPE } from '@/inputs/select-button/config';

/* NOTE: this is not used in the component, but it is used in the story
    interface Props extends SelectProps {
        styleType?: SELECT_BUTTON_STYLE_TYPE;
        size?: SELECT_BUTTON_SIZE;
    }
*/
const props = defineProps({
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
        type: Function as PropType<SelectProps['predicate']>,
        default: undefined,
    },
    multiSelectable: {
        type: Boolean,
        default: false,
    },
    /* select button props */
    styleType: {
        type: String as PropType<SELECT_BUTTON_STYLE_TYPE>,
        default: SELECT_BUTTON_STYLE_TYPE.secondary,
        validator(styleType: any) {
            return Object.values(SELECT_BUTTON_STYLE_TYPE).includes(styleType);
        },
    },
    size: {
        type: String as PropType<SELECT_BUTTON_SIZE>,
        default: SELECT_BUTTON_SIZE.md,
        validator(size: any) {
            return Object.values(SELECT_BUTTON_SIZE).includes(size);
        },
    },
});
const emit = defineEmits<{(e: 'change', selected: any, checked: boolean): void;
    (e: 'update:selected', selected: any): void;
}>();
const attrs = useAttrs();

const {
    isSelected,
    getSelected,
} = useSelect({
    value: computed(() => props.value),
    selected: computed(() => props.selected),
    predicate: computed(() => props.predicate),
    multiSelectable: computed(() => props.multiSelectable),
});

/* event */
const onClick = () => {
    const newSelected = getSelected();
    if (props.multiSelectable) {
        emit('change', newSelected, !isSelected.value);
        emit('update:selected', newSelected);
    } else {
        emit('change', newSelected, true);
        emit('update:selected', newSelected);
    }
};

const listeners = {
    ...attrs,
};

</script>

<style lang="postcss" scoped>
.p-select-button {
    @apply border rounded;
    border-width: 1px;
    border-style: solid;

    @define-mixin style-type $bg-color, $border-color, $text-color, $selected-bg-color, $selected-text-color, $hover-bg-color {
        color: $text-color;
        background-color: $bg-color;
        border-color: $border-color;

        &.selected {
            background-color: $selected-bg-color;
            color: $selected-text-color;
        }

        @media (hover: hover) {
            &:hover:not(.selected) {
                background-color: $hover-bg-color;
            }
        }
    }

    &.secondary { @mixin style-type transparent, theme('colors.gray.300'), theme('colors.gray.900'), theme('colors.blue.600'), theme('colors.white'), theme('colors.blue.200'); }
    &.gray { @mixin style-type transparent, theme('colors.gray.500'), theme('colors.gray.500'), theme('colors.gray.500'), theme('colors.white'), theme('colors.gray.100'); }

    @define-mixin size $font-size, $padding-x, $padding-y, $line-height {
        font-size: $font-size;
        padding: $padding-x $padding-y;
        line-height: $line-height;
    }

    &.md { @mixin size 0.875rem, 0.375rem, 1rem, 1.6; }
    &.sm { @mixin size 0.75rem, 0.25rem, 0.5rem, 1.2; }
}
</style>
