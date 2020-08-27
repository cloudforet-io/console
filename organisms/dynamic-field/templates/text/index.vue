<script lang="ts">
import PAnchor from '@/components/molecules/anchors/PAnchor.vue';
import { TextOptions } from '@/components/organisms/dynamic-field/type/field-schema';
import { TextDynamicFieldProps } from '@/components/organisms/dynamic-field/templates/text/type';

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
        let text = (typeof props.data === 'string') ? props.data : JSON.stringify(props.data);
        text = (text === null || text === undefined) ? '' : text;
        if ((props.options as TextOptions).link) {
            return h(PAnchor, {
                ...data,
                attrs: { href: (props.options as TextOptions).link, target: '_blank' },
            }, text);
        }
        return h('span', data, text);
    },
};
</script>
