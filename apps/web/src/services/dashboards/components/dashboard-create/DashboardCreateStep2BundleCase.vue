<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { useQueryClient } from '@tanstack/vue-query';
import { isEmpty } from 'lodash';

import {
    PDataTable, PI, PToggleButton,
} from '@cloudforet/mirinae';
import { getClonedName } from '@cloudforet/utils';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { DashboardCreateParams, DashboardModel, DashboardType } from '@/api-clients/dashboard/_types/dashboard-type';
import type { PublicDashboardCreateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/create';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';


import { gray } from '@/styles/colors';

import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import {
    DASHBOARD_VARS_SCHEMA_PRESET,
} from '@/services/dashboards/constants/dashboard-vars-schema-preset';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardCreatePageStore } from '@/services/dashboards/stores/dashboard-create-page-store';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';
import type { DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';



const TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'private', label: 'Make Private' },
];
const appContextStore = useAppContextStore();
const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardPageControlState = dashboardPageControlStore.state;
const userStore = useUserStore();
const router = useRouter();
/* Query */
const {
    publicDashboardList,
    privateDashboardList,
    keys,
    api,
} = useDashboardQuery();
const queryClient = useQueryClient();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceMember: computed<boolean>(() => userStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
});
const state = reactive({
    loading: false,
    publicDashboardItems: computed(() => {
        const _v2DashboardItems = publicDashboardList.value.filter((d) => d.version !== '1.0');
        if (storeState.isAdminMode) return _v2DashboardItems;
        return _v2DashboardItems.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateDashboardItems: computed(() => privateDashboardList.value.filter((d) => d.version !== '1.0')),
    bundleCaseType: computed(() => {
        if (!isEmpty(dashboardCreatePageState.selectedOotbIdMap)) return 'TEMPLATE';
        return 'EXISTING';
    }),
    privateMap: {} as Record<string, boolean>,
    tableFields: computed(() => {
        if (storeState.isAdminMode || storeState.isWorkspaceMember) return TABLE_FIELDS.filter((f) => f.name !== 'private');
        if (state.bundleCaseType === 'TEMPLATE') return TABLE_FIELDS.filter((f) => f.name !== 'location');
        return TABLE_FIELDS;
    }),
    // template
    ootbItems: computed<DashboardDataTableItem[]>(() => {
        const _selectedOotbList = dashboardCreatePageState.dashboardTemplates.filter((d) => dashboardCreatePageState.selectedOotbIdMap[d.template_id]);
        return _selectedOotbList.map((d) => ({
            id: d.template_id,
            name: d.name,
            type: 'DASHBOARD',
        }));
    }),
    existingPublicDashboardNameList: computed<string[]>(() => state.publicDashboardItems.map((d) => d.name)),
    existingPrivateDashboardNameList: computed<string[]>(() => state.privateDashboardItems.map((d) => d.name)),
});

/* Util */
const addToNewIdList = (id: string) => {
    dashboardPageControlStore.setNewIdList([
        ...dashboardPageControlState.newIdList,
        id,
    ]);
};

/* Api */
const createBundleOotb = async () => {
    const _promises: Promise<DashboardModel>[] = [];
    const _selectedOotbList = dashboardCreatePageState.dashboardTemplates.filter((d) => dashboardCreatePageState.selectedOotbIdMap[d.template_id]);
    await Promise.allSettled(_selectedOotbList.map(async (ootb) => {
        const _isPrivate = state.privateMap[ootb.template_id];
        const _dashboard = ootb.dashboards[0];
        const _existingDashboardNameList = _isPrivate ? state.existingPrivateDashboardNameList : state.existingPublicDashboardNameList;
        const _dashboardParams: DashboardCreateParams = {
            name: getClonedName(_existingDashboardNameList, ootb.name),
            labels: ootb.labels,
            layouts: _dashboard.layouts,
            options: _dashboard.options,
            tags: { created_by: userStore.state.userId },
            vars_schema: DASHBOARD_VARS_SCHEMA_PRESET,
        };
        if (storeState.isAdminMode) {
            (_dashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.DOMAIN;
        } else if (!storeState.isWorkspaceMember && !_isPrivate) {
            (_dashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.WORKSPACE;
        }
        let _createType: DashboardType = _isPrivate ? 'PRIVATE' : 'PUBLIC';
        if (storeState.isWorkspaceMember) {
            _createType = 'PRIVATE';
        }
        const fetcher = _createType === 'PRIVATE'
            ? api.privateDashboardAPI.create
            : api.publicDashboardAPI.create;
        _promises.push(fetcher(_dashboardParams));
    }));
    const _results = await Promise.allSettled(_promises);
    const _fulfilledResults = _results.filter((r) => r.status === 'fulfilled');
    _fulfilledResults.forEach((v) => addToNewIdList(v.value?.dashboard_id as string));
    if (_results.every((r) => r.status === 'fulfilled')) {
        showSuccessMessage(i18n.t('DASHBOARDS.CREATE.ALT_S_CREATE_DASHBOARD'), '');
    } else {
        const _failedCount = _results.map((r) => r.status !== 'fulfilled').length;
        showErrorMessage(i18n.t('DASHBOARDS.CREATE.ALT_E_CREATE_DASHBOARD', { count: _failedCount }), '');
    }
};

/* Event */
const handleChangePrivate = (id: string, value: boolean) => {
    state.privateMap = {
        ...state.privateMap,
        [id]: value,
    };
};
const handleConfirm = async () => {
    dashboardCreatePageStore.setLoading(true);
    await createBundleOotb();
    await queryClient.invalidateQueries({ queryKey: keys.publicDashboardListQueryKey.value });
    await queryClient.invalidateQueries({ queryKey: keys.privateDashboardListQueryKey.value });
    const dashboardRouteName = storeState.isAdminMode
        ? ADMIN_DASHBOARDS_ROUTE._NAME
        : DASHBOARDS_ROUTE._NAME;
    await router.push({
        name: dashboardRouteName,
    }).catch(() => {});
};

/* Expose */
defineExpose({
    handleConfirm,
});
</script>

<template>
    <div class="dashboard-create-step2-bundle-case">
        <p-data-table :items="state.ootbItems"
                      :fields="state.tableFields"
        >
            <template #col-name-format="{item}">
                <div class="table-column">
                    <p-i :name="item.type === 'DASHBOARD' ? 'ic_service_dashboard' : 'ic_folder'"
                         :color="gray[600]"
                         width="1rem"
                         height="1rem"
                    />
                    <span>{{ item.name }}</span>
                </div>
            </template>
            <template #col-private-format="{item}">
                <div class="table-column">
                    <p-toggle-button :value="state.privateMap[item.id]"
                                     @change-toggle="handleChangePrivate(item.id, $event)"
                    />
                </div>
            </template>
        </p-data-table>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-step2-bundle-case {
    .table-column {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
}
</style>
