<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { isEqual } from 'lodash';

import { PI, PTextButton, PDivider } from '@cloudforet/mirinae';

import type { DashboardVariableSchemaProperty, DashboardVars } from '@/schema/dashboard/_types/dashboard-type';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import DashboardVariableDropdown from '@/services/dashboards/components/DashboardVariableDropdown.vue';
import {
    MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP,
    MANAGED_DASHBOARD_VARIABLES_SCHEMA,
} from '@/services/dashboards/constants/dashboard-managed-variables-schema';
import { useAllReferenceTypeInfoStore } from '@/services/dashboards/stores/all-reference-type-info-store';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    loading?: boolean;
    disableSaveButton?: boolean;
    originVars?: DashboardVars;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update', val: { vars?: DashboardVars }): void;
}>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const appContextStore = useAppContextStore();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    variableProperties: computed<Record<string, DashboardVariableSchemaProperty>>(() => {
        const _defaultDashboardVariables: Record<string, DashboardVariableSchemaProperty> = {};
        if (storeState.isAdminMode) {
            _defaultDashboardVariables.workspace = MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties[MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.workspace.key];
        }
        _defaultDashboardVariables.project = MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties[MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.project.key];
        _defaultDashboardVariables.service_account = MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties[MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.service_account.key];
        _defaultDashboardVariables.region = MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties[MANAGED_DASHBOARD_VARIABLE_MODEL_INFO_MAP.region.key];
        return _defaultDashboardVariables;
    }),
    allReferenceTypeInfo: computed(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    modifiedVariablesSchemaProperties: computed<string[]>(() => {
        if (props.disableSaveButton) return [];
        const results: string[] = [];
        Object.entries(state.variableProperties).forEach(([k]) => {
            if (!isEqual(dashboardDetailState.dashboardInfo?.vars?.[k], dashboardDetailState.vars?.[k])) {
                results.push(k);
            }
        });
        return results;
    }),
    showSaveButton: computed<boolean>(() => !props.disableSaveButton && state.modifiedVariablesSchemaProperties.length > 0),
});

const handleClickSaveButton = () => {
    emit('update', { vars: dashboardDetailState.vars });
    dashboardDetailStore.setVars(dashboardDetailState.vars);
};
const handleResetVariables = () => {
    const _originVars = props.originVars ?? dashboardDetailState.dashboardInfo?.vars ?? {};
    dashboardDetailStore.setVars(_originVars);
};
</script>

<template>
    <div class="dashboard-variables-select-dropdown">
        <template v-for="([propertyName, property], idx) in Object.entries(state.variableProperties)">
            <div :key="`${propertyName}-${idx}`"
                 class="variable-selector-box"
            >
                <dashboard-variable-dropdown :property-name="propertyName"
                                             :property-label="property.name"
                                             :property="property"
                                             :reference-map="state.allReferenceTypeInfo[propertyName]?.referenceMap"
                                             :disabled="props.loading"
                                             :dashboard-variables="dashboardDetailState.vars"
                />
                <span class="circle-mark"
                      :class="{'changed': state.modifiedVariablesSchemaProperties.includes(propertyName)}"
                />
            </div>
        </template>
        <p-text-button style-type="highlight"
                       class="reset-button"
                       :disabled="props.loading"
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
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-variables-select-dropdown {
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
