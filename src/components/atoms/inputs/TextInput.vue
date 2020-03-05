<script>
import { getBindClass } from '@/lib/functional';

export default {
    name: 'PTextInput',
    functional: true,
    model: {
        prop: 'value',
        event: 'onInput',
    },
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
            validator: value => ['text', 'number', 'password'].indexOf(value) !== -1,
        },
        block: {
            type: Boolean,
            default: false,
        },
    },
    render(h, { data, props, listeners }) {
        return h('input', {
            ...data,
            class: {
                ...getBindClass(data.class),
                'p-text-input': true,
                block: props.block,
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
                    // do not change order
                    if (listeners.onInput) listeners.onInput(event.target.value);
                    if (listeners.input) listeners.input(event.target.value);
                },
            },
        });
    },
};
</script>

<style lang="scss">
@mixin setInput() {
    min-height: 2rem;
    height: 2rem;

    padding-left: 1rem;
    padding-right: 1rem;

    border: 1px solid $gray2;
    border-radius: 2px;

    background-color: $white;
    color: $dark;

    font-size: .875rem;
    line-height: 1.75rem;

    &:focus{
        border-color:$dark;
        color: $dark;
    }
    &:disabled{
        border-color:$gray2;
        background-color: $gray3;
    }
    &.block {
        display: block;
        width: 100%;
    }
}

input[type="text"].p-text-input{
    @include setInput();
    -webkit-border-radius: 0px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}


input[type="number"].p-text-input{
    @include setInput();
    -webkit-border-radius: 2px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}

input[type="password"].p-text-input{
    @include setInput();
    -webkit-border-radius: 2px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}
</style>
