<script setup lang="ts">
import { computed, onUnmounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';

import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import ProjectFormModal from '@/services/project/v1/components/ProjectFormModal.vue';
import ProjectMainProjectGroupFormModal from '@/services/project/v1/components/ProjectMainProjectGroupFormModal.vue';
import ProjectLSB from '@/services/project/v1/ProjectLSB.vue';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';
import { useProjectPageStore } from '@/services/project/v1/stores/project-page-store';
import { useProjectTreeStore } from '@/services/project/v1/stores/project-tree-store';



const route = useRoute();
const router = useRouter();
const gnbStore = useGnbStore();
const projectPageStore = useProjectPageStore();
const projectPageState = projectPageStore.state;
const projectTreeStore = useProjectTreeStore();

const state = reactive({
    currentProjectGroupId: computed(() => route.params.projectGroupId),
    isProjectRootPage: computed(() => route.name === PROJECT_ROUTE_V1._NAME && !state.currentProjectGroupId),
});

/* Event */
const handleUpdateProjectFormModalVisible = (visible: boolean) => {
    projectPageStore.setProjectFormModalVisible(visible);
    if (projectPageState.currentSelectedProjectId && !visible) {
        projectPageStore.setCurrentSelectedProjectId(undefined);
        projectPageStore.setCurrentSelectedProjectGroupId(undefined);
    }
};
const handleUpdateProjectGroupFormModalVisible = (visible: boolean) => {
    projectPageStore.setProjectGroupFormVisible(visible);
    if (projectPageState.currentSelectedProjectGroupId && !visible) {
        projectPageStore.setCurrentSelectedProjectGroupId(undefined);
        projectPageStore.setProjectGroupFormUpdateMode(false);
    }
};
const refreshProejctTree = () => {
    projectTreeStore.refreshProjectTree();
};

const handleConfirmProjectFormModal = (isCreating: boolean, result: ProjectModel) => {
    refreshProejctTree();
    if (isCreating && !result.project_group_id && !state.isProjectRootPage) {
        router.push({ name: PROJECT_ROUTE_V1._NAME });
    }
};
const handleConfirmProjectGroupFormModal = (isCreating: boolean, result: ProjectGroupModel) => {
    refreshProejctTree();
    if (isCreating && !result.parent_group_id && !state.isProjectRootPage) {
        router.push({ name: PROJECT_ROUTE_V1._NAME });
    }
};

/* Lifecycle */
onUnmounted(() => {
    gnbStore.initState();
    projectPageStore.reset();
});
</script>

<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lsbVisible">
            <template #sidebar>
                <project-l-s-b />
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
        <project-form-modal v-if="projectPageState.projectFormModalVisible"
                            :visible="projectPageState.projectFormModalVisible"
                            :project-id="projectPageState.currentSelectedProjectId"
                            :project-group-id="projectPageState.currentSelectedProjectGroupId"
                            @update:visible="handleUpdateProjectFormModalVisible"
                            @confirm="handleConfirmProjectFormModal"
        />
        <project-main-project-group-form-modal v-if="projectPageState.projectGroupFormVisible"
                                               :visible="projectPageState.projectGroupFormVisible"
                                               :update-mode="projectPageState.projectGroupFormUpdateMode"
                                               :parent-group-id="projectPageState.currentSelectedProjectGroupId"
                                               :project-group-id="projectPageState.currentSelectedProjectGroupId || state.currentProjectGroupId"
                                               @update:visible="handleUpdateProjectGroupFormModalVisible"
                                               @confirm="handleConfirmProjectGroupFormModal"
        />
    </fragment>
</template>
