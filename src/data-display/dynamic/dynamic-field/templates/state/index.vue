<script lang="ts">
import { get } from 'lodash';
import PStatus from '@/data-display/status/PStatus.vue';
import { StatusProps } from '@/data-display/status/type';
import { StateOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { StateDynamicFieldProps } from '@/data-display/dynamic/dynamic-field/templates/state/type';
import PAnchor from '@/inputs/anchors/PAnchor.vue';
import { getColor } from '@/util/helpers';
import { TranslateResult } from 'vue-i18n';
import { ComponentRenderProxy, getCurrentInstance } from '@vue/composition-api';

export default {
    name: 'PDynamicFieldState',
    functional: true,
    components: { PStatus, PAnchor },
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
        handler: {
            type: Function,
            default: undefined,
        },
    },
    render(h, { props }: {props: StateDynamicFieldProps}) {
        const options: StateOptions = props.options;

        const data = props.data === undefined || props.data === null ? props.options.default : props.data;
        const text: TranslateResult = data === null || data === undefined ? '' : String(data);

        const statusProps: StatusProps = {
            icon: get(options, ['icon', 'image'], null),
            iconColor: getColor(get(options, ['icon', 'color'], null)),
            textColor: getColor(get(options, ['text_color'], null)),
            text,
        };

        let statusEl = h(PStatus, { props: statusProps });

        if (options.link) {
            statusEl = h(PAnchor, {
                attrs: { href: options.link, target: '_blank' },
            }, [statusEl]);
        }

        return statusEl;
    },
};
</script>
