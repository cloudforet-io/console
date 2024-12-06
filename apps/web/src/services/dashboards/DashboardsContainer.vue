<script setup lang="ts">
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import { useUserStore } from '@/store/user/user-store';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import DashboardCloneModal from '@/services/dashboards/components/dashboard-detail/DashboardCloneModal.vue';
import DashboardFolderSingleMoveModal
    from '@/services/dashboards/components/dashboard-detail/DashboardFolderSingleMoveModal.vue';
import DashboardNameEditModal from '@/services/dashboards/components/dashboard-detail/DashboardNameEditModal.vue';
import DashboardShareWithCodeModal
    from '@/services/dashboards/components/dashboard-detail/DashboardShareWithCodeModal.vue';
import DashboardFolderFormModal from '@/services/dashboards/components/dashboard-folder/DashboardFolderFormModal.vue';
import DashboardBundleCloneModal from '@/services/dashboards/components/dashboard-main/DashboardBundleCloneModal.vue';
import DashboardBundleDeleteModal
    from '@/services/dashboards/components/dashboard-main/DashboardBundleDeleteModal.vue';
import DashboardBundleMoveModal
    from '@/services/dashboards/components/dashboard-main/DashboardBundleMoveModal.vue';
import DashboardBundleShareModal from '@/services/dashboards/components/dashboard-main/DashboardBundleShareModal.vue';
import DashboardDeleteModal from '@/services/dashboards/components/DashboardDeleteModal.vue';
import DashboardsLSB from '@/services/dashboards/DashboardsLSB.vue';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';
import { useDashboardSettingsStore } from '@/services/dashboards/stores/dashboard-settings-store';



const dashboardStore = useDashboardStore();
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardPageControlState = dashboardPageControlStore.state;
const dashboardSettings = useDashboardSettingsStore();
const userStore = useUserStore();
dashboardSettings.initState(userStore.state.userId);
const loadDashboard = async () => {
    await dashboardStore.load();
};
const { callApiWithGrantGuard } = useGrantScopeGuard(['WORKSPACE', 'DOMAIN'], loadDashboard);
callApiWithGrantGuard();

</script>

<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lsbVisible">
            <template #sidebar>
                <dashboards-l-s-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <centered-page-layout v-else-if="$route.meta.centeredLayout"
                              has-nav-bar
        >
            <router-view />
        </centered-page-layout>
        <general-page-layout v-else>
            <router-view />
        </general-page-layout>
        <!-- Modals -->
        <!-- Single (Dashboard) -->
        <dashboard-name-edit-modal :visible="dashboardPageControlState.dashboardNameEditModalVisible"
                                   :dashboard-id="dashboardPageControlState.selectedDashboardId"
                                   @update:visible="dashboardPageControlStore.setDashboardNameEditModalVisible"
        />
        <dashboard-clone-modal :visible="dashboardPageControlState.dashboardCloneModalVisible"
                               :dashboard-id="dashboardPageControlState.selectedDashboardId"
                               @update:visible="dashboardPageControlStore.setDashboardCloneModalVisible"
        />
        <dashboard-folder-single-move-modal :visible="dashboardPageControlState.dashboardFolderSingleMoveModalVisible"
                                            :dashboard-id="dashboardPageControlState.selectedDashboardId"
                                            @update:visible="dashboardPageControlStore.setDashboardFolderSingleMoveModalVisible"
        />
        <dashboard-share-with-code-modal :visible="dashboardPageControlState.dashboardShareWithCodeModalVisible"
                                         :dashboard-id="dashboardPageControlState.selectedDashboardId"
                                         @update:visible="dashboardPageControlStore.setDashboardShareWithCodeModalVisible"
        />
        <dashboard-delete-modal :visible="dashboardPageControlState.dashboardDeleteModalVisible"
                                :dashboard-id="dashboardPageControlState.selectedDashboardId"
                                @update:visible="dashboardPageControlStore.setDashboardDeleteModalVisible"
        />
        <!-- Single (Folder) -->
        <dashboard-folder-form-modal :visible="dashboardPageControlState.folderFormModalVisible"
                                     :folder-id="dashboardPageControlState.selectedFolderId"
                                     @update:visible="dashboardPageControlStore.setFolderFormModalVisible"
        />
        <!-- Bundle (Folder & Dashboard)-->
        <dashboard-bundle-share-modal :visible="dashboardPageControlState.bundleShareModalVisible"
                                      :dashboard-id="dashboardPageControlState.selectedDashboardId"
                                      :folder-id="dashboardPageControlState.selectedFolderId"
                                      @update:visible="dashboardPageControlStore.setBundleShareModalVisible"
        />
        <dashboard-bundle-clone-modal :visible="dashboardPageControlState.bundleCloneModalVisible"
                                      :folder-id="dashboardPageControlState.selectedFolderId"
                                      @update:visible="dashboardPageControlStore.closeBundleCloneModal"
        />
        <dashboard-bundle-delete-modal :visible="dashboardPageControlState.bundleDeleteModalVisible"
                                       :folder-id="dashboardPageControlState.selectedFolderId"
                                       @update:visible="dashboardPageControlStore.closeBundleDeleteModal"
        />
        <dashboard-bundle-move-modal :visible="dashboardPageControlState.bundleMoveModalVisible"
                                     @update:visible="dashboardPageControlStore.setBundleMoveModalVisible"
        />
    </fragment>
</template>
