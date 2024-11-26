<script lang="ts" setup>
import { onMounted, reactive } from 'vue';

import {
    PFieldTitle, PToggleButton,
} from '@cloudforet/mirinae';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { TooltipNumberFormatOptions, TooltipNumberFormatValue } from '@/common/modules/widgets/_widget-fields/tooltip-number-format/type';
import type {
    WidgetFieldComponentEmit,
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';


const emit = defineEmits<WidgetFieldComponentEmit<TooltipNumberFormatValue>>();
const props = withDefaults(defineProps<WidgetFieldComponentProps<TooltipNumberFormatOptions, TooltipNumberFormatValue>>(), {
    widgetFieldSchema: () => ({
        options: {
            default: false,
        },
    }),
});

const state = reactive({
    proxyValue: useProxyValue<TooltipNumberFormatValue>('value', props, emit),
});

const handleUpdateToggleValue = (val: boolean) => {
    if (val) {
        state.proxyValue = {
            toggleValue: val,
        };
    } else {
        state.proxyValue = {
            toggleValue: val,
        };
    }
};

onMounted(() => {
    emit('update:is-valid', true);
});
</script>

<template>
    <div class="widget-field-tooltip-number-format">
        <p-field-title>{{ $t('COMMON.WIDGETS.TOOLTIP_NUMBER_FORMAT.TOOLTIP_NUMBER_FORMAT') }}</p-field-title>
        <p-toggle-button :value="state.proxyValue?.toggleValue"
                         @update:value="handleUpdateToggleValue"
        />
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-tooltip-number-format {
    @apply flex items-center gap-1 justify-between;
}
</style>
