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
// eslint-disable-next-line import/order,import/no-duplicates
import { computed, defineExpose, reactive } from 'vue';

import type { TranslateResult } from 'vue-i18n';

import {
    PButton, PCenteredLayoutHeader,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { RESOURCE_GROUP } from '@/schema/_common/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useGoBack } from '@/common/composables/go-back';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import DashboardCreateStep1 from '@/services/dashboards/components/DashboardCreateStep1.vue';
import DashboardCreateStep2 from '@/services/dashboards/components/DashboardCreateStep2.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import type { CreateDashboardParameters, DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';


interface Step {
    step: number;
    description?: TranslateResult;
}
const appContextStore = useAppContextStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const { getProperRouteLocation } = useProperRouteLocation();
const {
    forms: { dashboardTemplate },
    setForm,
    isAllValid,
} = useFormValidator({
    dashboardTemplate: {} as DashboardModel,
}, {
    dashboardTemplate(value: DashboardModel) {
        return !Object.keys(value).length ? i18n.t('DASHBOARDS.CREATE.VALIDATION_TEMPLATE') : '';
    },
});

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    loading: false,
    steps: computed<Step[]>(() => [
        {
            step: 1,
            description: i18n.t('DASHBOARDS.CREATE.STEP1_DESC'),
        },
        {
            step: 2,
            description: state.isAdminMode ? i18n.t('DASHBOARDS.CREATE.STEP2_DESC_FOR_ADMIN') : i18n.t('DASHBOARDS.CREATE.STEP2_DESC'),
        },
    ]),
    currentStep: 1,
    isStep2Valid: false,
    closeConfirmModalVisible: false,
    disableCreateButton: computed<boolean>(() => !isAllValid.value || !state.isStep2Valid),
});

const goStep = (direction: 'prev'|'next') => {
    if (direction === 'prev') state.currentStep--;
    else state.currentStep++;
};

const createDashboard = async () => {
    try {
        state.loading = true;

        const apiParam: CreateDashboardParameters = {
            name: dashboardDetailState.name,
            labels: dashboardDetailState.labels,
            options: dashboardDetailState.options,
            layouts: [dashboardDetailState.dashboardWidgetInfoList],
            vars: {},
            tags: { created_by: store.state.user.userId },
        };
        if (dashboardDetailState.dashboardScope !== 'PRIVATE') {
            apiParam.resource_group = state.isAdminMode ? RESOURCE_GROUP.DOMAIN : dashboardDetailState.dashboardScope;
        }

        const createdDashboard = await dashboardDetailStore.createDashboard(apiParam);
        await SpaceRouter.router.push(getProperRouteLocation({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: createdDashboard.dashboard_id || '',
            },
        })).catch(() => {});
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.CUSTOMIZE.ALT_E_UPDATE_DASHBOARD'));
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleClickClose = () => {
    state.closeConfirmModalVisible = true;
};
const handleSelectTemplate = (template: DashboardModel) => {
    setForm('dashboardTemplate', template);
    goStep('next');
};

const { setPathFrom, handleClickBackButton } = useGoBack(getProperRouteLocation({
    name: DASHBOARDS_ROUTE._NAME,
}));

defineExpose({ setPathFrom });
</script>

<template>
    <div class="dashboard-create-page"
         :class="[`step-${state.currentStep}`]"
    >
        <p-centered-layout-header :title="$t('DASHBOARDS.CREATE.TITLE')"
                                  :description="state.steps[state.currentStep - 1].description"
                                  :total-steps="state.steps.length"
                                  :current-step="state.currentStep"
                                  show-step
                                  show-close-button
                                  @close="handleClickClose"
        />
        <dashboard-create-step1 v-if="state.currentStep === 1"
                                @select-template="handleSelectTemplate"
        />
        <template v-else-if="state.currentStep === 2">
            <dashboard-create-step2 :selected-template="dashboardTemplate"
                                    :is-valid.sync="state.isStep2Valid"
            />
            <div class="button-area">
                <p-button style-type="transparent"
                          size="lg"
                          icon-left="ic_arrow-left"
                          @click="goStep('prev')"
                >
                    {{ $t('DASHBOARDS.CREATE.GO_BACK') }}
                </p-button>
                <p-button style-type="primary"
                          size="lg"
                          :disabled="state.disableCreateButton"
                          @click="createDashboard"
                >
                    {{ $t('DASHBOARDS.CREATE.CREATE_NEW_DASHBOARD') }}
                </p-button>
            </div>
        </template>
        <confirm-back-modal :visible.sync="state.closeConfirmModalVisible"
                            @confirm="handleClickBackButton"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-page {
    &.step-1 {
        width: 60rem;
    }
    &.step-2 {
        width: 45rem;
    }
    &.step-3 {
        width: 100%;
        height: 100%;
        min-height: calc(100vh - 8rem);
    }
    .button-area {
        @apply flex justify-end mt-8 gap-4;
    }
}
</style>
