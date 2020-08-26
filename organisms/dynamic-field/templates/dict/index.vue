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
            type: Object,
            required: true,
        },
        typeOptions: {
            type: Object,
            default: () => ({}),
        },
    },
    render(h, { props }: {props: DictDynamicFieldProps}) {
        const dictEl = h(PDictList, {
            props: {
                dict: props.data,
            },
        });
        if (props.options.link) {
            return h(PAnchor, {
                attrs: { href: (props.options as TextOptions).link, target: '_blank' },
            }, dictEl);
        }
        return dictEl;
    },
};
</script>
