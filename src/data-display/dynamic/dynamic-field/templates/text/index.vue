<script lang="ts">
import type { TranslateResult } from 'vue-i18n';

import type { TextDynamicFieldProps } from '@/data-display/dynamic/dynamic-field/templates/text/type';
import type { TextOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PAnchor from '@/inputs/anchors/PAnchor.vue';
import { commaFormatter } from '@/util/helpers';

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
        handler: {
            type: Function,
            default: undefined,
        },
    },
    render(h, { props, data }: {props: TextDynamicFieldProps; data: any}) {
        let text: TranslateResult|number;
        if (props.data === null || props.data === undefined) {
            text = props.options.default === undefined ? '' : props.options.default;
        } else if (typeof props.data === 'number') {
            text = commaFormatter(props.data) ?? '';
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
