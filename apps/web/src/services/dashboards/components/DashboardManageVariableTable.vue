<script setup lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PBadge, PDataTable, PSelectStatus, PToggleButton, PCollapsiblePanel, PIconButton,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import type {
    DashboardVariableSchemaProperty,
} from '@/schema/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface VariablesPropertiesForManage extends DashboardVariableSchemaProperty {
    propertyName: string;
    manageable?: boolean;
}
interface EmitFn {
    (e: 'delete', value: string): void;
    (e: 'edit', name: string): void;
    (e: 'clone', name: string): void;
}

type VariableType = 'ALL'|'MANAGED'|'CUSTOM';

const emit = defineEmits<EmitFn>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;

const state = reactive({
    orderedVariables: [] as VariablesPropertiesForManage[],
    variableFilterList: computed(() => [
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_ALL'), name: 'ALL' },
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_MANAGED'), name: 'MANAGED' },
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_CUSTOM'), name: 'CUSTOM' },
    ]),
    selectedVariableType: 'ALL' as VariableType,
    variableFields: [
        { name: 'name', label: 'Name', width: '220px' },
        { name: 'selection_type', label: 'Selection Type' },
        { name: 'variable_type', label: 'Variable Type' },
        { name: 'use', label: 'Use', width: '90px' },
        { name: 'description', label: 'Description', width: '360px' },
        { name: 'manageable', label: ' ', width: '144px' },
    ],
    selectionType: computed(() => ({
        SINGLE: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.SINGLE_SELECT'),
        MULTI: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.MULTI_SELECT'),
    })),
    variableType: computed<Partial<Record<VariableType, TranslateResult>>>(() => ({
        MANAGED: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_MANAGED'),
        CUSTOM: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_CUSTOM'),
    })),
});

/* EVENT */
const handleSelectType = (selected: VariableType) => {
    state.selectedVariableType = selected;
};
const handleCloneVariable = (propertyName: string) => {
    emit('clone', propertyName);
};
const handleEditVariable = (propertyName: string) => {
    emit('edit', propertyName);
};
const handleDeleteVariable = (propertyName: string) => {
    emit('delete', propertyName);
};
const handleToggleUse = (propertyName: string, value: boolean) => {
    // change use in state.orderedVariables
    const selectedIndex = state.orderedVariables.findIndex((variable) => variable.propertyName === propertyName);
    if (selectedIndex === -1) return;
    state.orderedVariables[selectedIndex].use = !value;

    // change use in store
    const _variablesSchema = cloneDeep(dashboardDetailGetters.refinedVariablesSchema);
    _variablesSchema.properties[propertyName].use = !value;
    dashboardDetailStore.setVariablesSchema(_variablesSchema);
};

/* Helper */
const variableTypeBadgeStyleFormatter = (type: VariableType) => {
    if (type === 'MANAGED') return 'gray500';
    return 'primary';
};
const convertAndUpdateVariablesForTable = (order: string[]) => {
    const properties = dashboardDetailGetters.refinedVariablesSchema.properties;
    const convertedVariables = order.map((d) => ({
        ...properties[d],
        propertyName: d,
        manageable: properties[d].variable_type !== 'MANAGED' ? true : undefined,
    }));
    if (state.selectedVariableType === 'ALL') {
        state.orderedVariables = convertedVariables;
    } else if (state.selectedVariableType === 'MANAGED') {
        state.orderedVariables = convertedVariables.filter((d) => d.variable_type === 'MANAGED');
    } else {
        state.orderedVariables = convertedVariables.filter((d) => d.variable_type !== 'MANAGED');
    }
};

watch([() => dashboardDetailState.variablesSchema.order, () => state.selectedVariableType], ([_order]) => {
    convertAndUpdateVariablesForTable(_order);
}, { immediate: true });

const {
    orderedVariables,
    variableFilterList,
    selectedVariableType,
    variableFields,
    selectionType,
    variableType,
} = toRefs(state);

</script>

<template>
    <div class="list-wrapper">
        <div class="variable-select-filter">
            <span class="filter-header">{{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_TITLE') }}</span>
            <p-select-status v-for="(type, idx) in variableFilterList"
                             :key="`variable-type-${idx}`"
                             :selected="selectedVariableType"
                             :value="type.name"
                             @change="handleSelectType"
            >
                {{ type.label }}
            </p-select-status>
        </div>
        <p-data-table class="variable-table"
                      :items="orderedVariables"
                      :fields="variableFields"
        >
            <template #col-selection_type-format="{ value }">
                <span>{{ selectionType[value] }}</span>
            </template>
            <template #col-variable_type-format="{ value }">
                <p-badge :style-type="variableTypeBadgeStyleFormatter(value)"
                         badge-type="solid-outline"
                >
                    {{ variableType[value] }}
                </p-badge>
            </template>
            <template #col-use-format="{ value, item }">
                <p-toggle-button :value="value"
                                 :disabled="item.disabled || item.required"
                                 @change-toggle="handleToggleUse(item.propertyName, value)"
                />
            </template>
            <template #col-description-format="{ value }">
                <p-collapsible-panel class="options-area"
                                     is-collapsed
                                     :line-clamp="1"
                >
                    {{ $t(value) }}
                </p-collapsible-panel>
            </template>
            <template #col-manageable-format="{ item, value }">
                <div v-if="value"
                     class="button-wrapper"
                >
                    <p-icon-button name="ic_duplicate"
                                   @click="handleCloneVariable(item.percentage)"
                    />
                    <p-icon-button name="ic_edit"
                                   @click="handleEditVariable(item.percentage)"
                    />
                    <p-icon-button name="ic_delete"
                                   style-type="negative-transparent"
                                   @click="handleDeleteVariable(item.percentage)"
                    />
                </div>
            </template>
        </p-data-table>
    </div>
</template>

<style lang="postcss" scoped>
.list-wrapper {
    .variable-select-filter {
        @apply flex items-center;
        height: 2.875rem;
        gap: 1rem;
        padding: 0.75rem 1rem;

        .filter-header {
            @apply text-gray-500;
            font-size: 0.875rem;
            line-height: 1.25;
        }
    }
    .variable-table {
        .options-area {
            padding: 0;
        }
        .button-wrapper {
            @apply w-full flex items-center justify-between;
        }
    }
}
</style>
