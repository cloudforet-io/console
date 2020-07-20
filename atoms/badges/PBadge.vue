<script lang="ts">
import { getBindClass } from '@/components/utils/functional';
import { BADGE_STYLE, BadgeShape } from '@/components/atoms/badges/PBadge.toolset';

export default {
    name: 'PBadge',
    functional: true,
    props: {
        /** @type {string} */
        styleType: {
            type: String,
            default: 'primary',
            validator(value) {
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
            default: BadgeShape.ROUND,
        },
        outline: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
            default: undefined,
        },
    },
    render(h, { props, data, children }) {
        const newData = {
            ...data,
            class: {
                ...getBindClass(data.class),
            },
        };
        newData.class['p-badge'] = true;
        newData.class[`badge-${props.shape}`] = true;
        if (props.backgroundColor || props.textColor) {
            newData.staticStyle = data.staticStyle || {};
            if (!props.outline) {
                if (props.backgroundColor) {
                    newData.staticStyle['background-color'] = props.backgroundColor;
                }
                if (props.textColor) {
                    newData.staticStyle.color = props.textColor;
                }
            } else {
                newData.staticStyle['background-color'] = 'transparent';
                newData.staticStyle['border-color'] = props.backgroundColor;
                newData.staticStyle['border-width'] = '1px';
                newData.staticStyle.color = props.backgroundColor;
            }
        } else {
            newData.class[`badge-${props.styleType}`] = true;
        }
        if (props.outline) newData.class.outline = true;

        let tag = 'span';
        if (props.link) {
            tag = 'a';
            newData.attrs = { href: props.link };
        }
        return h(tag, newData, children);
    },
};
</script>

<style lang="postcss">
.p-badge {
    display: inline-block;
    background-clip: padding-box;
    text-align: center;
    font-size: 0.75rem;
    line-height: 0.875rem;
    letter-spacing: 0.02rem;
    padding: 0.1875rem 0.5rem 0.1875rem 0.5rem;

    @apply text-white bg-gray;
    &.badge-round {
        border-radius: 100px;
    }
    &.badge-square {
        border-radius: 2px;
    }
}

@define-mixin badge-color $theme, $color, $opposite-color {
    .badge-$(theme) {
        background-color: $color;
        color: $opposite-color;
        &.outline {
            background-color: transparent;
            border: 1px solid $color;
            color: $color;
        }
    }
}

@mixin badge-color primary, theme('colors.primary'), theme('colors.white');
@mixin badge-color primary-dark, theme('colors.primary-dark'), theme('colors.white');
@mixin badge-color primary1, theme('colors.primary1'), theme('colors.white');
@mixin badge-color primary2, theme('colors.primary2'), theme('colors.white');
@mixin badge-color primary3, theme('colors.primary3'), theme('colors.white');
@mixin badge-color primary4, theme('colors.primary4'), theme('colors.white');
@mixin badge-color secondary, theme('colors.secondary'), theme('colors.white');
@mixin badge-color secondary1, theme('colors.secondary1'), theme('colors.white');
@mixin badge-color secondary2, theme('colors.secondary2'), theme('colors.white');
@mixin badge-color alert, theme('colors.alert'), theme('colors.white');
@mixin badge-color safe, theme('colors.safe'), theme('colors.white');
@mixin badge-color gray900, theme('colors.gray.900'), theme('colors.white');
@mixin badge-color gray, theme('colors.gray.default'), theme('colors.white');
@mixin badge-color gray200, theme('colors.gray.200'), theme('colors.gray.900');
@mixin badge-color gray100, theme('colors.gray.100'), theme('colors.gray.default');
@mixin badge-color coral, theme('colors.coral.default'), theme('colors.white');
@mixin badge-color yellow, theme('colors.yellow.default'), theme('colors.white');

</style>
