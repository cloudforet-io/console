<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    visible: boolean;
    dashboardId: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    dashboardId: '',
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm', value: string): void;
}>();

const dashboardStore = useDashboardStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const {
    forms: {
        _name,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    _name: '',
}, {
    _name(value: string) {
        if (value === dashboardDetailState.name) return '';
        if (value.length > 100) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
        if (!value.trim().length) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
        if (state.dashboardNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
        return '';
    },
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    dashboardNameList: computed<string[]>(() => dashboardStore.getDashboardNameList(dashboardDetailState.dashboardType)),
});

const updateDashboard = async () => {
    try {
        await dashboardStore.updateDashboard(props.dashboardId, {
            dashboard_id: props.dashboardId,
            name: _name.value,
        });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_EDIT_NAME'));
    }
};

const handleConfirm = async () => {
    await updateDashboard();
    dashboardDetailStore.setName(_name.value);
    dashboardDetailStore.setOriginDashboardName(_name.value);
    state.proxyVisible = false;
};

const handleUpdateVisible = (visible) => {
    state.proxyVisible = visible;
};

watch(() => props.visible, (visible) => {
    if (visible) setForm('_name', dashboardDetailState.name);
}, { immediate: true });
</script>

<template>
    <p-button-modal :visible="state.proxyVisible"
                    :header-title="$t('DASHBOARDS.FORM.UPDATE_TITLE')"
                    :disabled="!isAllValid"
                    size="sm"
                    class="dashboard-name-edit-modal"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-field-group :label="$t('DASHBOARDS.FORM.LABEL_DASHBOARD_NAME')"
                           :invalid="invalidState._name"
                           :invalid-text="invalidTexts._name"
                           required
            >
                <p-text-input :value="_name"
                              :invalid="invalidState._name"
                              @update:value="setForm('_name', $event)"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.dashboard-name-edit-modal {
    .p-text-input {
        @apply w-full;
    }
}
</style>
