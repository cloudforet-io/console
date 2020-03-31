<script>
import { getBindClass } from '@/lib/functional';

export default {
    name: 'PBadge',
    functional: true,
    props: {
        /** @type {string} */
        styleType: {
            type: String,
            default: 'primary',
            validator(value) {
                return [
                    'primary', 'primary-dark', 'primary1', 'primary2', 'primary3', 'primary4',
                    'secondary', 'secondary1', 'secondary2',
                    'other1', 'other2', 'other3', 'other4',
                    'gray', 'gray1', 'gray2', 'gray3',
                    'alert', 'safe', 'dark',
                ].indexOf(value) !== -1;
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
        outline: {
            type: Boolean,
            default: false,
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
        if (props.backgroundColor || props.textColor) {
            newData.staticStyle = data.staticStyle || {};
            if (props.backgroundColor) {
                newData.staticStyle['background-color'] = props.backgroundColor;
            }
            if (props.textColor) {
                newData.staticStyle.color = props.textColor;
            }
        } else {
            newData.class[`badge-${props.styleType}`] = true;
        }
        if (props.outline) newData.class.outline = true;
        return h('span', newData, children);
    },
};
</script>

<style lang="postcss" scoped>
.p-badge {
    display: inline-block;
    border-radius: 100px;
    background-clip: padding-box;
    text-align: center;
    font-size: 0.75rem;
    line-height: 0.875rem;
    letter-spacing: 0;
    padding: 0.1875rem 0.5rem 0.1875rem 0.5rem;
    @apply text-white bg-gray;
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
@mixin badge-color dark, theme('colors.dark'), theme('colors.white');

@mixin badge-color gray, theme('colors.gray'), theme('colors.white');
@mixin badge-color gray1, theme('colors.gray1'), theme('colors.white');
@mixin badge-color gray2, theme('colors.gray2'), theme('colors.dark');
@mixin badge-color gray3, theme('colors.gray3'), theme('colors.gray');

@mixin badge-color other1, theme('colors.other1'), theme('colors.white');
@mixin badge-color other2, theme('colors.other2'), theme('colors.white');
@mixin badge-color other3, theme('colors.other3'), theme('colors.white');
@mixin badge-color other4, theme('colors.other4'), theme('colors.white');

</style>
