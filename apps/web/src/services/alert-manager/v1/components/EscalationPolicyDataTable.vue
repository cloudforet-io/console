<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PDataTable, PLink, PBadge,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
import type {
    EscalationPolicyFinishCondition,
} from '@/schema/monitoring/escalation-policy/type';
import { i18n } from '@/translations';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { useProxyValue } from '@/common/composables/proxy-state';

import { alertStateBadgeStyleTypeFormatter, alertResourceGroupBadgeStyleTypeFormatter } from '@/services/alert-manager/v1/helpers/alert-badge-helper';

const props = withDefaults(defineProps<{
    loading?: boolean;
    items?: EscalationPolicyModel[];
    selectIndex?: number[];
    tableCustomStyle?: Record<string, any>;
    hasReadWriteAccess?: boolean;
}>(), {
    loading: true,
    items: () => [],
    selectIndex: () => [],
    tableCustomStyle: () => ({}),
});

const emit = defineEmits<{(e: 'update:select-index', value: number[]): void;
    (e: 'change', value: { sortBy: string; sortDesc?: boolean }): void;
}>();

const allReferenceStore = useAllReferenceStore();
const userWorkspaceStore = useUserWorkspaceStore();
const { getReferenceLocation } = useReferenceRouter();

const state = reactive({
    projects: computed(() => allReferenceStore.getters.project),
    finishConditions: computed<Record<EscalationPolicyFinishCondition, TranslateResult>>(() => ({
        ACKNOWLEDGED: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.ACKNOWLEDGED'),
        RESOLVED: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.RESOLVED'),
    })),
    resourceGroups: computed<Record<EscalationPolicyModel['resource_group'], TranslateResult>>(() => ({
        WORKSPACE: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.WORKSPACE'),
        PROJECT: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.PROJECT'),
    })),
    proxySelectIndex: useProxyValue('selectIndex', props, emit),
    sortBy: 'created_at',
    sortDesc: true,
});

const fields: DataTableField[] = [
    { name: 'name', label: 'Name' },
    { name: 'rules', label: 'Escalation Rules', sortable: false },
    { name: 'repeat_count', label: 'Repeat Time' },
    { name: 'finish_condition', label: 'Finish Condition' },
    { name: 'resource_group', label: 'Scope' },
    { name: 'project_id', label: 'Project', sortable: false },
    { name: 'created_at', label: 'Created' },
];

/* util */
const ruleFormatter = (rules: EscalationPolicyModel['rules']) => {
    const result = [] as string[];
    rules.forEach((rule, idx) => {
        let formattedRule = rule.notification_level;
        if (rule.escalate_minutes !== undefined && rule.escalate_minutes > 0) {
            formattedRule += ` (${rule.escalate_minutes}min)`;
            if (idx + 1 < rules.length) {
                formattedRule += ' > ';
            }
        }
        result.push(formattedRule);
    });
    return result.join('');
};

/* event */
const onChangeSort = (sortBy: string, sortDesc?: boolean) => {
    emit('change', { sortBy, sortDesc });
};
</script>

<template>
    <p-data-table :items="props.items"
                  :fields="fields"
                  :loading="props.loading"
                  :selectable="props.hasReadWriteAccess"
                  sortable
                  search-type="query"
                  :multi-select="false"
                  :select-index.sync="state.proxySelectIndex"
                  :sort-by.sync="state.sortBy"
                  :sort-desc.sync="state.sortDesc"
                  :table-custom-style="props.tableCustomStyle"
                  @changeSort="onChangeSort"
    >
        <template #col-name-format="{ value }">
            <span>{{ value.label }}</span>
            <p-badge v-if="value.isDefault"
                     badge-type="solid-outline"
                     style-type="primary"
                     class="ml-2"
            >
                {{ $t('MONITORING.ALERT.ESCALATION_POLICY.DEFAULT') }}
            </p-badge>
        </template>
        <template #col-rules-format="{ value }">
            {{ ruleFormatter(value) }}
        </template>
        <template #col-finish_condition-format="{ value }">
            <p-badge :style-type="alertStateBadgeStyleTypeFormatter(value)"
                     :badge-type="value === ALERT_STATE.ERROR ? 'solid-outline' : 'subtle'"
            >
                {{ state.finishConditions[value] }}
            </p-badge>
        </template>
        <template #col-resource_group-format="{ value }">
            <p-badge :style-type="alertResourceGroupBadgeStyleTypeFormatter(value)"
                     badge-type="subtle"
            >
                {{ state.resourceGroups[value] }}
            </p-badge>
        </template>
        <template #col-project_id-format="{ value }">
            <template v-if="value && value !== '*'">
                <p-link action-icon="internal-link"
                        new-tab
                        :to="getReferenceLocation(
                            value,
                            {
                                resource_type: 'identity.Project',
                                workspace_id: userWorkspaceStore.getters.currentWorkspaceId,
                            })"
                >
                    {{ state.projects[value] ? state.projects[value].label : value }}
                </p-link>
            </template>
            <span v-else-if="value === '*'" />
        </template>
    </p-data-table>
</template>
