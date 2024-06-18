<script lang="ts" setup>
import { onMounted, reactive } from 'vue';

import { PFieldTitle, PToggleButton } from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { LegendOptions, WidgetFieldComponentProps, WidgetFieldComponentEmit } from '@/common/modules/widgets/types/widget-field-type';


const emit = defineEmits<WidgetFieldComponentEmit<boolean|undefined>>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<LegendOptions>>(), {
    widgetFieldSchema: () => ({
        options: {
            default: false,
        },
    }),
});

const state = reactive({
    proxyValue: useProxyValue<boolean>('value', props, emit),
});

const handleUpdateValue = (value: boolean) => {
    state.proxyValue = value;
    emit('update:value', value);
};

onMounted(() => {
    emit('update:is-valid', true);
    state.proxyValue = props.value;
});
</script>

<template>
    <div class="widget-field-legend">
        <p-field-title>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.LEGEND') }}</p-field-title>
        <p-toggle-button :value="state.proxyValue"
                         @update:value="handleUpdateValue"
        />
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-legend {
    @apply flex items-center gap-1;
}
</style>
