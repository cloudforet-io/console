<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput, PToggleButton,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { RESOURCE_GROUP } from '@/schema/_common/constant';
import { DASHBOARD_TYPE } from '@/schema/dashboard/_constants/dashboard-constant';
import type { DashboardType } from '@/schema/dashboard/_types/dashboard-type';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useProxyValue } from '@/common/composables/proxy-state';

import { getSharedDashboardLayouts } from '@/services/dashboards/helpers/dashboard-share-helper';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import type { CreateDashboardParameters } from '@/services/dashboards/types/dashboard-api-schema-type';


interface Props {
    visible: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
}>();

const { getProperRouteLocation } = useProperRouteLocation();
const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

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
    name(value: string) {
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
    dashboardType: computed<DashboardType>(() => {
        if (state.isPrivate) return 'PRIVATE';
        return 'PUBLIC';
    }),
    isPrivate: true,
    targetDashboard: computed(() => dashboardDetailState.dashboardInfo),
    dashboardNameList: computed<string[]>(() => {
        if (storeState.isAdminMode) return dashboardGetters.domainItems.map((item) => item.name);
        return dashboardStore.getDashboardNameList(state.dashboardType);
    }),
});

const handleUpdateVisible = (visible) => {
    state.proxyVisible = visible;
};

const cloneDashboard = async (): Promise<string|undefined> => {
    try {
        state.loading = true;
        const _sharedLayouts = await getSharedDashboardLayouts(dashboardDetailState.dashboardLayouts, dashboardDetailState.dashboardWidgets);
        const _sharedDashboard: CreateDashboardParameters = {
            name: name.value,
            layouts: _sharedLayouts,
            options: dashboardDetailState.options || {},
            labels: dashboardDetailState.labels || [],
            tags: { created_by: store.state.user.userId },
        };
        if (storeState.isAdminMode) {
            state.dashboardType = DASHBOARD_TYPE.PUBLIC;
            _sharedDashboard.resource_group = RESOURCE_GROUP.DOMAIN;
        } else if (state.dashboardType !== 'PRIVATE') {
            _sharedDashboard.resource_group = state.targetDashboard.resource_group || RESOURCE_GROUP.WORKSPACE;
        }
        const res = await dashboardStore.createDashboard(state.dashboardType, _sharedDashboard);
        return res.dashboard_id;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_CREATE_DASHBOARD'));
    } finally {
        state.loading = false;
    }
    return undefined;
};

/* Event */
const handleChangePrivate = (val: boolean) => {
    state.isPrivate = val;
};
const handleConfirm = async () => {
    if (!isAllValid) return;
    const clonedDashboardId = await cloneDashboard();
    state.proxyVisible = false;
    if (clonedDashboardId) {
        await SpaceRouter.router.push(getProperRouteLocation({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: { dashboardId: clonedDashboardId },
        }));
    }
};

const init = () => {
    const _targetDashboard = dashboardDetailState.name;
    initForm('name', `Clone - ${_targetDashboard}`);
};

watch(() => props.visible, (visible) => {
    if (visible !== state.proxyVisible) state.proxyVisible = visible;
    init();
});
</script>

<template>
    <p-button-modal :visible="state.proxyVisible"
                    :header-title="$t('DASHBOARDS.FORM.CLONE_TITLE')"
                    size="sm"
                    :disabled="!isAllValid"
                    :loading="state.loading"
                    class="dashboard-clone-modal"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-field-group :label="$t('DASHBOARDS.FORM.LABEL_DASHBOARD_NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <template #default="{ invalid }">
                    <p-text-input :value="name"
                                  :invalid="invalid"
                                  @update:value="setForm('name', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group v-if="!storeState.isAdminMode"
                           :label="$t('DASHBOARDS.FORM.LABEL_MAKE_PRIVATE')"
                           required
                           class="mt-6"
            >
                <p-toggle-button :value="state.isPrivate"
                                 @change-toggle="handleChangePrivate"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.dashboard-clone-modal {
    .p-text-input {
        @apply w-full;
    }
}
</style>
