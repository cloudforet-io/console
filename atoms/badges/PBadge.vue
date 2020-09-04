<script lang="ts">
import { getBindClass } from '@/components/util/functional-helpers';
import { getColor } from '@/components/util/helpers';
import { BADGE_STYLE } from '@/components/atoms/badges/type';
import PAnchor from '@/components/molecules/anchors/PAnchor.vue';

export default {
    name: 'PBadge',
    functional: true,
    components: { PAnchor },
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
            default: 'round',
        },
        outline: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
            default: undefined,
        },
        target: {
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
            if (props.outline) {
                newData.staticStyle.backgroundColor = 'transparent';
                newData.staticStyle.borderColor = getColor(props.backgroundColor);
                newData.staticStyle.borderWidth = '1px';
                newData.staticStyle.color = getColor(props.backgroundColor);
            } else {
                newData.staticStyle.color = getColor(props.textColor);
                newData.staticStyle.backgroundColor = getColor(props.backgroundColor);
            }
        } else {
            newData.class[`badge-${props.styleType}`] = true;
        }
        if (props.outline) newData.class.outline = true;

        let tag: any = 'span';
        if (props.link) {
            tag = PAnchor;
            newData.attrs = { href: props.link, target: props.target };
        }
        return h(tag, newData, children);
    },
};
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
    height: 1.25rem;
    overflow: hidden;
    letter-spacing: 0.02rem;
    padding: 0 0.5rem;

    @apply text-white bg-gray;
    &.badge-round {
        border-radius: 100px;
    }
    &.badge-square {
        border-radius: 2px;
    }
}

@define-mixin badge-color $theme, $color, $opposite-color, $hover-color {
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

@mixin badge-color primary, theme('colors.primary'), theme('colors.white'), theme('colors.secondary');
@mixin badge-color primary-dark, theme('colors.primary-dark'), theme('colors.white'), theme('colors.secondary');
@mixin badge-color primary1, theme('colors.primary1'), theme('colors.white'), theme('colors.secondary');
@mixin badge-color primary2, theme('colors.primary2'), theme('colors.white'), theme('colors.secondary');
@mixin badge-color primary3, theme('colors.primary3'), theme('colors.white'), theme('colors.secondary');
@mixin badge-color primary4, theme('colors.primary4'), theme('colors.white'), theme('colors.secondary');
@mixin badge-color secondary, theme('colors.secondary'), theme('colors.white'), theme('colors.secondary');
@mixin badge-color secondary1, theme('colors.secondary1'), theme('colors.white'), theme('colors.secondary');
@mixin badge-color secondary2, theme('colors.secondary2'), theme('colors.white'), theme('colors.secondary');
@mixin badge-color alert, theme('colors.alert'), theme('colors.white'), theme('colors.secondary');
@mixin badge-color safe, theme('colors.safe'), theme('colors.white'), theme('colors.secondary');
@mixin badge-color gray900, theme('colors.gray.900'), theme('colors.white'), theme('colors.secondary');
@mixin badge-color gray, theme('colors.gray.default'), theme('colors.white'), theme('colors.secondary');
@mixin badge-color gray200, theme('colors.gray.200'), theme('colors.gray.900'), theme('colors.secondary');
@mixin badge-color gray100, theme('colors.gray.100'), theme('colors.gray.default'), theme('colors.secondary');
@mixin badge-color coral, theme('colors.coral.default'), theme('colors.white'), theme('colors.secondary');
@mixin badge-color yellow, theme('colors.yellow.default'), theme('colors.white'), theme('colors.secondary');

</style>
