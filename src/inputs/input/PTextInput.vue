<script lang="ts">
import { getBindClass } from '@/util/functional-helpers';
import { inputTypes } from '@/inputs/input/config';

export default {
    name: 'PTextInput',
    functional: true,
    model: {
        prop: 'value',
        event: 'input',
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
            validator: value => inputTypes.includes(value),
        },
        block: {
            type: Boolean,
            default: false,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
    },
    render(h, {
        data, props, listeners, slots,
    }) {
        const childrenEl = [];

        /* Input */
        childrenEl.push(
            h('input', {
                ...data,
                attrs: {
                    ...data.attrs,
                    disabled: props.disabled,
                    type: props.type,
                },
                domProps: {
                    value: props.value,
                },
                ...(data.directives?.length && {
                    directives: [data.directives[0]],
                }),
                on: {
                    ...listeners,
                    input: (event) => {
                        if (listeners.input) {
                            if (Array.isArray(listeners.input)) {
                                listeners.input.forEach((d) => { d(event.target.value); });
                            } else listeners.input(event.target.value);
                        }
                    },
                },
            }),
        );

        /* Slots */
        const allSlots = slots ? slots() : {};
        if (allSlots['right-extra']) {
            childrenEl.push(
                h('span', {
                    class: 'right-extra',
                }, allSlots['right-extra']),
            );
        }

        return h('span', {
            class: {
                ...getBindClass(data.class),
                'p-text-input': true,
                block: props.block,
            },
            staticStyle: data.staticStyle,
            style: data.style,
        }, [
            h('span', {
                class: {
                    'input-container': true,
                    invalid: props.invalid,
                    disabled: props.disabled,
                },
            }, childrenEl),
        ]);
    },
};
</script>

<style lang="postcss">
.p-text-input {
    display: inline-block;
    width: 15rem;
    &.block {
        @apply w-full;
    }
    .input-container {
        @apply w-full inline-flex border bg-white text-gray-900;
        min-height: 2rem;
        height: 2rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        border-radius: 2px;
        font-size: 0.875rem;
        line-height: 2rem;
        &.invalid {
            @apply border-alert;
        }
        &.disabled {
            @apply border-gray-200 bg-gray-100
        }
        &:focus-within {
            @apply border-secondary;
        }
        &:hover:not(.disabled) {
            @apply border-secondary;
        }
    }
    input {
        @apply truncate;
        display: inline-block;
        flex-grow: 1;
        border-width: 0;
        height: 100%;
        appearance: none;
        line-height: inherit;
        font-size: inherit;
        color: inherit;
        &:disabled {
            @apply bg-transparent border-0;
        }
        &::placeholder {
            @apply text-gray-300;
        }
    }
    .right-extra {
        @apply text-gray-400;
        display: inline-flex;
        margin-left: 0.5rem;
        flex-shrink: 0;
        height: 100%;
        overflow: hidden;
        line-height: inherit;
        font-size: inherit;
        color: inherit;
    }
}

</style>
