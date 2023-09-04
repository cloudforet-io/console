<template>
    <span>
        <p-link v-if="options.link"
                :href="options.link"
                target="_blank"
        >
            <p-status v-bind="statusProps" />
        </p-link>
        <p-status v-else
                  v-bind="statusProps"
        />
    </span>
</template>
<script setup lang="ts">
import { get } from 'lodash';
import { computed } from 'vue';

import type { StateDynamicFieldProps } from '@/data-display/dynamic/dynamic-field/templates/state/type';
import PStatus from '@/data-display/status/PStatus.vue';
import type { StatusProps } from '@/data-display/status/type';
import PLink from '@/inputs/link/PLink.vue';
import { getColor } from '@/utils/helpers';

const props = withDefaults(defineProps<StateDynamicFieldProps>(), {
    options: () => ({}),
    typeOptions: () => ({}),
    extraData: () => ({}),
});

const statusProps = computed<StatusProps>(() => {
    const options = props.options;
    const data = props.data === undefined || props.data === null ? options.default : props.data;
    const text: string = data === null || data === undefined ? '' : String(data);

    return {
        icon: get(options, ['icon', 'image'], null),
        iconColor: getColor(get(options, ['icon', 'color'], null)),
        textColor: getColor(get(options, ['text_color'], null)),
        text: `${options.prefix ?? ''}${text}${options.postfix ?? ''}`,
    };
});

</script>
