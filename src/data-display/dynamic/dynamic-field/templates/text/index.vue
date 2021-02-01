<script lang="ts">
import PAnchor from '@/inputs/anchors/PAnchor.vue';
import { TextOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { TextDynamicFieldProps } from '@/data-display/dynamic/dynamic-field/templates/text/type';
import { ComponentRenderProxy, getCurrentInstance } from '@vue/composition-api';
import { TranslateResult } from 'vue-i18n';

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
        if (props.data === null || props.data === undefined) {
            text = props.options.default === undefined ? '' : props.options.default;
        } else {
            text = typeof props.data === 'string' ? props.data : JSON.stringify(props.data);
        }

        let textEl = h('span', data, text);

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
