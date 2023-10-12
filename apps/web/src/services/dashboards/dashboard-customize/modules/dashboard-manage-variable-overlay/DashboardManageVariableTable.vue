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
                                 :disabled="item.disabled"
                                 @change-toggle="handleToggleUse(item.propertyName, value)"
                />
            </template>
            <template #col-description-format="{ value }">
                <p-collapsible-panel class="options-area"
                                     is-collapsed
                                     :line-clamp="1"
                >
                    {{ value }}
                </p-collapsible-panel>
            </template>
            <template #col-managable-format="{ value }">
                <div v-if="value"
                     class="button-wrapper"
                >
                    <p-icon-button name="ic_duplicate"
                                   @click="handleClonrVariable(value)"
                    />
                    <p-icon-button name="ic_edit"
                                   @click="handleEditVariable(value)"
                    />
                    <p-icon-button name="ic_delete"
                                   style-type="negative-transparent"
                                   @click="handleDeleteVariable(value)"
                    />
                </div>
            </template>
        </p-data-table>
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PBadge, PDataTable, PSelectStatus, PToggleButton, PCollapsiblePanel, PIconButton,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';


import type { VariableType, DashboardVariableSchemaProperty } from '@/services/dashboards/config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';

interface VariablesPropertiesForManage extends DashboardVariableSchemaProperty {
    propertyName: string;
    managable?: string;
}
interface EmitFn {
    (e: 'delete', value: string): void;
    (e: 'edit', name: string): void;
    (e: 'clone', name: string): void;
}

const emit = defineEmits<EmitFn>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const state = reactive({
    orderedVariables: [] as VariablesPropertiesForManage[],
    variableFilterList: computed(() => [
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_ALL'), name: 'ALL' },
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_MANAGED'), name: 'MANAGED' },
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_CUSTOM'), name: 'CUSTOM' },
    ]),
    selectedVariableType: 'ALL',
    variableFields: [
        { name: 'name', label: 'Name', width: '220px' },
        { name: 'selection_type', label: 'Selection Type' },
        { name: 'variable_type', label: 'Variable Type' },
        { name: 'use', label: 'Use', width: '90px' },
        { name: 'description', label: 'Description', width: '360px' },
        { name: 'managable', label: ' ', width: '144px' },
    ],
    selectionType: computed(() => ({
        SINGLE: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.SINGLE_SELECT'),
        MULTI: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.MULTI_SELECT'),
    })),
    variableType: computed(() => ({
        MANAGED: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_MANAGED'),
        CUSTOM: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_CUSTOM'),
    })),
    allReferenceTypeInfo: computed(() => store.getters['reference/allReferenceTypeInfo']),
});

/* EVENT */
const handleSelectType = (selected) => {
    state.selectedVariableType = selected;
};
const handleClonrVariable = (propertyName: string) => {
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
    dashboardDetailStore.$patch((_state) => {
        _state.variablesSchema.properties[propertyName].use = !value;
    });
};

/* Helper */
const variableTypeBadgeStyleFormatter = (type: VariableType) => {
    if (type === 'MANAGED') return 'gray500';
    return 'primary';
};
const convertAndUpdateVariablesForTable = (order: string[]) => {
    const properties = dashboardDetailState.variablesSchema.properties;
    const convertedVariables = order.map((d) => {
        if (properties[d].variable_type === 'MANAGED') {
            return {
                ...properties[d],
                propertyName: d,
            };
        }
        return {
            ...properties[d],
            propertyName: d,
            managable: d,
        };
    });
    if (state.selectedVariableType === 'ALL') {
        state.orderedVariables = convertedVariables;
    } else state.orderedVariables = convertedVariables.filter((d) => d.variable_type === state.selectedVariableType);
};

watch(() => dashboardDetailState.variablesSchema.order, (_order) => {
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
