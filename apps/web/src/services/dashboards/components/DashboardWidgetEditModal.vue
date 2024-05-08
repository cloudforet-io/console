<script setup lang="ts">
import { defineEmits } from 'vue';

import {
    PButtonModal,
} from '@spaceone/design-system';

import type { UpdatableWidgetInfo } from '@/common/modules/widgets/_types/widget-type';

import DashboardWidgetForm from '@/services/dashboards/components/DashboardWidgetForm.vue';
import {
    useWidgetFormStore,
} from '@/services/dashboards/stores/widget-form-store';


interface Props {
    visible: boolean;
    widgetKey: string;
    widgetConfigId: string;
    templateWidgetId?: string;
}
interface EmitFn {
    (e: 'cancel'): void;
    (e: 'confirm', widgetInfo?: UpdatableWidgetInfo): void;
}
const emit = defineEmits<EmitFn>();
const props = defineProps<Props>();
const widgetFormStore = useWidgetFormStore();
const widgetFormGetters = widgetFormStore.getters;

const handleEditModalCancel = () => {
    emit('cancel');
};
const handleEditModalConfirm = () => {
    emit('confirm', widgetFormGetters.updatedWidgetInfo);
};
</script>

<template>
    <p-button-modal class="dashboard-widget-edit-modal"
                    :visible="props.visible"
                    :header-title="$t('DASHBOARDS.WIDGET.UPDATE_TITLE')"
                    :disabled="!widgetFormGetters.isAllValid"
                    size="sm"
                    @cancel="handleEditModalCancel"
                    @confirm="handleEditModalConfirm"
                    @close="handleEditModalCancel"
    >
        <template #body>
            <dashboard-widget-form :widget-config-id="props.widgetConfigId"
                                   :widget-key="props.widgetKey"
                                   :template-widget-id="props.templateWidgetId"
            />
        </template>
    </p-button-modal>
</template>
