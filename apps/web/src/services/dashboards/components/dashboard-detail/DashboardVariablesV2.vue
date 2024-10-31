<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { isEqual, orderBy } from 'lodash';

import { PI, PTextButton, PDivider } from '@cloudforet/mirinae';

import type { DashboardGlobalVariable } from '@/schema/dashboard/_types/dashboard-global-variable-type';
import type { DashboardVariableSchemaProperty, DashboardVars } from '@/schema/dashboard/_types/dashboard-type';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import DashboardGlobalVariableFilter
    from '@/services/dashboards/components/dashboard-detail/DashboardGlobalVariableFilter.vue';
import DashboardManageVariableOverlay from '@/services/dashboards/components/dashboard-detail/DashboardManageVariableOverlay.vue';
// import DashboardVariableDropdown from '@/services/dashboards/components/dashboard-detail/DashboardVariableDropdown.vue';
import DashboardVariablesMoreButton
    from '@/services/dashboards/components/dashboard-detail/DashboardVariablesMoreButton.vue';
import {
    MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP,
    MANAGED_DASHBOARD_VARIABLES_SCHEMA,
} from '@/services/dashboards/constants/dashboard-managed-variables-schema';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/constants/manage-variable-overlay-constant';
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
const dashboardDetailGetters = dashboardDetailStore.getters;
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const appContextStore = useAppContextStore();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    showOverlay: computed(() => route.hash === `#${MANAGE_VARIABLES_HASH_NAME}`),
    variableProperties: computed<Record<string, DashboardVariableSchemaProperty>>(() => {
        const _defaultDashboardVariables: Record<string, DashboardVariableSchemaProperty> = {};
        if (storeState.isAdminMode) {
            _defaultDashboardVariables.workspace = MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties[MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.workspace.key];
        }
        if (!props.isProjectDashboard) {
            _defaultDashboardVariables.project = MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties[MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.project.key];
        }
        _defaultDashboardVariables.service_account = MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties[MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.service_account.key];
        _defaultDashboardVariables.region = MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties[MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.region.key];
        return _defaultDashboardVariables;
    }),
    newGlobalVariables: computed<DashboardGlobalVariable[]>(() => {
        const properties = dashboardDetailGetters.dashboardVarsSchemaProperties;
        return orderBy(Object.values(properties), ['name'], ['asc']);
    }),
    allReferenceTypeInfo: computed(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    modifiedVariablesSchemaProperties: computed<string[]>(() => {
        const results: string[] = [];
        state.newGlobalVariables.forEach((_var) => {
            if (!isEqual(dashboardDetailGetters.dashboardInfo?.vars?.[_var.key], dashboardDetailState.vars?.[_var.key])) {
                results.push(_var.key);
            }
        });
        return results;
    }),
    showSaveButton: computed<boolean>(() => !props.disableSaveButton && state.modifiedVariablesSchemaProperties.length > 0),
    notChanged: computed(() => state.modifiedVariablesSchemaProperties.length === 0),
    isSharedDashboard: computed<boolean>(() => !!dashboardDetailGetters.dashboardInfo?.shared && !storeState.isAdminMode),
});

const handleClickSaveButton = () => {
    emit('update', { vars: dashboardDetailState.vars });
    dashboardDetailStore.setVars(dashboardDetailState.vars);
};
const handleResetVariables = () => {
    const _originVars = props.originVars ?? dashboardDetailGetters.dashboardInfo?.vars ?? {};
    dashboardDetailStore.setVars(_originVars);
};
</script>

<template>
    <div :class="{'dashboard-variables-select-dropdown': true, 'detail-page': !props.widgetMode}">
        <template v-for="(property, idx) in state.newGlobalVariables">
            <div :key="`${property.name}-${idx}`"
                 class="variable-selector-box"
            >
                <dashboard-global-variable-filter :variable="property" />
                <span class="circle-mark"
                      :class="{'changed': state.modifiedVariablesSchemaProperties.includes(property.key)}"
                />
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
        <dashboard-variables-more-button v-if="!state.isSharedDashboard" />
        <dashboard-manage-variable-overlay :visible="state.showOverlay" />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-variables-select-dropdown {
    &.detail-page {
        @apply w-full;
    }
    .variable-selector-box {
        position: relative;
        .circle-mark {
            &.changed {
                @apply bg-secondary1 rounded-xl border-white border-2;
                position: absolute;
                width: 0.75rem;
                height: 0.75rem;
                right: -0.25rem;
                top: -0.25rem;
            }
        }
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
