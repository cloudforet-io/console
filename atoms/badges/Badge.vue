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
        return h('span', newData, children);
    },
};
</script>

<style lang="scss">
.p-badge {
    all: unset;
    display: inline-block;
    border-radius: 100px;
    background-clip: padding-box;
    text-align: center;
    font-size: .75rem;
    line-height: .875rem;
    color: $white;
    background-color:$gray;
    letter-spacing: 0;
    padding:  0.1875rem 0.5rem 0.1875rem 0.5rem;
}

@mixin badge-color($theme, $color, $oposite-color) {
    &.badge-#{$theme} {
        background-color: $color;
        color: $oposite-color;
    }
}
@mixin hover-color($theme, $color, $oposite-color) {
    &.badge-#{$theme} {
        background-color: $color;
        color: $oposite-color;
    }
}

@include badge-color('primary', $primary, $white);
@include badge-color('primary-dark', $primary-dark, $white);
@include badge-color('primary1', $primary1, $white);
@include badge-color('primary2', $primary2, $white);
@include badge-color('primary3', $primary3, $white);
@include badge-color('primary4', $primary4, $white);

@include badge-color('secondary', $secondary,$white);
@include badge-color('secondary1', $secondary1,$white);
@include badge-color('secondary2', $secondary2,$white);

@include badge-color('alert', $alert, $white);
@include badge-color('safe', $safe, $white);
@include badge-color('dark', $dark, $white);

@include badge-color('gray', $gray, $white);
@include badge-color('gray1', $gray1, $white);
@include badge-color('gray2', $gray2, $dark);
@include badge-color('gray3', $gray3, $gray);

@include badge-color('other1', $other1, $white);
@include badge-color('other2', $other2, $white);
@include badge-color('other3', $other3, $white);
@include badge-color('other4', $other4, $white);

</style>
