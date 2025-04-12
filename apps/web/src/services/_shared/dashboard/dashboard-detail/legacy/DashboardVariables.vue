<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { isEqual, xor } from 'lodash';

import { PI, PTextButton, PDivider } from '@cloudforet/mirinae';

import type { DashboardVariables, DashboardVariablesSchema } from '@/api-clients/dashboard/_types/dashboard-type';

import ChangedMark from '@/common/components/marks/ChangedMark.vue';

import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';
import DashboardVariableDropdown from '@/services/_shared/dashboard/dashboard-detail/legacy/DashboardVariableDropdown.vue';
import { useDashboardDetailInfoStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-detail-info-store';
import { useAllReferenceTypeInfoStore } from '@/services/dashboards/stores/all-reference-type-info-store';


interface Props {
    loading?: boolean;
    originVariables?: DashboardVariables;
    originVariablesSchema?: DashboardVariablesSchema;
    disableSaveButton?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update', val: { variables?: DashboardVariables, variables_schema?: DashboardVariablesSchema }): void;
}>();
const route = useRoute();
const dashboardId = computed(() => route.params.dashboardId);

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;
const { dashboard } = useDashboardGetQuery({
    dashboardId,
});
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();

const state = reactive({
    variableProperties: computed(() => dashboardDetailGetters.refinedVariablesSchema.properties),
    order: computed(() => dashboardDetailGetters.refinedVariablesSchema.order),
    allReferenceTypeInfo: computed(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    modifiedVariablesSchemaProperties: computed<string[]>(() => {
        if (props.disableSaveButton) return [];
        const results: string[] = [];
        const prevUsedProperties = Object.entries(dashboard.value?.variables_schema?.properties ?? {}).filter(([, v]) => v.use);
        const currUsedProperties = Object.entries(dashboardDetailGetters.refinedVariablesSchema.properties).filter(([, v]) => v.use);
        // check variables changed
        currUsedProperties.forEach(([k]) => {
            if (!isEqual(dashboard.value?.variables?.[k], dashboardDetailState.variables?.[k])) {
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
    const _originVariables = props.originVariables ?? dashboard.value?.variables;
    const _originVariablesSchema = props.originVariablesSchema ?? dashboard.value?.variables_schema;
    dashboardDetailStore.resetVariables(_originVariables, _originVariablesSchema);
};

</script>

<template>
    <div class="dashboard-variables-select-dropdown">
        <template v-for="(propertyName, idx) in state.order">
            <div v-if="state.variableProperties[propertyName]?.use"
                 :key="`${propertyName}-${idx}`"
            >
                <dashboard-variable-dropdown :property-name="propertyName"
                                             :property-label="state.variableProperties[propertyName]?.name"
                                             :property="state.variableProperties[propertyName]"
                                             :reference-map="state.allReferenceTypeInfo[propertyName]?.referenceMap"
                                             :disabled="props.loading"
                                             :dashboard-variables="dashboardDetailState.variables"
                />
                <changed-mark v-if="state.modifiedVariablesSchemaProperties.includes(propertyName)" />
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
