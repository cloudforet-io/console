<script lang="ts">
import { inputTypes } from '@/inputs/input/config';
import { getBindClass } from '@/util/functional-helpers';

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
        const childrenEl: any[] = [];

        /* Input */
        childrenEl.push(
            h('input', {
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
            staticClass: data.staticClass,
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
