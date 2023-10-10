<script setup lang="ts">
import { defineEmits } from 'vue';

import {
    PButtonModal,
} from '@spaceone/design-system';

import DashboardWidgetInputForm from '@/services/dashboards/shared/dashboard-widget-input-form/DashboardWidgetInputForm.vue';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';

interface Props {
    visible: boolean;
    widgetKey: string;
    widgetConfigId: string;
}
interface EmitFn {
    (e: 'cancel'): void;
    (e: 'confirm', widgetInfo?: Partial<DashboardLayoutWidgetInfo>): void;
}
const emit = defineEmits<EmitFn>();
const props = defineProps<Props>();
const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.$state;

const handleEditModalCancel = () => {
    emit('cancel');
};
const handleEditModalConfirm = () => {
    emit('confirm', widgetFormStore.updatedWidgetInfo);
};
</script>

<template>
    <p-button-modal class="dashboard-widget-edit-modal"
                    :visible="props.visible"
                    :header-title="$t('DASHBOARDS.WIDGET.UPDATE_TITLE')"
                    :disabled="!widgetFormState.isValid"
                    size="sm"
                    @cancel="handleEditModalCancel"
                    @confirm="handleEditModalConfirm"
                    @close="handleEditModalCancel"
    >
        <template #body>
            <dashboard-widget-input-form :widget-config-id="props.widgetConfigId"
                                         :widget-key="props.widgetKey"
            />
        </template>
    </p-button-modal>
</template>
