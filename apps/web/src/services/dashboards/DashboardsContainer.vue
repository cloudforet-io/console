<script setup lang="ts">
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

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



const dashboardStore = useDashboardStore();
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardPageControlState = dashboardPageControlStore.state;
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
        />
        <dashboard-clone-modal :visible="dashboardPageControlState.dashboardCloneModalVisible"
                               :dashboard-id="dashboardPageControlState.selectedDashboardId"
        />
        <dashboard-folder-single-move-modal :visible="dashboardPageControlState.dashboardFolderSingleMoveModalVisible"
                                            :dashboard-id="dashboardPageControlState.selectedDashboardId"
        />
        <dashboard-share-with-code-modal :visible="dashboardPageControlState.dashboardShareWithCodeModalVisible"
                                         :dashboard-id="dashboardPageControlState.selectedDashboardId"
        />
        <dashboard-delete-modal :visible="dashboardPageControlState.dashboardDeleteModalVisible"
                                :dashboard-id="dashboardPageControlState.selectedDashboardId"
        />
        <!-- Single (Folder) -->
        <dashboard-folder-form-modal :visible="dashboardPageControlState.folderFormModalVisible"
                                     :folder-id="dashboardPageControlState.selectedFolderId"
        />
        <!-- Bundle (Folder & Dashboard)-->
        <dashboard-bundle-share-modal :visible="dashboardPageControlState.bundleShareModalVisible"
                                      :dashboard-id="dashboardPageControlState.selectedDashboardId"
                                      :folder-id="dashboardPageControlState.selectedFolderId"
        />
        <dashboard-bundle-clone-modal :visible="dashboardPageControlState.bundleCloneModalVisible"
                                      :folder-id="dashboardPageControlState.selectedFolderId"
        />
        <dashboard-bundle-delete-modal :visible="dashboardPageControlState.bundleDeleteModalVisible"
                                       :folder-id="dashboardPageControlState.selectedFolderId"
        />
        <dashboard-bundle-move-modal :visible="dashboardPageControlState.bundleMoveModalVisible" />
    </fragment>
</template>
