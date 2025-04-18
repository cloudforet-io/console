<script lang="ts" setup>
import {
    computed, reactive, ref,
} from 'vue';

import { PButton } from '@cloudforet/mirinae';

import type { DashboardFolderModel, DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';

import DashboardCreateStep2BundleCase
    from '@/services/_shared/dashboard/dashboard-create/contextual-components/DashboardCreateStep2BundleCase.vue';
import DashboardCreateStep2SingleCase
    from '@/services/_shared/dashboard/dashboard-create/contextual-components/DashboardCreateStep2SingleCase.vue';
import { useDashboardCreatePageStore } from '@/services/_shared/dashboard/dashboard-create/stores/dashboard-create-page-store';

interface Props {
    dashboardItems: Array<DashboardModel>;
    folderItems: Array<DashboardFolderModel>;
}

const props = defineProps<Props>();

const singleCaseRef = ref<HTMLElement|null>(null);
const bundleCaseRef = ref<HTMLElement|null>(null);

const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;
const dashboardCreatePageGetters = dashboardCreatePageStore.getters;
const state = reactive({
    isSingleCreateValid: false,
    disableCreateButton: computed<boolean>(() => {
        if (dashboardCreatePageState.createType === 'SINGLE') {
            return !state.isSingleCreateValid;
        }
        return dashboardCreatePageGetters.noBundleSelected;
    }),
});

/* Event */
const goBack = () => {
    dashboardCreatePageStore.reset();
    dashboardCreatePageStore.setCurrentStep(1);
};
const handleCreateDashboard = async () => {
    if (dashboardCreatePageState.createType === 'SINGLE') {
        await singleCaseRef.value?.handleConfirm();
    } else {
        await bundleCaseRef.value?.handleConfirm();
    }
};
</script>

<template>
    <div class="dashboard-create-step2">
        <dashboard-create-step2-single-case v-if="dashboardCreatePageState.createType === 'SINGLE'"
                                            ref="singleCaseRef"
                                            :is-valid.sync="state.isSingleCreateValid"
                                            :dashboard-items="props.dashboardItems"
                                            :folder-items="props.folderItems"
        />
        <dashboard-create-step2-bundle-case v-else
                                            ref="bundleCaseRef"
                                            :dashboard-items="props.dashboardItems"
        />
        <div class="button-area">
            <p-button style-type="transparent"
                      size="lg"
                      icon-left="ic_arrow-left"
                      :disabled="dashboardCreatePageState.loading"
                      @click="goBack()"
            >
                {{ $t('DASHBOARDS.CREATE.GO_BACK') }}
            </p-button>
            <p-button style-type="primary"
                      size="lg"
                      :disabled="state.disableCreateButton"
                      :loading="dashboardCreatePageState.loading"
                      @click="handleCreateDashboard"
            >
                {{ $t('DASHBOARDS.CREATE.CREATE') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-step2 {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    .button-area {
        @apply flex justify-end mt-8 gap-4;
    }
}
</style>
