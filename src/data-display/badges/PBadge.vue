<template>
    <span class="p-badge"
          :class="allBodyClass"
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

import { BADGE_STYLE } from '@/data-display/badges/type';
import type { Badge, BadgeStyleType } from '@/data-display/badges/type';
import { getColor } from '@/utils/helpers';

export default defineComponent<Badge>({
    name: 'PBadge',
    props: {
        styleType: {
            type: String as PropType<BadgeStyleType>,
            default: 'primary',
            validator(value: string) {
                return Object.keys(BADGE_STYLE).indexOf(value) !== -1;
            },
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
            default: 'round',
        },
        outline: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            allBodyClass: computed(() => {
                const classes: string[] = [];
                if (props.shape) classes.push(`badge-${props.shape}`);
                if (!(props.backgroundColor && props.textColor)) classes.push(`badge-${props.styleType}`);
                if (props.outline) classes.push('outline');
                return classes;
            }),
            inlineStyles: computed(() => {
                const inlineStyle = {} as {[prop: string]: string};
                if (props.backgroundColor) inlineStyle.backgroundColor = getColor(props.backgroundColor);
                if (props.textColor) inlineStyle.color = getColor(props.textColor);
                if ((props.backgroundColor || props.textColor) && props.outline) {
                    inlineStyle.borderColor = getColor(props.backgroundColor);
                    inlineStyle.borderWidth = '1px';
                    inlineStyle.backgroundColor = 'transparent';
                    inlineStyle.color = getColor(props.textColor ? props.textColor : props.backgroundColor);
                }
                return inlineStyle;
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

    @define-mixin badge-color $theme, $color, $opposite-color {
        &.badge-$(theme) {
            background-color: $color;
            color: $opposite-color;
            &.outline {
                background-color: transparent;
                border: 1px solid $color;
                color: $color;
            }
        }
    }

    @define-mixin badge-without-outline $theme, $bg-color, $text-color {
        &.badge-$(theme) {
            background-color: $bg-color;
            color: $text-color;
        }
    }

    @mixin badge-color primary, theme('colors.primary'), theme('colors.white');
    @mixin badge-color primary-dark, theme('colors.primary-dark'), theme('colors.white');
    @mixin badge-color primary1, theme('colors.primary1'), theme('colors.white');
    @mixin badge-color primary2, theme('colors.primary2'), theme('colors.white');
    @mixin badge-color secondary, theme('colors.secondary'), theme('colors.white');
    @mixin badge-color secondary1, theme('colors.secondary1'), theme('colors.white');
    @mixin badge-color alert, theme('colors.alert'), theme('colors.white');
    @mixin badge-color safe, theme('colors.safe'), theme('colors.white');
    @mixin badge-color gray900, theme('colors.gray.900'), theme('colors.white');
    @mixin badge-color gray, theme('colors.gray.default'), theme('colors.white');
    @mixin badge-color coral600, theme('colors.coral.600'), theme('colors.white');
    @mixin badge-color coral500, theme('colors.coral.500'), theme('colors.white');
    @mixin badge-color peacock, theme('colors.peacock.500'), theme('colors.white');
    @mixin badge-color indigo, theme('colors.indigo.500'), theme('colors.white');
    @mixin badge-color indigo100, theme('colors.indigo.100'), theme('colors.indigo.600');

    /* Styles without outline case */
    @mixin badge-without-outline primary3, theme('colors.primary3'), theme('colors.violet.600');
    @mixin badge-without-outline blue200, theme('colors.blue.200'), theme('colors.blue.600');
    @mixin badge-without-outline blue300, theme('colors.blue.300'), theme('colors.blue.600');
    @mixin badge-without-outline green200, theme('colors.green.200'), theme('colors.green.700');
    @mixin badge-without-outline gray200, theme('colors.gray.200'), theme('colors.gray.900');
    @mixin badge-without-outline coral100, theme('colors.coral.100'), theme('colors.coral.600');
    @mixin badge-without-outline peacock200, theme('colors.peacock.200'), theme('colors.peacock.800');
    @mixin badge-without-outline yellow200, theme('colors.yellow.200'), theme('colors.gray.900');
    @mixin badge-without-outline red100, theme('colors.red.100'), theme('colors.red.500');
}

</style>
