<script setup lang="ts">
import {
    computed, nextTick, onBeforeUnmount, onMounted, ref, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { PTab, PSelectDropdown } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { useScopedQuery } from '@/api-clients/_common/composables/use-scoped-query';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardListParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/list';
import { usePublicFolderApi } from '@/api-clients/dashboard/public-folder/composables/use-public-folder-api';
import type { PublicFolderListParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import ProjectDashboard from '@/services/project/v2/components/ProjectDashboard.vue';
import ProjectOverview from '@/services/project/v2/components/ProjectOverview.vue';

import { PROJECT_ROUTE_V2 } from '../routes/route-constant';

type ProjectPageContextType = 'PROJECT' | 'PROJECT_GROUP' | undefined;

const props = defineProps<{
    projectId: string,
    projectGroupId?: string,
    dashboardId?: string,
}>();


const emit = defineEmits<{(e: 'update:dashboard-id', value?: string): void;}>();
const router = useRouter();

const projectPageContext = computed<ProjectPageContextType>(() => {
    if (props.projectGroupId) {
        return 'PROJECT_GROUP';
    }
    if (props.projectId) {
        return 'PROJECT';
    }
    return undefined;
});

const activeTab = ref('overview');
watch(() => props.dashboardId, (did) => {
    activeTab.value = did ?? 'overview';
}, { immediate: true });
watch(() => props.projectId, () => {
    activeTab.value = 'overview';
});

/* mounted */
const mounted = ref(false);
onMounted(() => {
    nextTick(() => {
        mounted.value = true;
    });
});
onBeforeUnmount(() => {
    mounted.value = false;
});

/* dashboard tabs */
const { publicDashboardAPI } = usePublicDashboardApi();
const { publicFolderAPI } = usePublicFolderApi();
// shared by other resource groups
const { key: dashboardSharedListQueryKey, params: dashboardSharedListParams } = useServiceQueryKey('dashboard', 'public-dashboard', 'list', {
    contextKey: projectPageContext.value,
    params: computed<PublicDashboardListParameters>(() => ({
        project_id: '*',
        // project_group_id: '*',
        query: {
            filter: [
                { k: 'version', v: '1.0', o: 'not' },
                { k: 'scope', v: 'PROJECT', o: 'eq' },
                { k: 'shared', v: true, o: 'eq' },
            ],
        },
    })),
});
const { data: dashboardSharedList } = useScopedQuery({
    queryKey: dashboardSharedListQueryKey,
    queryFn: () => publicDashboardAPI.list(dashboardSharedListParams.value),
    select: (data) => data?.results ?? [],
    enabled: computed(() => mounted.value && !!projectPageContext.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
}, ['WORKSPACE']);
const { key: dashboardSharedFolderListQueryKey, params: dashboardSharedFolderListParams } = useServiceQueryKey('dashboard', 'public-folder', 'list', {
    contextKey: projectPageContext.value,
    params: computed<PublicFolderListParameters>(() => ({
        project_id: '*',
        // project_group_id: '*',
        query: {
            filter: [
                { k: 'scope', v: 'PROJECT', o: 'eq' },
                { k: 'shared', v: true, o: 'eq' },
            ],
        },
    })),
});
const { data: dashboardSharedFolderList } = useScopedQuery({
    queryKey: dashboardSharedFolderListQueryKey,
    queryFn: () => publicFolderAPI.list(dashboardSharedFolderListParams.value),
    select: (data) => data?.results || [],
    enabled: computed(() => mounted.value && !!projectPageContext.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
}, ['WORKSPACE']);

// project
const { key: dashboardListQueryKey, params: dashboardListParams } = useServiceQueryKey('dashboard', 'public-dashboard', 'list', {
    contextKey: projectPageContext.value,
    params: computed<PublicDashboardListParameters>(() => ({
        project_id: props.projectId,
        project_group_id: props.projectGroupId,
        query: {
            filter: [
                { k: 'version', v: '1.0', o: 'not' },
            ],
        },
    })),
});
const { data: dashboardList } = useScopedQuery({
    queryKey: dashboardListQueryKey,
    queryFn: () => publicDashboardAPI.list(dashboardListParams.value),
    select: (data) => data?.results ?? [],
    enabled: computed(() => mounted.value && !!projectPageContext.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
}, ['WORKSPACE']);
const { key: dashboardFolderListQueryKey, params: dashboardFolderListParams } = useServiceQueryKey('dashboard', 'public-folder', 'list', {
    contextKey: projectPageContext.value,
    params: computed<PublicFolderListParameters>(() => ({
        project_id: props.projectId,
        project_group_id: props.projectGroupId,
    })),
});
const { data: dashboardFolderList } = useScopedQuery({
    queryKey: dashboardFolderListQueryKey,
    queryFn: () => publicFolderAPI.list(dashboardFolderListParams.value),
    select: (data) => data?.results || [],
    enabled: computed(() => mounted.value && !!projectPageContext.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
}, ['WORKSPACE']);

const tabFolderList = computed(() => [
    ...(dashboardSharedFolderList.value ?? []),
    ...(dashboardFolderList.value ?? []),
]);
const tabDashboardList = computed(() => [
    ...(dashboardSharedList.value ?? []),
    ...(dashboardList.value ?? []),
]);

const tabs = computed<TabItem[]>(() => {
    const folderTabs = tabFolderList.value?.map((folder) => ({
        name: folder.folder_id,
        label: folder.name,
        tabType: 'folder',
        icon: 'ic_folder',
        subItems: tabDashboardList.value?.filter((dashboard) => dashboard.folder_id === folder.folder_id).map((dashboard) => ({
            name: dashboard.dashboard_id,
            label: dashboard.name,
            icon: 'ic_service_dashboard',
        })),
    })) ?? [];
    const dashboardTabs = tabDashboardList.value?.filter((dashboard) => !dashboard.folder_id).map((dashboard) => ({
        name: dashboard.dashboard_id,
        label: dashboard.name,
        icon: 'ic_service_dashboard',
    })) ?? [];
    return [
        { name: 'overview', label: 'Overview' }, // TODO: i18n
        ...folderTabs,
        ...dashboardTabs,
    ];
});
// HACK: To trigger render tab on mounted
const tabNamesKey = computed(() => tabs.value.map((tab) => tab.name).join(','));

const handleUpdateActiveTab = (tab: string) => {
    activeTab.value = tab;
    emit('update:dashboard-id', tab === 'overview' ? undefined : tab);
};

const projectDashboardCreateMenuItems = computed(() => [
    {
        label: 'Create Dashboard',
        name: 'dashboard',
        icon: 'ic_plus',
    },
    {
        label: 'Create Folder',
        name: 'folder',
        icon: 'ic_plus',
    },
]);

const handleCreateProjectDashboard = (item: string) => {
    if (item === 'dashboard') {
        router.push({
            name: PROJECT_ROUTE_V2.DASHBOARD_CREATE._NAME,
            params: {
                projectGroupOrProjectId: props.projectGroupId ?? props.projectId,
            },
        });
    } else if (item === 'folder') {
        console.log('create folder');
    }
};

</script>

<template>
    <div>
        <p-tab :key="`${props.projectId}-${tabNamesKey}`"
               :tabs="tabs"
               :active-tab="activeTab"
               @update:active-tab="handleUpdateActiveTab"
        >
            <template #default>
                <div>
                    <keep-alive>
                        <project-overview v-if="activeTab === 'overview'"
                                          :project-group-id="props.projectGroupId"
                                          :project-id="props.projectId"
                        />
                        <project-dashboard v-else
                                           :id="props.projectId"
                                           :key="`${props.projectId}-${activeTab}`"
                                           :dashboard-id="activeTab"
                        />
                    </keep-alive>
                </div>
            </template>
            <template #header-right-contents>
                <p-select-dropdown style-type="tertiary-icon-button"
                                   button-icon="ic_plus"
                                   size="sm"
                                   menu-position="right"
                                   :menu="projectDashboardCreateMenuItems"
                                   @select="handleCreateProjectDashboard"
                />
            </template>
        </p-tab>
    </div>
</template>

