<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { PTab } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardListParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/list';
import { usePublicFolderApi } from '@/api-clients/dashboard/public-folder/composables/use-public-folder-api';
import type { PublicFolderListParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/list';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import ProjectDashboard from '@/services/project/v2/components/ProjectDashboard.vue';


const props = defineProps<{
    projectId: string,
    dashboardId?: string,
}>();
const emit = defineEmits<{(e: 'update:dashboard-id', value?: string): void;}>();


const activeTab = ref('overview');
watch(() => props.dashboardId, (did) => {
    activeTab.value = did ?? 'overview';
}, { immediate: true });
watch(() => props.projectId, () => {
    activeTab.value = 'overview';
});

/* dashboard tabs */
const { publicDashboardAPI } = usePublicDashboardApi();
const { publicFolderAPI } = usePublicFolderApi();
const { key: dashboardListQueryKey, params: dashboardListParams } = useServiceQueryKey('dashboard', 'public-dashboard', 'list', {
    params: computed<PublicDashboardListParameters>(() => ({
        // project_id: props.id,
        query: {
            filter: [
                { k: 'shared', v: true, o: 'eq' },
                { k: 'version', v: '1.0', o: 'not' },
                { k: 'scope', v: 'PROJECT', o: 'eq' },
            ],
        },
    })),
});
const { data: dashboardList } = useScopedQuery({
    queryKey: dashboardListQueryKey,
    queryFn: () => publicDashboardAPI.list(dashboardListParams.value),
    select: (data) => data?.results ?? [],
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
});
const { key: dashboardFolderListQueryKey, params: dashboardFolderListParams } = useServiceQueryKey('dashboard', 'public-folder', 'list', {
    params: computed<PublicFolderListParameters>(() => ({
        // project_id: props.id,
        query: {
            filter: [
                { k: 'shared', v: true, o: 'eq' },
                { k: 'scope', v: 'PROJECT', o: 'eq' },
            ],
        },
    })),
});
const { data: dashboardFolderList } = useScopedQuery({
    queryKey: dashboardFolderListQueryKey,
    queryFn: () => publicFolderAPI.list(dashboardFolderListParams.value),
    select: (data) => data?.results || [],
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
});

const tabs = computed<TabItem[]>(() => {
    const folderTabs = dashboardFolderList.value?.map((folder) => ({
        name: folder.folder_id,
        label: folder.name,
        tabType: 'folder',
        icon: 'ic_folder',
        subItems: dashboardList.value?.filter((dashboard) => dashboard.folder_id === folder.folder_id).map((dashboard) => ({
            name: dashboard.dashboard_id,
            label: dashboard.name,
            icon: 'ic_service_dashboard',
        })),
    })) ?? [];
    const dashboardTabs = dashboardList.value?.filter((dashboard) => !dashboard.folder_id).map((dashboard) => ({
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

const onChangeTab = (tab: string) => {
    activeTab.value = tab;
    emit('update:dashboard-id', tab === 'overview' ? undefined : tab);
};
</script>

<template>
    <div>
        <p-tab :tabs="tabs"
               :active-tab="activeTab"
               @change="onChangeTab"
        >
            <template #default="tab">
                <keep-alive v-if="tab.name === 'overview'">
                    <div v-if="activeTab === 'overview'">
                        Overview will be implemented later.
                    </div>
                </keep-alive>
                <keep-alive v-else-if="tab.name">
                    <project-dashboard :id="props.projectId"
                                       :key="`${tab.name}-${props.projectId}`"
                                       :dashboard-id="tab.name"
                    />
                </keep-alive>
            </template>
        </p-tab>
    </div>
</template>

