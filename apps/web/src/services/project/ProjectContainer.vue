<script setup lang="ts">
import { computed, onUnmounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import ProjectFormModal from '@/services/project/components/ProjectFormModal.vue';
import ProjectMainProjectGroupFormModal from '@/services/project/components/ProjectMainProjectGroupFormModal.vue';
import ProjectLSB from '@/services/project/ProjectLSB.vue';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';
import { useProjectTreeStore } from '@/services/project/stores/project-tree-store';



const route = useRoute();
const router = useRouter();
const gnbStore = useGnbStore();
const projectPageStore = useProjectPageStore();
const projectPageState = projectPageStore.state;
const projectTreeStore = useProjectTreeStore();

const state = reactive({
    currentProjectGroupId: computed(() => route.params.projectGroupId),
});

/* Event */
const handleUpdateProjectFormModalVisible = (visible: boolean) => {
    projectPageStore.setProjectFormModalVisible(visible);
    if (projectPageState.currentSelectedProjectId && !visible) {
        projectPageStore.setCurrentSelectedProjectId(undefined);
    }
};
const handleUpdateProjectGroupFormModalVisible = (visible: boolean) => {
    projectPageStore.setProjectGroupFormVisible(visible);
    if (projectPageState.currentSelectedProjectGroupId && !visible) {
        projectPageStore.setCurrentSelectedProjectGroupId(undefined);
    }
};
const handleRefreshTree = () => {
    projectTreeStore.refreshProjectTree();
    router.push({ name: PROJECT_ROUTE._NAME });
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
                            @update:visible="handleUpdateProjectFormModalVisible"
                            @confirm="handleRefreshTree"
        />
        <project-main-project-group-form-modal v-if="projectPageState.projectGroupFormVisible"
                                               :visible="projectPageState.projectGroupFormVisible"
                                               :update-mode="projectPageState.projectGroupFormUpdateMode"
                                               :project-group-id="state.currentProjectGroupId"
                                               @update:visible="handleUpdateProjectGroupFormModalVisible"
                                               @confirm="handleRefreshTree"
        />
    </fragment>
</template>
