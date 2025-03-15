<template>
    <button class="p-select-button"
            :class="{
                selected: isSelected,
                [styleType]: disabled ? false : true,
                [state.size]: true,
                disabled,
                ['icon-layout']: layout === SELECT_BUTTON_LAYOUT_TYPE.ICON_ONLY,
            }"
            @click="onClick"
            v-on="$listeners"
    >
        <p-i v-if="layout === SELECT_BUTTON_LAYOUT_TYPE.ICON_ONLY"
             :color="state.iconColor"
             :width="state.iconSize"
             :height="state.iconSize"
             :name="iconName"
        />
        <slot v-else />
    </button>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { computed, defineComponent, reactive } from 'vue';



import type {
    SelectButtonLayoutType,
    SelectButtonSize,
    SelectButtonStyleType,
} from '@/controls/select-button/config';
import {
    SELECT_BUTTON_LAYOUT_TYPE,
    SELECT_BUTTON_SIZE,
    SELECT_BUTTON_STYLE_TYPE,
} from '@/controls/select-button/config';
import PI from '@/foundation/icons/PI.vue';
import type { SelectionPredicate } from '@/hooks/use-select/use-select';
import { useSelect } from '@/hooks/use-select/use-select';

import { gray, white } from '@/styles/colors.cjs';


export default defineComponent({
    name: 'PSelectButton',
    components: { PI },
    model: {
        prop: 'selected',
        event: 'change',
    },
    props: {
        /* select props */
        selected: {
            type: [Boolean, String, Number, Object, Array] as PropType<any | any[]>,
            default: undefined,
        },
        value: {
            type: [Boolean, String, Number, Object, Array] as PropType<any>,
            default: true,
        },
        predicate: {
            type: Function as PropType<SelectionPredicate>,
            default: undefined,
        },
        multiSelectable: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        /* select button props */
        layout: {
            type: String as PropType<SelectButtonLayoutType>,
            default: SELECT_BUTTON_LAYOUT_TYPE.TEXT_ONLY,
        },
        styleType: {
            type: String as PropType<SelectButtonStyleType>,
            default: SELECT_BUTTON_STYLE_TYPE.secondary,
        },
        size: {
            type: String as PropType<SelectButtonSize>,
            default: SELECT_BUTTON_SIZE.md,
        },
        iconName: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const {
            isSelected,
            getSelected,
        } = useSelect({
            value: computed(() => props.value),
            selected: computed(() => props.selected),
            predicate: computed(() => props.predicate),
            multiSelectable: computed(() => props.multiSelectable),
            disabled: computed(() => props.disabled),
        });

        const state = reactive({
            size: computed(() => {
                if (props.layout === SELECT_BUTTON_LAYOUT_TYPE.ICON_ONLY) {
                    return props.size === SELECT_BUTTON_SIZE.md ? 'icon-md' : 'icon-sm';
                }
                return props.size;
            }),
            iconColor: computed(() => {
                if (props.styleType === SELECT_BUTTON_STYLE_TYPE.secondary) {
                    if (isSelected.value) {
                        return white;
                    }
                    return gray[900];
                } if (props.styleType === SELECT_BUTTON_STYLE_TYPE.gray) {
                    if (isSelected.value) {
                        return white;
                    }
                    return gray[500];
                }
                return '';
            }),
            iconSize: computed(() => {
                if (props.size === SELECT_BUTTON_SIZE.md) {
                    return '1.5rem';
                }
                return '1rem';
            }),
        });

        /* event */
        const onClick = () => {
            if (props.disabled) {
                return;
            }
            const newSelected = getSelected();
            if (props.multiSelectable) {
                emit('change', newSelected, !isSelected.value);
            } else {
                emit('change', newSelected, true);
            }
        };

        return {
            state,
            isSelected,
            onClick,
            SELECT_BUTTON_LAYOUT_TYPE,
        };
    },
});
</script>

<style lang="postcss" scoped>
.p-select-button {
    @apply border rounded;
    border-width: 1px;
    border-style: solid;
    padding: 0.25rem;

    &.icon-layout {
        line-height: 0;
    }

    &.disabled {
        @apply border border-solid border-gray-300;
        cursor: not-allowed;
        opacity: 0.5;
        &:hover {
            @apply bg-white;
        }
    }

    @define-mixin style-type $bg-color, $border-color, $text-color, $selected-bg-color, $selected-text-color, $hover-bg-color {
        color: $text-color;
        background-color: $bg-color;
        border-color: $border-color;

        &.selected {
            background-color: $selected-bg-color;
            border-color: $selected-bg-color;
            color: $selected-text-color;
        }

        @media (hover: hover) {
            &:hover:not(.selected) {
                background-color: $hover-bg-color;
            }
        }
    }

    &.secondary { @mixin style-type transparent, theme('colors.gray.300'), theme('colors.gray.900'), theme('colors.blue.600'), theme('colors.white'), theme('colors.blue.200') ; }
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
