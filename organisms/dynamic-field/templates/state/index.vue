<script lang="ts">
import { get } from 'lodash';
import PStatus from '@/components/molecules/status/PStatus.vue';
import { getColor } from '@/components/organisms/dynamic-field/PDynamicField.toolset';
import { StatusProps } from '@/components/molecules/status/type';
import { StateOptions, TextOptions } from '@/components/organisms/dynamic-field/type/field-schema';
import { StateDynamicFieldProps } from '@/components/organisms/dynamic-field/templates/state/type';
import PAnchor from '@/components/molecules/anchors/PAnchor.vue';

export default {
    name: 'PDynamicFieldState',
    functional: true,
    components: { PStatus, PAnchor },
    props: {
        // eslint-disable-next-line camelcase,vue/prop-name-casing
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: '',
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
    render(h, { props }: {props: StateDynamicFieldProps}) {
        const options: StateOptions = props.options;
        const statusProps: StatusProps = {
            icon: get(options, ['icon', 'image'], null),
            iconColor: getColor(get(options, ['icon', 'color'], null)),
            textColor: getColor(get(options, ['text_color'], null)),
            text: props.data,
        };

        const statusEl = h(PStatus, {
            props: statusProps,
        });

        if (props.options.link) {
            return h(PAnchor, {
                attrs: { href: (props.options as TextOptions).link, target: '_blank' },
            }, statusEl);
        }

        return statusEl;
    },
};
</script>
