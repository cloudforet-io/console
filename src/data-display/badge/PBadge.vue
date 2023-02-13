<template>
    <span class="p-badge"
          :class="[`badge-${shape}`, ...badgeClassList]"
          :style="[inlineStyles]"
    >
        <slot />
    </span>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';
import type { PropType } from 'vue';

import { get } from 'lodash';

import type { BadgeProps, BadgeStyleType, BadgeType } from '@/data-display/badge/type';
import { BADGE_SHAPE, BADGE_TYPE } from '@/data-display/badge/type';
import { getColor } from '@/utils/helpers';

import colors from '@/styles/colors.cjs';

export default defineComponent<BadgeProps>({
    name: 'PBadge',
    props: {
        badgeType: {
            type: String as PropType<BadgeType>,
            default: BADGE_TYPE.SOLID,
        },
        styleType: {
            type: String as PropType<BadgeStyleType>,
            default: 'primary',
        },
        textColor: {
            type: String,
            default: undefined,
        },
        backgroundColor: {
            type: String,
            default: undefined,
        },
        shape: {
            type: String,
            default: BADGE_SHAPE.ROUND,
        },
    },
    setup(props: BadgeProps) {
        const state = reactive({
            badgeClassList: computed<string[]>(() => {
                if (!props.backgroundColor || !props.textColor) {
                    return [`badge-${props.badgeType}`, `badge-${props.styleType}`];
                }
                return [];
            }),
            inlineStyles: computed(() => {
                // custom case
                if (props.backgroundColor || props.textColor) {
                    const inlineStyle = {} as {[prop: string]: string};
                    if (props.backgroundColor) inlineStyle.backgroundColor = getColor(props.backgroundColor);
                    if (props.textColor) inlineStyle.color = getColor(props.textColor);
                    return inlineStyle;
                }
                // static case
                const styleTypeNum = props.styleType.match(/\d{3}/)?.[0];
                let badgeColor = getColor(props.styleType);
                if (styleTypeNum) {
                    // coral600 -> coral[600]
                    const colStr = props.styleType.match(/[a-z]+/)?.[0];
                    const color = get(colors, `${colStr}[${styleTypeNum}]`);
                    if (color) badgeColor = color;
                }
                if (props.badgeType === BADGE_TYPE.SOLID) {
                    return {
                        backgroundColor: badgeColor,
                        color: getColor('white'),
                    };
                } if (props.badgeType === BADGE_TYPE.SOLID_OUTLINE) {
                    return {
                        backgroundColor: getColor('white'),
                        color: badgeColor,
                        borderColor: badgeColor,
                        borderWidth: '1px',
                    };
                }
                return [];
            }),
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
.p-badge {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    width: fit-content;
    font-size: 0.75rem;
    line-height: 1;
    min-height: 1.25rem;
    overflow: hidden;
    letter-spacing: 0.02rem;
    padding: 0 0.5rem;

    @apply text-white bg-gray;
    &.badge-round {
        @apply rounded-full;
    }
    &.badge-square {
        @apply rounded-md;
    }

    @define-mixin subtle $theme, $bg-color, $text-color {
        &.badge-$(theme) {
            background-color: $bg-color;
            color: $text-color;
        }
    }

    @mixin subtle primary3, theme('colors.primary3'), theme('colors.violet.600');
    @mixin subtle blue200, theme('colors.blue.200'), theme('colors.blue.600');
    @mixin subtle blue300, theme('colors.blue.300'), theme('colors.blue.600');
    @mixin subtle green200, theme('colors.green.200'), theme('colors.green.700');
    @mixin subtle indigo100, theme('colors.indigo.100'), theme('colors.indigo.600');
    @mixin subtle gray200, theme('colors.gray.100'), theme('colors.gray.700');
    @mixin subtle gray200, theme('colors.gray.200'), theme('colors.gray.900');
    @mixin subtle yellow200, theme('colors.yellow.200'), theme('colors.gray.900');
    @mixin subtle red100, theme('colors.red.100'), theme('colors.red.500');
}

</style>
