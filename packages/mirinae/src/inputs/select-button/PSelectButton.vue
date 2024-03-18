<template>
    <button class="p-select-button"
            :class="{selected: isSelected, [styleType]: disabled ? false : true, [state.size]: true, disabled}"
            @click="onClick"
            v-on="$listeners"
    >
        <p-i v-if="layout === SELECT_BUTTON_LAYOUT_TYPE.ICON_ONLY"
             :color="state.color"
             :width="state.iconSize"
             :height="state.iconSize"
             :name="iconName"
        />
        <slot v-else />
    </button>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue';



import PI from '@/foundation/icons/PI.vue';
import type { SelectProps } from '@/hooks/select';
import { useSelect } from '@/hooks/select';
import type {
    SelectButtonLayoutType,
    SelectButtonSize,
    SelectButtonStyleType,
} from '@/inputs/select-button/config';
import {
    SELECT_BUTTON_LAYOUT_TYPE,
    SELECT_BUTTON_SIZE,
    SELECT_BUTTON_STYLE_TYPE,
} from '@/inputs/select-button/config';

import { gray, white } from '@/styles/colors.cjs';


interface Props extends SelectProps {
    layout?: SelectButtonLayoutType;
    styleType?: SelectButtonStyleType;
    size?: SelectButtonSize;
    iconName?: string;
}

export default defineComponent<Props>({
    name: 'PSelectButton',
    components: { PI },
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
        disabled: {
            type: Boolean,
            default: false,
        },
        /* select button props */
        layout: {
            type: String,
            default: SELECT_BUTTON_LAYOUT_TYPE.TEXT_ONLY,
            validator(layout: any) {
                return Object.values(SELECT_BUTTON_LAYOUT_TYPE).includes(layout);
            },
        },
        styleType: {
            type: String,
            default: SELECT_BUTTON_STYLE_TYPE.secondary,
            validator(styleType: any) {
                return Object.values(SELECT_BUTTON_STYLE_TYPE).includes(styleType);
            },
        },
        size: {
            type: String,
            default: SELECT_BUTTON_SIZE.md,
            validator(size: any) {
                return Object.values(SELECT_BUTTON_SIZE).includes(size);
            },
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
            color: computed(() => {
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
