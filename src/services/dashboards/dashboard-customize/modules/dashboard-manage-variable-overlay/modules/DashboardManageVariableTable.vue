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
                         outline
                >
                    {{ variableType[value] }}
                </p-badge>
            </template>
            <template #col-use-format="{ value, item }">
                <p-toggle-button :value="value"
                                 :disabled="item.disabled"
                                 sync
                                 @change="handleToggleUse(item.propertyName, value)"
                />
            </template>
            <template #col-options-format="{ value }">
                <p-collapsible-panel class="options-area"
                                     is-collapsed
                                     :line-clamp="1"
                >
                    {{ value.join(', ') }}
                </p-collapsible-panel>
            </template>
            <template #col-managable-format="{ value }">
                <div v-if="value"
                     class="button-wrapper"
                >
                    <p-button class="manage-button"
                              style-type="tertiary"
                              icon-left="ic_edit"
                              size="sm"
                              @click="handleEditVariable(value)"
                    >
                        {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.EDIT') }}
                    </p-button>
                    <p-button class="manage-button"
                              style-type="negative-secondary"
                              icon-left="ic_trashcan"
                              size="sm"
                              @click="handleDeleteVariable(value)"
                    >
                        {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.DELETE') }}
                    </p-button>
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
    PBadge, PDataTable, PSelectStatus, PToggleButton, PButton, PCollapsiblePanel,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';


import type { VariableType, DashboardVariableSchemaProperty } from '@/services/dashboards/config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';

interface VariablesPropertiesForManage extends DashboardVariableSchemaProperty {
    propertyName: string;
    managable?: string;
}
interface EmitFn {
    (e: 'delete', value: string): void;
    (e: 'edit', name: string): void;
}

const emit = defineEmits<EmitFn>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const state = reactive({
    orderedVariables: [] as VariablesPropertiesForManage[],
    variableFilterList: computed(() => [
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_ALL'), name: 'ALL' },
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_MANAGED'), name: 'MANAGED' },
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_CUSTOM'), name: 'CUSTOM' },
    ]),
    selectedVariableType: 'ALL',
    variableFields: [
        { name: 'name', label: 'Name' },
        { name: 'selection_type', label: 'Selection Type' },
        { name: 'variable_type', label: 'Variable Type' },
        { name: 'use', label: 'Use', width: '90px' },
        { name: 'options', label: 'Options', width: '448px' },
        { name: 'managable', label: ' ', width: '164px' },
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
    dashboardDetailState.variablesSchema.properties[propertyName].use = !value;
};

/* Helper */
const variableTypeBadgeStyleFormatter = (type: VariableType) => {
    if (type === 'MANAGED') return 'gray';
    return 'primary';
};
const convertAndUpdateVariablesForTable = (order: string[]) => {
    const properties = dashboardDetailState.variablesSchema.properties;
    const convertedVariables = order.map((d) => {
        if (properties[d].variable_type === 'MANAGED') {
            return {
                ...properties[d],
                propertyName: d,
                options: Object.keys(state.allReferenceTypeInfo[d].referenceMap),
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
            @apply flex items-center justify-center;
            .manage-button {
                margin-right: 0.375rem;
            }
        }
    }
}
</style>
