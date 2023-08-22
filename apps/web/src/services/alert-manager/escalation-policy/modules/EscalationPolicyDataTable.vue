<template>
    <p-data-table :items="items"
                  :fields="fields"
                  :loading="loading"
                  selectable
                  sortable
                  search-type="query"
                  :multi-select="false"
                  :select-index.sync="proxySelectIndex"
                  :sort-by.sync="sortBy"
                  :sort-desc.sync="sortDesc"
                  :table-custom-style="tableCustomStyle"
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
                {{ finishConditions[value] }}
            </p-badge>
        </template>
        <template #col-scope-format="{ value }">
            <p-badge :style-type="alertScopeBadgeStyleTypeFormatter(value)"
                     badge-type="subtle"
            >
                {{ scopes[value] }}
            </p-badge>
        </template>
        <template #col-project_id-format="{ value }">
            <template v-if="value">
                <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                        new-tab
                        :to="referenceRouter(
                            value,
                            { resource_type: 'identity.Project' })"
                >
                    {{ projects[value] ? projects[value].label : value }}
                </p-link>
            </template>
        </template>
    </p-data-table>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import {
    PDataTable, PLink, PBadge,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import { capitalize } from 'lodash';

import { store } from '@/store';
import { i18n } from '@/translations';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import { useProxyValue } from '@/common/composables/proxy-state';

import { ALERT_STATE } from '@/services/alert-manager/lib/config';
import { alertStateBadgeStyleTypeFormatter, alertScopeBadgeStyleTypeFormatter } from '@/services/alert-manager/lib/helper';

export default {
    name: 'EscalationPolicyDataTable',
    components: {
        PDataTable,
        PLink,
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
        tableCustomStyle: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            projects: computed(() => store.getters['reference/projectItems']),
            finishConditions: computed(() => ({
                ACKNOWLEDGED: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.ACKNOWLEDGED'),
                RESOLVED: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.RESOLVED'),
            })),
            scopes: computed(() => ({
                DOMAIN: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.GLOBAL'),
                PROJECT: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.PROJECT'),
            })),
            fields: [
                { name: 'name', label: 'Name' },
                { name: 'rules', label: 'Escalation Rules', sortable: false },
                { name: 'repeat_count', label: 'Repeat Time' },
                { name: 'finish_condition', label: 'Finish Condition' },
                { name: 'scope', label: 'Scope' },
                { name: 'project_id', label: 'Project', sortable: false },
                { name: 'created_at', label: 'Created' },
            ] as DataTableField[],
            proxySelectIndex: useProxyValue('selectIndex', props, emit),
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

        // LOAD REFERENCE STORE
        (async () => {
            await store.dispatch('reference/project/load');
        })();

        return {
            ...toRefs(state),
            ALERT_STATE,
            ACTION_ICON,
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
