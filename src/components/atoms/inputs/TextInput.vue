<script>
import { getBindClass } from '@/lib/functional';

export default {
    name: 'PTextInput',
    functional: true,
    props: {
        value: {
            type: [String, Number],
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: 'text',
            validator: value => ['text', 'password'].indexOf(value) !== -1,
        },
    },
    render(h, { data, props, listeners }) {
        return h('input', {
            ...data,
            class: {
                ...getBindClass(data.class),
                'p-text-input': true,
            },
            attrs: {
                ...data.attrs,
                disabled: props.disabled,
                type: props.type,
            },
            domProps: {
                value: props.value,
            },
            on: {
                ...listeners,
                input: (event) => {
                    listeners.input(event.target.value);
                },
            },
        });
    },
};
</script>

<style lang="scss">
@mixin setInput() {
    min-height: 2rem;

    padding-left: 1rem;
    padding-right: 1rem;

    border: 1px solid $gray2;
    border-radius: 2px;

    background-color: $white;
    color: $gray1;

    font: 14px/28px Arial;

    &:focus{
        border-color:$dark;
        color: $dark;
    }
    &:disabled{
        border-color:$gray2;
        background-color: $gray3;
    }
}

input[type="text"].p-text-input{
    @include setInput();
}

input[type="password"].p-text-input{
    @include setInput();
}
</style>
