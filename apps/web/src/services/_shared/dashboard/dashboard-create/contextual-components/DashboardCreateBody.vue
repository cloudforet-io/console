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
    computed, defineExpose, onUnmounted, reactive,
// eslint-disable-next-line import/no-duplicates
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import {
    PCenteredLayoutHeader,
} from '@cloudforet/mirinae';

import type { DashboardModel, DashboardFolderModel } from '@/api-clients/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';


import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import { useGoBack } from '@/common/composables/go-back';

import { useDashboardSharedContext } from '@/services/_shared/dashboard/core/composables/_internal/use-dashboard-shared-context';
import DashboardCreateStep2 from '@/services/_shared/dashboard/dashboard-create/components/DashboardCreateStep2.vue';
import DashboardCreateStep1 from '@/services/_shared/dashboard/dashboard-create/contextual-components/DashboardCreateStep1.vue';
import { useDashboardCreatePageStore } from '@/services/_shared/dashboard/dashboard-create/stores/dashboard-create-page-store';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

interface Step {
    step: number;
    description?: TranslateResult;
}

interface Props {
    dashboardItems: Array<DashboardModel>;
    folderItems: Array<DashboardFolderModel>;
}

const props = defineProps<Props>();

const { isAdminMode, entryPoint, projectGroupOrProjectId } = useDashboardSharedContext();

const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;


const state = reactive({
    loading: false,
    steps: computed<Step[]>(() => [
        {
            step: 1,
            description: isAdminMode.value ? '' : i18n.t('DASHBOARDS.CREATE.STEP1_DESC'),
        },
        {
            step: 2,
            description: isAdminMode.value ? i18n.t('DASHBOARDS.CREATE.STEP2_DESC_FOR_ADMIN') : i18n.t('DASHBOARDS.CREATE.STEP2_DESC'),
        },
    ]),
    closeConfirmModalVisible: false,
});

const goBackRoute = computed<Location|undefined>(() => {
    if (entryPoint.value === 'DASHBOARDS') {
        if (isAdminMode.value) {
            return {
                name: ADMIN_DASHBOARDS_ROUTE._NAME,
            };
        }
        return {
            name: DASHBOARDS_ROUTE._NAME,
        };
    }
    if (entryPoint.value === 'PROJECT') {
        return {
            name: PROJECT_ROUTE_V2._NAME,
            params: {
                projectGroupOrProjectId: projectGroupOrProjectId.value as string,
            },
        };
    }
    return undefined;
});

/* Event */
const handleClickClose = () => {
    state.closeConfirmModalVisible = true;
};
const { setPathFrom, handleClickBackButton } = useGoBack(goBackRoute.value);
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
    <div class="dashboard-create-body"
         :class="[`step-${dashboardCreatePageState.currentStep}`]"
    >
        <p-centered-layout-header :title="$t('DASHBOARDS.CREATE.TITLE')"
                                  :description="state.steps?.[dashboardCreatePageState.currentStep - 1]?.description"
                                  :total-steps="state.steps.length"
                                  :current-step="dashboardCreatePageState.currentStep"
                                  show-step
                                  show-close-button
                                  @close="handleClickClose"
        />
        <dashboard-create-step1 v-if="dashboardCreatePageState.currentStep === 1"
                                :dashboard-items="props.dashboardItems"
                                @click-next="handleClickNext"
        />
        <template v-else-if="dashboardCreatePageState.currentStep === 2">
            <dashboard-create-step2 :dashboard-items="props.dashboardItems"
                                    :folder-items="props.folderItems"
            />
        </template>
        <confirm-back-modal :visible.sync="state.closeConfirmModalVisible"
                            @confirm="handleClickBackButton"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-body {
    margin: 0 auto;
    &.step-1 {
        width: 60rem;
    }
    &.step-2 {
        width: 45rem;
    }
}
</style>
