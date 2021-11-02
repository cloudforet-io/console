<template>
    <p-data-table :items="items" :fields="fields" :loading="loading"
                  selectable sortable
                  search-type="query"
                  :multi-select="false"
                  :select-index.sync="proxySelectIndex"
                  :sort-by.sync="sortBy"
                  :sort-desc.sync="sortDesc"
                  @changeSort="onChangeSort"
    >
        <template #col-name-format="{ value }">
            <span>{{ value.label }}</span>
            <p-badge v-if="value.isDefault" outline class="ml-2">
                {{ $t('MONITORING.ALERT.ESCALATION_POLICY.DEFAULT') }}
            </p-badge>
        </template>
        <template #col-rules-format="{ value }">
            {{ ruleFormatter(value) }}
        </template>
        <template #col-finish_condition-format="{ value }">
            <p-badge :style-type="alertStateBadgeStyleTypeFormatter(value)">
                {{ finishConditions[value] }}
            </p-badge>
        </template>
        <template #col-scope-format="{ value }">
            <p-badge :style-type="alertScopeBadgeStyleTypeFormatter(value)">
                {{ scopes[value] }}
            </p-badge>
        </template>
        <template #col-project_id-format="{ value }">
            <template v-if="value">
                <p-anchor :to="referenceRouter(
                    value,
                    { resource_type: 'identity.Project' })"
                >
                    {{ projects[value] ? projects[value].label : value }}
                </p-anchor>
            </template>
        </template>
    </p-data-table>
</template>

<script lang="ts">
import { capitalize } from 'lodash';

import {
    PDataTable, PAnchor, PBadge,
} from '@spaceone/design-system';

import { computed, reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { alertStateBadgeStyleTypeFormatter, alertScopeBadgeStyleTypeFormatter } from '@/services/monitoring/alert-manager/lib/helper';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import { store } from '@/store';
import { i18n } from '@/translations';


export default {
    name: 'EscalationPolicyDataTable',
    components: {
        PDataTable,
        PAnchor,
        PBadge,
    },
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
        items: {
            type: Array,
            default: () => [],
        },
        selectIndex: {
            type: Array,
            default: () => [],
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
            finishConditions: computed(() => ({
                ACKNOWLEDGED: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.ACKNOWLEDGED'),
                RESOLVED: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.RESOLVED'),
            })),
            scopes: computed(() => ({
                GLOBAL: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.GLOBAL'),
                PROJECT: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.PROJECT'),
            })),
            fields: [
                { name: 'name', label: 'Name' },
                { name: 'rules', label: 'Escalation Rules' },
                { name: 'repeat_count', label: 'Repeat Time' },
                { name: 'finish_condition', label: 'Finish Condition' },
                { name: 'scope', label: 'Scope' },
                { name: 'project_id', label: 'Project' },
                { name: 'created_at', label: 'Created' },
            ] as DataTableField[],
            proxySelectIndex: makeProxy('selectIndex', props, emit),
            sortBy: 'created_at',
            sortDesc: true,
        });

        /* util */
        const ruleFormatter = (rules) => {
            const result = [] as string[];
            rules.forEach((rule, idx) => {
                let formattedRule = rule.notification_level;
                if (rule.escalate_minutes > 0) {
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
        const onChangeSort = (sortBy, sortDesc) => {
            emit('change', { sortBy, sortDesc });
        };

        return {
            ...toRefs(state),
            referenceRouter,
            alertStateBadgeStyleTypeFormatter,
            alertScopeBadgeStyleTypeFormatter,
            ruleFormatter,
            capitalize,
            onChangeSort,
        };
    },
};
</script>
