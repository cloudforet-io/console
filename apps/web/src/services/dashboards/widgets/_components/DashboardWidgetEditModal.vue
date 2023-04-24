<template>
    <p-button-modal class="dashboard-widget-edit-modal"
                    :visible.sync="state.proxyVisible"
                    :header-title="$t('DASHBOARDS.WIDGET.UPDATE_TITLE')"
                    :disabled="!widgetFormState.isValid"
                    size="sm"
                    @confirm="handleEditModalConfirm"
    >
        <template #body>
            <dashboard-widget-input-form :widget-config-id="props.widgetConfigId"
                                         :widget-key="props.widgetKey"
            />
        </template>
    </p-button-modal>
</template>
<script setup lang="ts">
import { defineEmits, reactive } from 'vue';

import {
    PButtonModal,
} from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';

import DashboardWidgetInputForm from '@/services/dashboards/dashboard-customize/modules/dashboard-widget-input-form/DashboardWidgetInputForm.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import { useWidgetFormStore } from '@/services/dashboards/store/widget-form';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';


interface Props {
    visible: boolean;
    widgetKey: string;
    widgetConfigId: string;
}
interface EmitFn {
    (e: string, value: string): void;
    (e: 'refresh'): void;
}
const emit = defineEmits<EmitFn>();
const props = defineProps<Props>();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});
const dashboardDetailStore = useDashboardDetailInfoStore();
const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.$state;

const handleEditModalConfirm = () => {
    const widgetInfo: Partial<DashboardLayoutWidgetInfo> = {
        widget_name: widgetFormState.widgetConfigId ?? '',
        title: widgetFormState.widgetTitle ?? '',
        inherit_options: widgetFormState.inheritOptions ?? {},
        widget_options: widgetFormState.widgetOptions ?? {},
        schema_properties: widgetFormState.schemaProperties ?? [],
    };
    dashboardDetailStore.updateWidgetInfo(props.widgetKey, widgetInfo);
    dashboardDetailStore.updateWidgetValidation(true, props.widgetKey);
    state.proxyVisible = false;
    emit('refresh');
};
</script>
