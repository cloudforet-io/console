<script lang="ts">
import PDictList from '@/components/molecules/lists/PDictList.vue';
import { DictDynamicFieldProps } from '@/components/organisms/dynamic-field/templates/dict/type';
import PAnchor from '@/components/molecules/anchors/PAnchor.vue';
import { TextOptions } from '@/components/organisms/dynamic-field/type/field-schema';

export default {
    name: 'PDynamicFieldDict',
    functional: true,
    components: { PDictList, PAnchor },
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
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
    render(h, { props }: {props: DictDynamicFieldProps}) {
        let dictEl = h(PDictList, {
            props: {
                dict: props.data === undefined || props.data === null ? props.options.default : props.data,
            },
        });

        if (props.options.link) {
            dictEl = h(PAnchor, {
                attrs: { href: (props.options as TextOptions).link, target: '_blank' },
            }, [dictEl]);
        }
        return dictEl;
    },
};
</script>
