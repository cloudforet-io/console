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
            validator: value => ['text', 'number', 'password'].includes(value),
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

<style lang="postcss">

@define-mixin setInput {
    &.p-text-input {
        @apply border border-gray2 bg-white text-dark;
        min-height: 2rem;
        height: 2rem;
        padding-left: 1rem;
        padding-right: 1rem;
        border-radius: 2px;
        font-size: .875rem;
        line-height: 1.75rem;
        appearance: none;

        &:focus {
            @apply border-dark text-dark;
        }
        &:disabled {
            @apply border-gray2 bg-gray3;
        }
        &.is-invalid {
            @apply border-alert;
        }
    }
}

input {
    @mixin setInput;
}
</style>
