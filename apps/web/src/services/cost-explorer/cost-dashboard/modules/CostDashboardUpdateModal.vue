<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';
import {
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useCostExplorerDashboardStore } from '@/services/cost-explorer/store/cost-explorer-dashboard-store';


interface Props {
    visible: boolean;
    dashboardId: string;
    dashboardName: string;
}

const props = withDefaults(defineProps<Props>(), {
    dashboardId: '',
    dashboardName: '',
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm', value: string): void;
}>();
const { t } = useI18n();

const costExplorerDashboardStore = useCostExplorerDashboardStore();

const {
    forms: {
        name,
    },
    setForm,
    initForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: '',
}, {
    name(value: string) { return value.trim().length ? '' : t('DASHBOARDS.FORM.REQUIRED'); },
});
const state = reactive({
    proxyVisible: props.visible,
});

const updateDashboard = async () => {
    try {
        if (props.dashboardId.startsWith('user')) {
            await SpaceConnector.client.costAnalysis.userDashboard.update({
                user_dashboard_id: props.dashboardId,
                name: name.value,
            });
        } else {
            await SpaceConnector.client.costAnalysis.publicDashboard.update({
                public_dashboard_id: props.dashboardId,
                name: name.value,
            });
        }
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('DASHBOARDS.FORM.ALT_E_UPDATE_DASHBOARD_NAME'));
    }
};

const handleConfirm = async () => {
    await updateDashboard();
    await costExplorerDashboardStore.setDashboardList();
    emit('update:visible', false);
    emit('confirm', name.value);
};

const handleUpdateVisible = (visible) => {
    state.proxyVisible = visible;
    emit('update:visible', visible);
};

const init = () => {
    initForm('name', props.dashboardName);
};

watch(() => props.visible, (visible) => {
    if (visible !== state.proxyVisible) state.proxyVisible = visible;
    init();
});

</script>

<template>
    <p-button-modal :visible="state.proxyVisible"
                    :header-title="t('BILLING.COST_MANAGEMENT.DASHBOARD.UPDATE_DASHBOARD')"
                    :disabled="!isAllValid"
                    size="sm"
                    class="cost-dashboard-update-modal"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-field-group :label="t('BILLING.COST_MANAGEMENT.DASHBOARD.DASHBOARD_NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <p-text-input :value="name"
                              :invalid="invalidState.name"
                              @update:value="setForm('name', $event)"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.cost-dashboard-update-modal {
    .p-text-input {
        @apply w-full;
    }
}
</style>
