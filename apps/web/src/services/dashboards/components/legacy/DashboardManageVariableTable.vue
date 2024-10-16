<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { isEqual } from 'lodash';

import {
    PBadge, PDataTable, PToggleButton, PIconButton,
} from '@cloudforet/mirinae';

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
    selectedVariableType: 'ALL' as VariableType,
    variableFields: [
        { name: 'name', label: 'Name' },
        { name: 'type', label: 'Type' },
        { name: 'reference', label: 'Reference' },
        { name: 'management', label: 'Management' },
        { name: 'use', label: 'Use', width: '90px' },
        { name: 'created_by', label: 'Created By' },
        { name: 'buttons', label: ' ', width: '144px' },
    ],
    variableType: computed<Partial<Record<VariableType, TranslateResult>>>(() => ({
        MANAGED: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_MANAGED'),
        CUSTOM: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_CUSTOM'),
    })),
});

/* EVENT */
const handleCloneVariable = (variableKey: string) => {
    emit('clone', variableKey);
};
const handleEditVariable = (variableKey: string) => {
    emit('edit', variableKey);
};
const handleDeleteVariable = (variableKey: string) => {
    emit('delete', variableKey);
};
const handleToggleUse = () => {
    //
};

/* Helper */
const variableTypeBadgeStyleFormatter = (type: VariableType) => {
    if (type === 'MANAGED') return 'gray500';
    return 'primary';
};
const convertAndUpdateVariablesForTable = (order: string[]) => {
    const properties = dashboardDetailGetters.refinedVariablesSchema.properties;
    state.orderedVariables = order.map((d) => ({
        ...properties[d],
        propertyName: d,
        manageable: properties[d].variable_type !== 'MANAGED' ? true : undefined,
    }));
};

watch(() => dashboardDetailState.variablesSchema.order, (after, before) => {
    if (isEqual(after, before)) return;
    convertAndUpdateVariablesForTable(after);
}, { immediate: true });
</script>

<template>
    <div class="list-wrapper">
        <p-data-table class="variable-table"
                      :items="state.orderedVariables"
                      :fields="state.variableFields"
        >
            <template #col-management-format="{ value }">
                <p-badge :style-type="variableTypeBadgeStyleFormatter(value)"
                         badge-type="solid-outline"
                >
                    {{ state.variableType[value] ? state.variableType[value] : state.variableType.CUSTOM }}
                </p-badge>
            </template>
            <template #col-use-format="{ value, item }">
                <p-toggle-button :value="value"
                                 :disabled="item.disabled || item.required || item.fixed || item.readonly"
                                 @change-toggle="handleToggleUse"
                />
            </template>
            <template #col-buttons-format="{ item, value }">
                <div v-if="value"
                     class="button-wrapper"
                >
                    <p-icon-button name="ic_clone"
                                   @click="handleCloneVariable(item.key)"
                    />
                    <p-icon-button name="ic_edit"
                                   @click="handleEditVariable(item.key)"
                    />
                    <p-icon-button name="ic_delete"
                                   style-type="negative-transparent"
                                   @click="handleDeleteVariable(item.key)"
                    />
                </div>
            </template>
        </p-data-table>
    </div>
</template>

<style lang="postcss" scoped>
.list-wrapper {
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
