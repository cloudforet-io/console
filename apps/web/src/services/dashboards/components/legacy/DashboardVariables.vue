<script lang="ts" setup>
import type Vue from 'vue';
import { computed, getCurrentInstance, reactive } from 'vue';

import { isEqual, xor } from 'lodash';

import { PI, PTextButton, PDivider } from '@cloudforet/mirinae';

import type { DashboardVariables, DashboardVariablesSchema } from '@/schema/dashboard/_types/dashboard-type';

import DashboardVariableDropdown from '@/services/dashboards/components/dashboard-detail/DashboardVariableDropdown.vue';
import DashboardManageVariableOverlay
    from '@/services/dashboards/components/legacy/DashboardManageVariableOverlay.vue';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/constants/manage-variable-overlay-constant';
import { DASHBOARD_TEMPLATES } from '@/services/dashboards/dashboard-template/template-list';
import { useAllReferenceTypeInfoStore } from '@/services/dashboards/stores/all-reference-type-info-store';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    loading?: boolean;
    originVariables?: DashboardVariables;
    originVariablesSchema?: DashboardVariablesSchema;
    disableSaveButton?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update', val: { variables?: DashboardVariables, variables_schema?: DashboardVariablesSchema }): void;
}>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;

const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();

const vm = getCurrentInstance()?.proxy as Vue;

const state = reactive({
    showOverlay: computed(() => vm.$route.hash === `#${MANAGE_VARIABLES_HASH_NAME}`),
    variableProperties: computed(() => dashboardDetailGetters.refinedVariablesSchema.properties),
    order: computed(() => dashboardDetailGetters.refinedVariablesSchema.order),
    allReferenceTypeInfo: computed(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    modifiedVariablesSchemaProperties: computed<string[]>(() => {
        if (props.disableSaveButton) return [];
        const results: string[] = [];
        const prevUsedProperties = Object.entries(dashboardDetailState.dashboardInfo?.variables_schema.properties ?? {}).filter(([, v]) => v.use);
        const currUsedProperties = Object.entries(dashboardDetailGetters.refinedVariablesSchema.properties).filter(([, v]) => v.use);
        // check variables changed
        currUsedProperties.forEach(([k]) => {
            if (!isEqual(dashboardDetailState.dashboardInfo?.variables?.[k], dashboardDetailState.variables?.[k])) {
                results.push(k);
            }
        });
        // check schema changed
        results.push(...xor(prevUsedProperties.map(([k]) => k), currUsedProperties.map(([k]) => k)));
        return results;
    }),
    showSaveButton: computed<boolean>(() => !props.disableSaveButton && state.modifiedVariablesSchemaProperties.length > 0),
});

const handleClickSaveButton = () => {
    emit('update', {
        variables: dashboardDetailState.variables,
        variables_schema: dashboardDetailState.variablesSchema,
    });
};
const handleResetVariables = () => {
    const _originVariables = props.originVariables ?? dashboardDetailState.dashboardInfo?.variables ?? DASHBOARD_TEMPLATES[dashboardDetailState.templateId].variables;
    const _originVariablesSchema = props.originVariablesSchema ?? dashboardDetailState.dashboardInfo?.variables_schema ?? DASHBOARD_TEMPLATES[dashboardDetailState.templateId].variables_schema;
    dashboardDetailStore.resetVariables(_originVariables, _originVariablesSchema);
};

</script>

<template>
    <div class="dashboard-variables-select-dropdown">
        <template v-for="(propertyName, idx) in state.order">
            <div v-if="state.variableProperties[propertyName]?.use"
                 :key="`${propertyName}-${idx}`"
                 class="variable-selector-box"
            >
                <dashboard-variable-dropdown :property-name="propertyName"
                                             :property-label="state.variableProperties[propertyName]?.name"
                                             :property="state.variableProperties[propertyName]"
                                             :reference-map="state.allReferenceTypeInfo[propertyName]?.referenceMap"
                                             :disabled="props.loading"
                                             :dashboard-variables="dashboardDetailState.variables"
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
        <dashboard-manage-variable-overlay :visible="state.showOverlay" />
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
