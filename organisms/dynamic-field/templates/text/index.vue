<script lang="ts">
import PAnchor from '@/components/molecules/anchors/PAnchor.vue';
import { TextOptions } from '@/components/organisms/dynamic-field/type/field-schema';
import { TextDynamicFieldProps } from '@/components/organisms/dynamic-field/templates/text/type';
import { ComponentRenderProxy, getCurrentInstance } from '@vue/composition-api';
import { TranslateResult } from 'vue-i18n';
import PAbbreviation from '@/components/atoms/abbreviation/PAbbreviation.vue';

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
            type: [String, Object, Array, Boolean, Number],
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
        const vm = getCurrentInstance() as ComponentRenderProxy;

        let text: TranslateResult;
        if (props.options.translation_id) text = vm.$t(props.options.translation_id);
        else if (props.data === null || props.data === undefined) text = '';
        else text = typeof props.data === 'string' ? props.data : JSON.stringify(props.data);

        let textEl = h('span', data, text);

        if (props.options.description) {
            textEl = h(PAbbreviation, {
                attrs: { description: props.options.description },
            }, [textEl]);
        }

        if (props.options.link) {
            textEl = h(PAnchor, {
                attrs: { href: (props.options as TextOptions).link, target: '_blank' },
                props: { text, showIcon: !!text },
            }, [textEl]);
        }

        return textEl;
    },
};
</script>
