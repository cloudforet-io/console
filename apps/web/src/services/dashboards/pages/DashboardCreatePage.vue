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

import {
    PCenteredLayoutHeader,
} from '@cloudforet/mirinae';

import type { DashboardModel, DashboardFolderModel } from '@/api-clients/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import { useGoBack } from '@/common/composables/go-back';

import DashboardCreateStep1 from '@/services/dashboard-shared/components/dashboard-create/DashboardCreateStep1.vue';
import DashboardCreateStep2 from '@/services/dashboard-shared/components/dashboard-create/DashboardCreateStep2.vue';
import { useDashboardCreatePageStore } from '@/services/dashboard-shared/stores/dashboard-create-page-store';
import { useDashboardFolderQuery } from '@/services/dashboards/composables/use-dashboard-folder-query';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';



interface Step {
    step: number;
    description?: TranslateResult;
}
const appContextStore = useAppContextStore();
const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});

/* Query */
const {
    publicDashboardList,
    privateDashboardList,
} = useDashboardQuery();
const {
    publicFolderList,
    privateFolderList,
} = useDashboardFolderQuery();


const dashboardState = reactive({
    publicDashboardItems: computed<Array<DashboardModel>>(() => {
        const _v2DashboardItems = publicDashboardList.value.filter((d) => d.version !== '1.0');
        if (storeState.isAdminMode) return _v2DashboardItems;
        return _v2DashboardItems.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateDashboardItems: computed<Array<DashboardModel>>(() => privateDashboardList.value.filter((d) => d.version !== '1.0')),
    allDashboardItems: computed<Array<DashboardModel>>(() => [...dashboardState.publicDashboardItems, ...dashboardState.privateDashboardItems]),
    publicFolderItems: computed<Array<DashboardFolderModel>>(() => {
        if (storeState.isAdminMode) return publicFolderList.value;
        return publicFolderList.value.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateFolderItems: computed<Array<DashboardFolderModel>>(() => privateFolderList.value),
    allDashboardFolderItems: computed<Array<DashboardFolderModel>>(() => [...dashboardState.publicFolderItems, ...dashboardState.privateFolderItems]),
});

const state = reactive({
    loading: false,
    steps: computed<Step[]>(() => [
        {
            step: 1,
            description: storeState.isAdminMode ? '' : i18n.t('DASHBOARDS.CREATE.STEP1_DESC'),
        },
        {
            step: 2,
            description: storeState.isAdminMode ? i18n.t('DASHBOARDS.CREATE.STEP2_DESC_FOR_ADMIN') : i18n.t('DASHBOARDS.CREATE.STEP2_DESC'),
        },
    ]),
    closeConfirmModalVisible: false,
});

/* Event */
const handleClickClose = () => {
    state.closeConfirmModalVisible = true;
};
const { setPathFrom, handleClickBackButton } = useGoBack({
    name: storeState.isAdminMode ? ADMIN_DASHBOARDS_ROUTE._NAME : DASHBOARDS_ROUTE._NAME,
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
    <div class="dashboard-create-page"
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
                                :dashboard-items="dashboardState.allDashboardItems"
                                @click-next="handleClickNext"
        />
        <template v-else-if="dashboardCreatePageState.currentStep === 2">
            <dashboard-create-step2 :dashboard-items="dashboardState.allDashboardItems"
                                    :folder-items="dashboardState.allDashboardFolderItems"
            />
        </template>
        <confirm-back-modal :visible.sync="state.closeConfirmModalVisible"
                            @confirm="handleClickBackButton"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-page {
    margin: 0 auto;
    &.step-1 {
        width: 60rem;
    }
    &.step-2 {
        width: 45rem;
    }
}
</style>
