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
                                 sync
                                 @change="handleToggleUse(item.propertyName, value)"
                />
            </template>
            <template #col-options-format="{ value }">
                <span>{{ value.join(', ') }}</span>
            </template>
            <template #col-managable-format="{ value }">
                <template v-if="value">
                    <p-button class="manage-button"
                              style-type="tertiary"
                              icon-left="ic_edit"
                              size="sm"
                              @click="handleEditVariable"
                    >
                        {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.EDIT') }}
                    </p-button>
                    <p-button class="manage-button"
                              style-type="tertiary"
                              icon-left="ic_trashcan"
                              size="sm"
                              @click="handleDeleteVariable(value)"
                    >
                        {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.DELETE') }}
                    </p-button>
                </template>
            </template>
        </p-data-table>
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import {
    PBadge, PDataTable, PSelectStatus, PToggleButton, useProxyValue, PButton,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import type { VariableType, DashboardVariablesSchema } from '@/services/dashboards/config';
import type {
    OverlayStatus,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/type';

interface Props {
    contentType: OverlayStatus;
    variables: DashboardVariablesSchema['properties'];
    order: string[];
}
interface EmitFn {
    (e: string, value: string): void;
    (e: 'delete', value: string): void;
    (e: 'use-change', name: string, value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<EmitFn>();

const state = reactive({
    proxyContentType: useProxyValue('contentType', props, emit),
    orderedVariables: computed(() => props.order.map((d) => {
        const currentVariable = {
            ...props.variables[d],
            propertyName: d,
        };
        if (currentVariable.variable_type === 'MANAGED') return currentVariable;
        return {
            ...currentVariable,
            managable: d,
        };
    })),
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
        { name: 'use', label: 'Use' },
        { name: 'options', label: 'Options' },
        { name: 'managable', label: ' ' },
    ],
    selectionType: computed(() => ({
        SINGLE: i18n.t('Single select'),
        MULTI: i18n.t('Multi select'),
    })),
    variableType: computed(() => ({
        MANAGED: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_MANAGED'),
        CUSTOM: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_CUSTOM'),
    })),
});

const {
    orderedVariables,
    variableFilterList,
    selectedVariableType,
    variableFields,
    selectionType,
    variableType,
} = toRefs(state);

/* Helper */
const variableTypeBadgeStyleFormatter = (type: VariableType) => {
    if (type === 'MANAGED') return 'gray';
    return 'primary';
};
/* EVENT */
const handleSelectType = (selected) => {
    state.selectedVariableType = selected;
};
const handleEditVariable = () => {
    state.proxyContentType = 'EDIT';
};
const handleDeleteVariable = (propertyName: string) => {
    emit('delete', propertyName);
};
const handleToggleUse = (propertyName: string, value: boolean) => {
    emit('use-change', propertyName, !value);
};

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
        .manage-button {
            margin-right: 0.375rem;
        }
    }
}
</style>
