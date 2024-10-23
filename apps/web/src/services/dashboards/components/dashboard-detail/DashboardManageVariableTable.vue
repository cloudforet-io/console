<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PBadge, PDataTable, PToggleButton, PIconButton,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';

import { i18n } from '@/translations';

import {
    MANAGED_DASHBOARD_GLOBAL_VARIABLES_SCHEMA,
} from '@/services/dashboards/constants/managed-dashboard-global-variables';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';



interface GlobalVariableTableItem {
    key: string;
    name: string;
    type: string;
    management: VariableType;
    use: boolean;
    created_by: string;
    reference: string|TranslateResult;
}
interface EmitFn {
    (e: 'delete', value: string): void;
    (e: 'edit', name: string): void;
    (e: 'clone', name: string): void;
}
type VariableType = 'managed'|'custom';
const emit = defineEmits<EmitFn>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailGetters = dashboardDetailStore.getters;
const state = reactive({
    globalVariablesTableItems: computed<GlobalVariableTableItem[]>(() => {
        const _managedItems: GlobalVariableTableItem[] = [];
        Object.values(MANAGED_DASHBOARD_GLOBAL_VARIABLES_SCHEMA).forEach((d) => {
            _managedItems.push({
                key: d.key,
                name: d.name,
                type: '-',
                management: 'managed',
                use: true, // TODO: get use
                created_by: 'System',
                reference: i18n.t('DASHBOARDS.DETAIL.VARIABLES.COMMON'),
            });
        });
        const _customItems = Object.values(dashboardDetailGetters.dashboardVarsSchema).map((d) => ({
            ...d,
            type: d?.type || '-',
            created_by: 'System',
            reference: d?.reference?.resourceType || '-',
        }));
        return [
            ..._managedItems,
            ..._customItems,
        ];
    }),
    variableFields: [
        { name: 'name', label: 'Name' },
        { name: 'type', label: 'Type' },
        { name: 'reference', label: 'Reference' },
        { name: 'management', label: 'Management' },
        { name: 'use', label: 'Use', width: '90px' },
        { name: 'created_by', label: 'Created By' },
        { name: 'buttons', label: ' ', width: '144px' },
    ] as DataTableField[],
    variableType: computed<Partial<Record<VariableType, TranslateResult>>>(() => ({
        managed: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_MANAGED'),
        custom: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_CUSTOM'),
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
    if (type === 'managed') return 'gray500';
    return 'primary';
};
</script>

<template>
    <div class="list-wrapper">
        <p-data-table class="variable-table"
                      :items="state.globalVariablesTableItems"
                      :fields="state.variableFields"
        >
            <template #col-management-format="{ value }">
                <p-badge :style-type="variableTypeBadgeStyleFormatter(value)"
                         badge-type="solid-outline"
                >
                    {{ state.variableType[value] }}
                </p-badge>
            </template>
            <template #col-use-format="{ value, item }">
                <p-toggle-button :value="value"
                                 :disabled="item.disabled || item.required || item.fixed || item.readonly"
                                 @change-toggle="handleToggleUse"
                />
            </template>
            <template #col-buttons-format="{ item }">
                <div class="button-wrapper">
                    <p-icon-button name="ic_clone"
                                   size="sm"
                                   @click="handleCloneVariable(item.key)"
                    />
                    <p-icon-button v-if="item.management === 'custom'"
                                   name="ic_edit"
                                   size="sm"
                                   @click="handleEditVariable(item.key)"
                    />
                    <p-icon-button v-if="item.management === 'custom'"
                                   name="ic_delete"
                                   size="sm"
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
        .button-wrapper {
            @apply w-full flex items-center;
        }
    }
}
</style>
