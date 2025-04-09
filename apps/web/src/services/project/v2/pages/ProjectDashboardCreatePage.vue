<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent, type ComponentPublicInstance } from 'vue';


interface IInstance extends ComponentPublicInstance {
    setPathFrom(from: any): void
}

export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance = vm as unknown as IInstance;
            instance.setPathFrom(from);
        });
    },
});
</script>

<script setup lang="ts">
/* eslint-disable import/first */
import {
    computed, defineExpose, onUnmounted, reactive, toRef,
// eslint-disable-next-line import/no-duplicates
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PCenteredLayoutHeader,
} from '@cloudforet/mirinae';

import type { DashboardModel, DashboardFolderModel } from '@/api-clients/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';


import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import { useGoBack } from '@/common/composables/go-back';

import DashboardCreateStep1 from '@/services/dashboard-shared/components/dashboard-create/DashboardCreateStep1.vue';
import DashboardCreateStep2 from '@/services/dashboard-shared/components/dashboard-create/DashboardCreateStep2.vue';
import { useDashboardCreatePageStore } from '@/services/dashboard-shared/stores/dashboard-create-page-store';
import { useProjectDashboardFolderQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-folder-query';
import { useProjectDashboardQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-query';
import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

const props = defineProps<{
    projectGroupOrProjectId: string;
}>();

interface Step {
    step: number;
    description?: TranslateResult;
}
const { projectGroupId, projectId } = useProjectOrGroupId(toRef(props, 'projectGroupOrProjectId'));


const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;


/* Query */
const {
    dashboardList,
    dashboardSharedList,
} = useProjectDashboardQuery({
    projectGroupId,
    projectId,
});
const {
    dashboardFolderList,
    dashboardFolderSharedList,
} = useProjectDashboardFolderQuery({
    projectGroupId,
    projectId,
});

const dashboardItems = computed<Array<DashboardModel>>(() => [...dashboardSharedList.value, ...dashboardList.value]);
const dashboardFolderItems = computed<Array<DashboardFolderModel>>(() => [...dashboardFolderSharedList.value, ...dashboardFolderList.value]);


const state = reactive({
    loading: false,
    steps: computed<Step[]>(() => [
        {
            step: 1,
            description: i18n.t('DASHBOARDS.CREATE.STEP1_DESC'),
        },
        {
            step: 2,
            description: i18n.t('DASHBOARDS.CREATE.STEP2_DESC'),
        },
    ]),
    closeConfirmModalVisible: false,
});

/* Event */
const handleClickClose = () => {
    state.closeConfirmModalVisible = true;
};
const { setPathFrom, handleClickBackButton } = useGoBack({
    name: PROJECT_ROUTE_V2._NAME,
});
const handleClickNext = () => {
    dashboardCreatePageStore.setCreateType('BUNDLE');
    dashboardCreatePageStore.setCurrentStep(2);
};

defineExpose({ setPathFrom });

onUnmounted(() => {
    dashboardCreatePageStore.reset();
});
</script>

<template>
    <div class="project-dashboard-create-page"
         :class="[`step-${dashboardCreatePageState.currentStep}`]"
    >
        <p-centered-layout-header :title="$t('PROJECT.DASHBOARDS.CREATE.TITLE')"
                                  :description="state.steps?.[dashboardCreatePageState.currentStep - 1]?.description"
                                  :total-steps="state.steps.length"
                                  :current-step="dashboardCreatePageState.currentStep"
                                  show-step
                                  show-close-button
                                  @close="handleClickClose"
        />
        <dashboard-create-step1 v-if="dashboardCreatePageState.currentStep === 1"
                                :dashboard-items="dashboardItems"
                                @click-next="handleClickNext"
        />
        <template v-else-if="dashboardCreatePageState.currentStep === 2">
            <dashboard-create-step2 :dashboard-items="dashboardItems"
                                    :folder-items="dashboardFolderItems"
            />
        </template>
        <confirm-back-modal :visible.sync="state.closeConfirmModalVisible"
                            @confirm="handleClickBackButton"
        />
    </div>
</template>

<style lang="postcss" scoped>
.project-dashboard-create-page {
    margin: 0 auto;
    &.step-1 {
        width: 60rem;
    }
    &.step-2 {
        width: 45rem;
    }
}
</style>
