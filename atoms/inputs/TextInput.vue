<script>
import { getBindClass } from '@/components/atoms/utils/functional';

export default {
    name: 'PTextInput',
    functional: true,
    props: {
        value: String,
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
                type: 'text',
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
input.p-text-input{
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
}
</style>
