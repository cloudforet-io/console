<script lang="ts">
import PAnchor from '@/components/molecules/anchors/PAnchor.vue';
import { TextOptions } from '@/components/organisms/dynamic-field/type/field-schema';
import { TextDynamicFieldProps } from '@/components/organisms/dynamic-field/templates/text/type';
import { computed } from '@vue/composition-api';

export default {
    name: 'PDynamicFieldText',
    functional: true,
    components: { PAnchor },
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number, null],
            default: null,
        },
        typeOptions: {
            type: Object,
            default: () => ({}),
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        beforeCreate: {
            type: Function,
            default: undefined,
        },
        handler: {
            type: Function,
            default: undefined,
        },
    },
    render(h, { props, data }: {props: TextDynamicFieldProps; data: any}) {
        let text: string;
        if (props.data === null || props.data === undefined) text = '';
        else text = typeof props.data === 'string' ? props.data : JSON.stringify(props.data);

        const textEl = h('span', data, text);
        if ((props.options as TextOptions).link) {
            return h(PAnchor, {
                attrs: { href: (props.options as TextOptions).link, target: '_blank' },
                props: { text, showIcon: !!text },
            });
        }
        return textEl;
    },
};
</script>
