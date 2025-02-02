<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';


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

/* Query */
const {
    publicDashboardItems,
    privateDashboardItems,
} = useDashboardQuery();

const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
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
        if (state.loading) return '';
        if (value === state.originName) return '';
        if (value.length > 100) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
        if (!value.trim().length) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
        if (state.dashboardNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
        return '';
    },
});
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    publicDashboardItems: computed(() => {
        const _v2DashboardItems = publicDashboardItems.value.filter((d) => d.version !== '1.0');
        if (storeState.isAdminMode) return _v2DashboardItems;
        return _v2DashboardItems.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateDashboardItems: computed(() => privateDashboardItems.value.filter((d) => d.version !== '1.0')),
    originName: computed<string>(() => {
        const _dashboard = [...state.publicDashboardItems, ...state.privateDashboardItems].find((item: DashboardModel) => item.dashboard_id === props.dashboardId);
        return _dashboard?.name || '';
    }),
    dashboardNameList: computed<string[]>(() => {
        if (props.dashboardId.startsWith('private')) return state.privateDashboardItems.map((d) => d.name);
        return state.publicDashboardItems.map((d) => d.name);
    }),
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
    state.loading = true;
    await updateDashboard();
    state.proxyVisible = false;
    state.loading = false;
};

const handleUpdateVisible = (visible) => {
    state.proxyVisible = visible;
};

watch(() => props.visible, (visible) => {
    if (visible) setForm('_name', state.originName);
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
                           :invalid="!state.loading && invalidState._name"
                           :invalid-text="state.loading ? '' : invalidTexts._name"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="_name"
                                  :invalid="invalid"
                                  @update:value="setForm('_name', $event)"
                    />
                </template>
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
