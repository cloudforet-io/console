<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { isEqual } from 'lodash';

import { PI, PTextButton, PDivider } from '@cloudforet/mirinae';

import type { DashboardGlobalVariable } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import type { DashboardGlobalVariableSchemaProperties, DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ChangedMark from '@/common/components/marks/ChangedMark.vue';

import DashboardGlobalVariableFilter
    from '@/services/dashboards/components/dashboard-detail/DashboardGlobalVariableFilter.vue';
import DashboardManageVariableOverlay from '@/services/dashboards/components/dashboard-detail/DashboardManageVariableOverlay.vue';
import DashboardVariablesMoreButton
    from '@/services/dashboards/components/dashboard-detail/DashboardVariablesMoreButton.vue';
import { useDashboardDetailQuery } from '@/services/dashboards/composables/use-dashboard-detail-query';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/constants/manage-variable-overlay-constant';
import { getOrderedGlobalVariables } from '@/services/dashboards/helpers/dashboard-global-variables-helper';
import { useAllReferenceTypeInfoStore } from '@/services/dashboards/stores/all-reference-type-info-store';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';



interface Props {
    isProjectDashboard?: boolean;
    loading?: boolean;
    disableSaveButton?: boolean;
    originVars?: DashboardVars;
    widgetMode?: boolean; // NOTE: this for widget mode (temporary)
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update', val: { vars?: DashboardVars }): void;
}>();

const route = useRoute();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const appContextStore = useAppContextStore();
const { dashboard } = useDashboardDetailQuery({
    dashboardId: computed(() => dashboardDetailState.dashboardId),
});
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    showOverlay: computed(() => route.hash === `#${MANAGE_VARIABLES_HASH_NAME}`),
    dashboardVarsSchemaProperties: computed<DashboardGlobalVariableSchemaProperties>(() => dashboard.value?.vars_schema?.properties ?? {}),
    dashboardVars: computed<DashboardVars>(() => dashboard.value?.vars ?? {}),
    tempVars: undefined as DashboardVars|undefined,
    globalVariables: computed<DashboardGlobalVariable[]>(() => {
        const properties = state.dashboardVarsSchemaProperties as Record<string, DashboardGlobalVariable>;
        const _usedProperties: DashboardGlobalVariable[] = Object.values(properties).filter((d) => d.use);
        if (props.isProjectDashboard) {
            const _usedPropertiesWithoutProject = getOrderedGlobalVariables(_usedProperties).filter((d) => d.key !== 'project_id');
            return getOrderedGlobalVariables(_usedPropertiesWithoutProject);
        }
        return getOrderedGlobalVariables(_usedProperties);
    }),
    allReferenceTypeInfo: computed(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    modifiedVariablesSchemaProperties: computed<string[]>(() => {
        const results: string[] = [];
        state.globalVariables.forEach((_var) => {
            if (!isEqual(state.dashboardVars?.[_var.key], state.tempVars?.[_var.key])) {
                results.push(_var.key);
            }
        });
        return results;
    }),
    showSaveButton: computed<boolean>(() => !props.disableSaveButton && state.modifiedVariablesSchemaProperties.length > 0),
    notChanged: computed(() => state.modifiedVariablesSchemaProperties.length === 0),
    isSharedDashboard: computed<boolean>(() => !!dashboard.value?.shared && !storeState.isAdminMode),
});

const handleClickSaveButton = () => {
    emit('update', { vars: state.tempVars });
};
const handleResetVariables = () => {
    const _originVars = state.dashboardVars;
    state.tempVars = { ..._originVars };
    dashboardDetailStore.setVars(_originVars);
};

const handleUpdateVars = (val: DashboardVars) => {
    state.tempVars = val;
    dashboardDetailStore.setVars(val);
};

watch(() => dashboard.value?.vars, (_vars) => {
    state.tempVars = { ..._vars };
}, { immediate: true });
</script>

<template>
    <div v-if="!dashboardDetailState.loadingDashboard"
         :class="{'dashboard-variables-select-dropdown': true, 'detail-page': !props.widgetMode}"
    >
        <template v-for="(property, idx) in state.globalVariables">
            <div :key="`${property.name}-${idx}`">
                <dashboard-global-variable-filter :variable="property"
                                                  :vars="state.tempVars"
                                                  @update:vars="handleUpdateVars"
                />
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
        <dashboard-variables-more-button v-if="!state.isSharedDashboard"
                                         :widget-mode="props.widgetMode"
        />
        <portal to="dashboard-detail-page">
            <dashboard-manage-variable-overlay :visible="state.showOverlay" />
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
