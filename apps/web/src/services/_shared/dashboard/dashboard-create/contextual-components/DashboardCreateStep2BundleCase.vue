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
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardCreateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/create';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';


import { gray } from '@/styles/colors';

import { useDashboardSharedContext } from '@/services/_shared/dashboard/core/composables/_internal/use-dashboard-shared-context';
import { useDashboardTemplateQuery } from '@/services/_shared/dashboard/dashboard-create/composables/use-dashboard-template-query';
import { useDashboardCreatePageStore } from '@/services/_shared/dashboard/dashboard-create/stores/dashboard-create-page-store';
import {
    DASHBOARD_VARS_SCHEMA_PRESET,
} from '@/services/_shared/dashboard/dashboard-detail/constants/dashboard-vars-schema-preset';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardTreeControlStore } from '@/services/dashboards/stores/dashboard-tree-control-store';
import type { DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

interface Props {
    dashboardItems: Array<DashboardModel>;
}

const props = defineProps<Props>();

const TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'private', label: 'Make Private' },
];
const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;
const dashboardTreeControlStore = useDashboardTreeControlStore();
const dashboardTreeControlState = dashboardTreeControlStore.state;
const authorizationStore = useAuthorizationStore();
const userStore = useUserStore();
const router = useRouter();
const {
    isAdminMode, entryPoint, projectContextType, projectGroupOrProjectId,
} = useDashboardSharedContext();

const dashboardTemplateQuery = useDashboardTemplateQuery();
const storeState = reactive({
    isWorkspaceMember: computed<boolean>(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
});
const state = reactive({
    loading: false,
    publicDashboardItems: computed(() => props.dashboardItems.filter((d) => d.dashboard_id.startsWith('public'))),
    privateDashboardItems: computed(() => props.dashboardItems.filter((d) => d.dashboard_id.startsWith('private'))),
    bundleCaseType: computed(() => {
        if (!isEmpty(dashboardCreatePageState.selectedOotbIdMap)) return 'TEMPLATE';
        return 'EXISTING';
    }),
    privateMap: {} as Record<string, boolean>,
    tableFields: computed(() => {
        if (isAdminMode.value
            || entryPoint.value === 'PROJECT'
            || (entryPoint.value === 'DASHBOARDS' && storeState.isWorkspaceMember)) return TABLE_FIELDS.filter((f) => f.name !== 'private');
        if (state.bundleCaseType === 'TEMPLATE') return TABLE_FIELDS.filter((f) => f.name !== 'location');
        return TABLE_FIELDS;
    }),
    // template
    ootbItems: computed<DashboardDataTableItem[]>(() => {
        const _selectedOotbList = dashboardTemplateQuery.data?.value?.filter((d) => dashboardCreatePageState.selectedOotbIdMap[d.template_id]) || [];
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
    dashboardTreeControlStore.setNewIdList([
        ...dashboardTreeControlState.newIdList,
        id,
    ]);
};

/* Api */
const queryClient = useQueryClient();
const { publicDashboardAPI } = usePublicDashboardApi();
const { privateDashboardAPI } = usePrivateDashboardApi();
const { key: publicDashboardListQueryKey } = useServiceQueryKey('dashboard', 'public-dashboard', 'list');
const { key: privateDashboardListQueryKey } = useServiceQueryKey('dashboard', 'private-dashboard', 'list');

const createBundleOotb = async () => {
    const _promises: Promise<DashboardModel>[] = [];
    const _selectedOotbList = dashboardTemplateQuery.data?.value?.filter((d) => dashboardCreatePageState.selectedOotbIdMap[d.template_id]) || [];
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
        if (entryPoint.value === 'DASHBOARDS') {
            if (isAdminMode.value) {
                (_dashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.DOMAIN;
            } else if (!storeState.isWorkspaceMember && !_isPrivate) {
                (_dashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.WORKSPACE;
            }
        } else if (entryPoint.value === 'PROJECT' && projectContextType.value === 'PROJECT') {
            (_dashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.PROJECT;
            (_dashboardParams as PublicDashboardCreateParameters).project_id = projectGroupOrProjectId.value;
        } else if (entryPoint.value === 'PROJECT' && projectContextType.value === 'PROJECT_GROUP') {
            (_dashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.WORKSPACE;
            (_dashboardParams as PublicDashboardCreateParameters).project_group_id = projectGroupOrProjectId.value;
        }
        let _createType: DashboardType = _isPrivate ? 'PRIVATE' : 'PUBLIC';
        if (storeState.isWorkspaceMember) {
            _createType = 'PRIVATE';
        }
        const fetcher = _createType === 'PRIVATE'
            ? privateDashboardAPI.create
            : publicDashboardAPI.create;
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
    await queryClient.invalidateQueries({ queryKey: publicDashboardListQueryKey.value });
    await queryClient.invalidateQueries({ queryKey: privateDashboardListQueryKey.value });

    if (entryPoint.value === 'DASHBOARDS') {
        if (isAdminMode.value) {
            router.push({ name: ADMIN_DASHBOARDS_ROUTE._NAME }).catch(() => {});
        } else {
            router.push({ name: DASHBOARDS_ROUTE._NAME }).catch(() => {});
        }
    } else if (entryPoint.value === 'PROJECT') {
        if (!projectGroupOrProjectId.value) {
            console.error('projectGroupOrProjectId is not provided');
            return;
        }
        router.push({
            name: PROJECT_ROUTE_V2._NAME,
            params: {
                projectGroupOrProjectId: projectGroupOrProjectId.value,
            },
        }).catch(() => {});
    } else {
        console.error('Invalid entry point');
    }
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
