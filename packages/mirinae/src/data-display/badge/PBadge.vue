<script setup lang="ts">
import { get } from 'lodash';
import { computed, reactive } from 'vue';

import type {
    BadgeShape, BadgeStyleType, BadgeType, BadgeFontWeight,
} from '@/data-display/badge/type';
import { BADGE_FONT_WEIGHT, BADGE_SHAPE, BADGE_TYPE } from '@/data-display/badge/type';
import { getColor } from '@/utils/helpers';

import colors from '@/styles/colors';

interface BadgeProps {
    badgeType?: BadgeType;
    styleType?: BadgeStyleType;
    textColor?: string;
    backgroundColor?: string;
    outlineColor?: string;
    shape?: BadgeShape;
    fontWeight?: BadgeFontWeight;
}

const props = withDefaults(defineProps<BadgeProps>(), {
    badgeType: BADGE_TYPE.SOLID,
    styleType: 'primary',
    textColor: undefined,
    backgroundColor: undefined,
    outlineColor: undefined,
    shape: BADGE_SHAPE.ROUND,
    fontWeight: BADGE_FONT_WEIGHT.REGULAR,
});

const state = reactive({
    badgeClassList: computed<string[]>(() => {
        if (!props.backgroundColor || !props.textColor) {
            return [`badge-${props.badgeType}`, `badge-${props.styleType}`];
        }
        return [];
    }),
    inlineStyles: computed(() => {
        // custom case
        if (props.backgroundColor || props.textColor || props.outlineColor) {
            const inlineStyle = {} as {[prop: string]: string};
            if (props.backgroundColor) inlineStyle.backgroundColor = getColor(props.backgroundColor);
            if (props.textColor) inlineStyle.color = getColor(props.textColor);
            if (props.outlineColor) {
                inlineStyle.borderColor = getColor(props.outlineColor);
                inlineStyle.borderWidth = '1px';
            }
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
</script>

<template>
    <span class="p-badge"
          :class="[`badge-${props.shape}`, ...state.badgeClassList, props.fontWeight]"
          :style="[state.inlineStyles]"
    >
        <slot />
    </span>
</template>

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
    &.medium {
        @apply font-medium;
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
    @mixin subtle gray100, theme('colors.gray.100'), theme('colors.gray.700');
    @mixin subtle gray200, theme('colors.gray.200'), theme('colors.gray.900');
    @mixin subtle yellow200, theme('colors.yellow.200'), theme('colors.gray.900');
    @mixin subtle red100, theme('colors.red.100'), theme('colors.red.500');
}

</style>
