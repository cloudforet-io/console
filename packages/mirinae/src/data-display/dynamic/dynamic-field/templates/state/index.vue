<template>
    <span>
        <p-link v-if="options.link"
                :href="options.link"
                action-icon="internal-link"
                new-tab
        >
            <p-status v-bind="statusProps" />
        </p-link>
        <p-status v-else
                  v-bind="statusProps"
        />
    </span>
</template>
<script lang="ts">
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

import { get } from 'lodash';
import type { TranslateResult } from 'vue-i18n';

import type { StateTypeOptions } from '@/data-display/dynamic/dynamic-field/templates/state/type';
import type { DynamicFieldHandler } from '@/data-display/dynamic/dynamic-field/type';
import type { StateOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PStatus from '@/data-display/status/PStatus.vue';
import type { StatusProps } from '@/data-display/status/type';
import PLink from '@/navigation/link/PLink.vue';
import { getColor } from '@/utils/helpers';


export default defineComponent({
    name: 'PDynamicFieldState',
    components: { PStatus, PLink },
    props: {
        options: {
            type: Object as PropType<StateOptions>,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        typeOptions: {
            type: Object as PropType<StateTypeOptions>,
            default: () => ({}),
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        handler: {
            type: Function as PropType<DynamicFieldHandler|undefined>,
            default: undefined,
        },
    },
    setup(props) {
        const statusProps = computed<StatusProps>(() => {
            const options = props.options;
            const data = props.data === undefined || props.data === null ? options.default : props.data;
            const text: TranslateResult = data === null || data === undefined ? '' : String(data);

            return {
                icon: get(options, ['icon', 'image'], null),
                iconColor: getColor(get(options, ['icon', 'color'], null)),
                textColor: getColor(get(options, ['text_color'], null)),
                text: `${options.prefix ?? ''}${text}${options.postfix ?? ''}`,
            };
        });


        return { statusProps };
    },
});
</script>
