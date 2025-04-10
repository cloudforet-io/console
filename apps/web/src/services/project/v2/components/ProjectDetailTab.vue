<script setup lang="ts">
import {
    computed, nextTick, onBeforeUnmount, onMounted, ref, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { PTab, PSelectDropdown } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import type { DashboardFolderModel, DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';

import ProjectDashboard from '@/services/project/v2/components/ProjectDashboard.vue';
import ProjectOverview from '@/services/project/v2/components/ProjectOverview.vue';
import { useProjectDashboardFolderQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-folder-query';
import { useProjectDashboardQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-query';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const props = defineProps<{
    projectId?: string,
    projectGroupId?: string,
    dashboardId?: string,
}>();
const emit = defineEmits<{(e: 'update:dashboard-id', value?: string): void;}>();
const router = useRouter();
const projectPageModalStore = useProjectPageModalStore();

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

/* Query */
const {
    dashboardList,
    dashboardSharedList,
} = useProjectDashboardQuery({
    projectGroupId: computed(() => props.projectGroupId),
    projectId: computed(() => props.projectId),
});
const {
    dashboardFolderList,
    dashboardFolderSharedList,
} = useProjectDashboardFolderQuery({
    projectGroupId: computed(() => props.projectGroupId),
    projectId: computed(() => props.projectId),
});

const dashboardItems = computed<Array<DashboardModel>>(() => [...dashboardSharedList.value, ...dashboardList.value]);
const dashboardFolderItems = computed<Array<DashboardFolderModel>>(() => [...dashboardFolderSharedList.value, ...dashboardFolderList.value]);

const tabs = computed<TabItem[]>(() => {
    const folderTabs = dashboardFolderItems.value?.map((folder) => ({
        name: folder.folder_id,
        label: folder.name,
        tabType: 'folder',
        icon: 'ic_folder',
        subItems: dashboardItems.value?.filter((dashboard) => dashboard.folder_id === folder.folder_id).map((dashboard) => ({
            name: dashboard.dashboard_id,
            label: dashboard.name,
            icon: 'ic_service_dashboard',
        })),
    })) ?? [];
    const dashboardTabs = dashboardItems.value?.filter((dashboard) => !dashboard.folder_id).map((dashboard) => ({
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
    const projectGroupOrProjectId = props.projectGroupId ?? props.projectId;
    if (!projectGroupOrProjectId) {
        console.warn('projectGroupId or projectId is not selected');
        return;
    }
    if (item === 'dashboard') {
        router.push({
            name: PROJECT_ROUTE_V2.DASHBOARD_CREATE._NAME,
            params: {
                projectGroupOrProjectId,
            },
        });
    } else if (item === 'folder') {
        projectPageModalStore.openCreateFolderFormModal();
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
                                           :key="`${props.projectId}-${activeTab}`"
                                           :project-id="props.projectId"
                                           :project-group-id="props.projectGroupId"
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

