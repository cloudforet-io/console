<template>
    <div class="dashboard-customize">
        <dashboard-customize-page-name :name.sync="state.name"
                                       :dashboard-id="props.dashboardId"
                                       @update:name="handleUpdateDashboardName"
                                       @click-back-button="goBack"
        />
        <div class="filters-box">
            <dashboard-labels editable />
            <dashboard-toolset />
        </div>
        <p-divider />
        <div class="dashboard-selectors">
            <dashboard-variables class="variable-selector-wrapper"
                                 disable-save-button
                                 is-manageable
            />
            <dashboard-refresh-dropdown :dashboard-id="props.dashboardId"
                                        refresh-disabled
            />
        </div>
        <dashboard-widget-container edit-mode />
        <dashboard-customize-sidebar :loading="props.loading"
                                     :save-button-text="props.saveButtonText"
                                     :hide-cancel-button="props.hideCancelButton"
                                     @save="handleSave"
                                     @cancel="goBack"
        />
    </div>
</template>

<script setup lang="ts">
import {
    computed, onBeforeUnmount, onMounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PDivider } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardCustomizePageName
    from '@/services/dashboards/components/DashboardCustomizePageName.vue';
import DashboardCustomizeSidebar from '@/services/dashboards/components/DashboardCustomizeSidebar.vue';
import DashboardLabels from '@/services/dashboards/components/DashboardLabels.vue';
import DashboardRefreshDropdown from '@/services/dashboards/components/DashboardRefreshDropdown.vue';
import DashboardToolset from '@/services/dashboards/components/DashboardToolset.vue';
import DashboardVariables from '@/services/dashboards/components/DashboardVariables.vue';
import DashboardWidgetContainer from '@/services/dashboards/components/DashboardWidgetContainer.vue';
import type {
    DashboardTemplate,
} from '@/services/dashboards/config';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';

interface Props {
    dashboardId?: string;
    loading?: boolean;
    saveButtonText?: TranslateResult;
    hideCancelButton?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'go-back'): void,
    (e: 'save'): void}>();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const state = reactive({
    name: dashboardDetailState.name,
    apiParam: computed<Partial<DashboardTemplate>>(() => ({
        name: dashboardDetailState.name,
        labels: dashboardDetailState.labels,
        settings: dashboardDetailState.settings,
        layouts: [dashboardDetailState.dashboardWidgetInfoList],
        variables: dashboardDetailState.variables,
        variables_schema: dashboardDetailState.variablesSchema,
        tags: { created_by: store.state.user.userId },
    })),
    isCreateMode: computed(() => !props.dashboardId),
});

/* Api */
const getDashboardData = async () => {
    try {
        await dashboardDetailStore.getDashboardInfo(props.dashboardId);
    } catch (e) {
        ErrorHandler.handleError(e);
        await SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.ALL._NAME });
    }
};



/* Event */
const handleUpdateDashboardName = (name: string) => {
    state.name = name;
};
const handleSave = async () => {
    dashboardDetailStore.$patch({ name: state.name });
    emit('save');
};
const goBack = () => {
    emit('go-back');
};

// for preventing refresh
const handleUnload = (event) => {
    event.preventDefault(); event.returnValue = '';
};

watch(() => dashboardDetailState.name, (name: string) => {
    state.name = name;
});

onMounted(() => {
    getDashboardData();
    window.addEventListener('beforeunload', handleUnload);
});

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleUnload);
});
</script>

<style lang="postcss" scoped>
.dashboard-customize {
    @apply relative;
    .filters-box {
        @apply flex justify-between items-start;
        margin-bottom: 1.3125rem;
    }

    .dashboard-selectors {
        @apply relative flex justify-between items-start z-10;
        padding: 1.5rem 0 1.25rem;

        .variable-selector-wrapper {
            @apply relative flex items-center flex-wrap;
            gap: 0.5rem;
            padding-right: 1rem;
        }
    }
}
</style>
