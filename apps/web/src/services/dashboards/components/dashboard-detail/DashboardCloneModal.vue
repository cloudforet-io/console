<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PTextInput, PToggleButton,
} from '@cloudforet/mirinae';
import { getClonedName } from '@cloudforet/utils';

import { SpaceRouter } from '@/router';
import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { DashboardType, DashboardModel } from '@/schema/dashboard/_types/dashboard-type';
import type { WidgetModel } from '@/schema/dashboard/_types/widget-type';
import type { PrivateDashboardCreateParameters } from '@/schema/dashboard/private-dashboard/api-verbs/create';
import type { PrivateWidgetListParameters } from '@/schema/dashboard/private-widget/api-verbs/list';
import type { PublicDashboardCreateParameters } from '@/schema/dashboard/public-dashboard/api-verbs/create';
import type { PublicWidgetListParameters } from '@/schema/dashboard/public-widget/api-verbs/list';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useProxyValue } from '@/common/composables/proxy-state';

import { getSharedDashboardLayouts } from '@/services/dashboards/helpers/dashboard-share-helper';
import { migrateLegacyWidgetOptions } from '@/services/dashboards/helpers/widget-migration-helper';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';



type DashboardCreateParameters = PublicDashboardCreateParameters | PrivateDashboardCreateParameters;
interface Props {
    visible: boolean;
    dashboardId: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    dashboardId: '',
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
}>();

const { getProperRouteLocation } = useProperRouteLocation();
const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();
const dashboardStore = useDashboardStore();
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardPageControlGetters = dashboardPageControlStore.getters;
const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: '',
}, {
    name(value: string) {
        if (value.length > 100) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
        if (!value.trim().length) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
        if (state.dashboardNameList.find((d) => d === value)) {
            return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
        }
        return '';
    },
});
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    dashboardType: computed<DashboardType>(() => {
        if (state.isPrivate) return 'PRIVATE';
        return 'PUBLIC';
    }),
    isPrivate: true,
    targetDashboard: computed<DashboardModel>(() => dashboardPageControlGetters.allDashboardItems.find((item: DashboardModel) => item.dashboard_id === props.dashboardId)),
    dashboardNameList: computed<string[]>(() => {
        if (props.dashboardId.startsWith('private')) {
            return dashboardPageControlGetters.privateDashboardItems.map((item) => item.name);
        }
        return dashboardPageControlGetters.publicDashboardItems.map((item) => item.name);
    }),
});

/* Api */
const listDashboardWidgets = async (dashboardId: string): Promise<WidgetModel[]> => {
    try {
        const isPrivate = dashboardId.startsWith('private');
        const fetcher = isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.list
            : SpaceConnector.clientV2.dashboard.publicWidget.list;
        const res = await fetcher<PublicWidgetListParameters|PrivateWidgetListParameters, ListResponse<WidgetModel>>({
            dashboard_id: dashboardId,
        });
        const [_isMigrated, widgets] = migrateLegacyWidgetOptions(res.results || []);
        if (_isMigrated) {
            return widgets;
        }
        return res.results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

const handleUpdateVisible = (visible) => {
    state.proxyVisible = visible;
};

const cloneDashboard = async (): Promise<string|undefined> => {
    try {
        state.loading = true;
        const _dashboardWidgets = await listDashboardWidgets(props.dashboardId);

        const _sharedLayouts = await getSharedDashboardLayouts(state.targetDashboard.layouts, _dashboardWidgets, storeState.costDataSource);
        const _sharedDashboard: DashboardCreateParameters = {
            name: name.value,
            layouts: _sharedLayouts,
            options: state.targetDashboard.options || {},
            labels: state.targetDashboard.labels || [],
            tags: { created_by: store.state.user.userId },
        };
        if (storeState.isAdminMode) {
            state.isPrivate = false;
            (_sharedDashboard as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.DOMAIN;
        } else if (state.dashboardType !== 'PRIVATE') {
            (_sharedDashboard as PublicDashboardCreateParameters).resource_group = state.targetDashboard?.resource_group || RESOURCE_GROUP.WORKSPACE;
        }
        const res = await dashboardStore.createDashboard(state.dashboardType, _sharedDashboard);
        return res.dashboard_id;
    } catch (e) {
        showErrorMessage(i18n.t('DASHBOARDS.FORM.ALT_E_CLONE_DASHBOARD'), e);
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

watch(() => props.visible, (visible) => {
    if (visible) {
        const _clonedName = getClonedName(state.dashboardNameList, state.targetDashboard.name);
        setForm('name', _clonedName);
    }
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
