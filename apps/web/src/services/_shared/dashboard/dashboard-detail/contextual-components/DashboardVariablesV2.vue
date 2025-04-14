<script lang="ts" setup>
import {
    computed, reactive, watch, onUnmounted,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { isEqual } from 'lodash';

import { PI, PTextButton, PDivider } from '@cloudforet/mirinae';

import type { DashboardGlobalVariable } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import type {
    DashboardFolderModel, DashboardGlobalVariableSchemaProperties, DashboardModel, DashboardVars,
} from '@/api-clients/dashboard/_types/dashboard-type';


import ChangedMark from '@/common/components/marks/ChangedMark.vue';

import { useDashboardManageable } from '@/services/_shared/dashboard/core/composables/_internal/use-dashboard-manageable';
import { useDashboardSharedContext } from '@/services/_shared/dashboard/core/composables/_internal/use-dashboard-shared-context';
import DashboardGlobalVariableFilter
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardGlobalVariableFilter.vue';
import DashboardManageVariableImportModal
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardManageVariableImportModal.vue';
import DashboardManageVariableOverlay
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardManageVariableOverlay.vue';
import DashboardVariablesMoreButton
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardVariablesMoreButton.vue';
import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/_shared/dashboard/dashboard-detail/constants/manage-variable-overlay-constant';
import { getOrderedGlobalVariables } from '@/services/_shared/dashboard/dashboard-detail/helpers/dashboard-global-variables-helper';
import { useDashboardDetailInfoStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-detail-info-store';
import { useDashboardVarsStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-vars-store';
import { useAllReferenceTypeInfoStore } from '@/services/dashboards/stores/all-reference-type-info-store';

interface Props {
    loading?: boolean;
    disableSaveButton?: boolean;
    originVars?: DashboardVars;
    widgetMode?: boolean; // NOTE: this for widget mode (temporary)
    dashboardId: string;
    dashboardItems?: Array<DashboardModel>;
    folderItems?: Array<DashboardFolderModel>;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update', val: { vars?: DashboardVars }): void;
}>();

const route = useRoute();
const dashboardId = computed(() => props.dashboardId);

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardVarsStore = useDashboardVarsStore();
const dashboardVarsState = dashboardVarsStore.state;
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const { dashboard } = useDashboardGetQuery({
    dashboardId,
});

const {
    entryPoint,
} = useDashboardSharedContext();

const { getDashboardManageable } = useDashboardManageable();

const state = reactive({
    showOverlay: computed(() => route.hash === `#${MANAGE_VARIABLES_HASH_NAME}`),
    dashboardVarsSchemaProperties: computed<DashboardGlobalVariableSchemaProperties>(() => dashboard.value?.vars_schema?.properties ?? {}),
    dashboardVars: computed<DashboardVars>(() => dashboard.value?.vars ?? {}),
    globalVariables: computed<DashboardGlobalVariable[]>(() => {
        const properties = state.dashboardVarsSchemaProperties as Record<string, DashboardGlobalVariable>;
        const _usedProperties: DashboardGlobalVariable[] = Object.values(properties).filter((d) => d.use);
        if (entryPoint.value === 'PROJECT') {
            const _usedPropertiesWithoutProject = getOrderedGlobalVariables(_usedProperties).filter((d) => d.key !== 'project_id' && d.key !== 'project_group_id');
            return getOrderedGlobalVariables(_usedPropertiesWithoutProject);
        }
        return getOrderedGlobalVariables(_usedProperties);
    }),
    allReferenceTypeInfo: computed(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    modifiedVariablesSchemaProperties: computed<string[]>(() => {
        const results: string[] = [];
        state.globalVariables.forEach((_var) => {
            if (!isEqual(state.dashboardVars?.[_var.key], dashboardVarsState.vars?.[_var.key])) {
                results.push(_var.key);
            }
        });
        return results;
    }),
    showSaveButton: computed<boolean>(() => !props.disableSaveButton && state.modifiedVariablesSchemaProperties.length > 0),
    notChanged: computed(() => state.modifiedVariablesSchemaProperties.length === 0),
});

const handleClickSaveButton = () => {
    emit('update', { vars: dashboardVarsState.vars });
};
const handleResetVariables = () => {
    dashboardVarsStore.setVars(dashboard.value?.vars);
};

watch(() => dashboard.value?.vars, (_vars) => {
    dashboardVarsStore.setVars(_vars);
}, { immediate: true, deep: true });


onUnmounted(() => {
    dashboardVarsStore.reset();
});

</script>

<template>
    <div v-if="!dashboardDetailState.loadingDashboard"
         :class="{'dashboard-variables-select-dropdown': true, 'detail-page': !props.widgetMode}"
    >
        <template v-for="(property, idx) in state.globalVariables">
            <div :key="`${property.name}-${idx}`">
                <dashboard-global-variable-filter :variable="property" />
                <changed-mark v-if="state.modifiedVariablesSchemaProperties.includes(property.key)" />
            </div>
        </template>
        <p-text-button style-type="highlight"
                       class="reset-button"
                       :disabled="props.loading || state.notChanged"
                       @click="handleResetVariables"
        >
            <p-i name="ic_refresh"
                 width="1rem"
                 height="1rem"
                 color="inherit"
            />
            <span>{{ $t('DASHBOARDS.CUSTOMIZE.RESET') }}</span>
        </p-text-button>
        <p-divider v-if="state.showSaveButton"
                   :vertical="true"
        />
        <p-text-button v-if="state.showSaveButton"
                       style-type="highlight"
                       :loading="props.loading"
                       :disabled="props.loading"
                       @click.stop="handleClickSaveButton"
        >
            {{ $t('DASHBOARDS.CUSTOMIZE.SAVE') }}
        </p-text-button>
        <dashboard-variables-more-button v-if="getDashboardManageable(dashboard)"
                                         :widget-mode="props.widgetMode"
                                         :dashboard-id="dashboardId"
        />
        <portal to="dashboard-manage-variable-overlay">
            <dashboard-manage-variable-overlay :visible="state.showOverlay"
                                               :dashboard-id="dashboardId"
            />
        </portal>
        <portal to="dashboard-manage-variable-import-modal">
            <dashboard-manage-variable-import-modal :dashboard-id="dashboardId"
                                                    :dashboard-items="props.dashboardItems"
                                                    :folder-items="props.folderItems"
            />
        </portal>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-variables-select-dropdown {
    &.detail-page {
        @apply w-full;
    }
    .reset-button {
        @apply flex items-center;
        gap: 0.25rem;
    }
    .p-divider {
        &.vertical {
            height: 1rem;
        }
    }
}
</style>
