<template>
    <p-data-table :items="items" :fields="fields" :loading="loading"
                  selectable sortable
                  search-type="query"
                  :multi-select="false"
                  :select-index.sync="proxySelectIndex"
                  sort-by="created_at"
                  :sort-desc="true"
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
            <span>{{ capitalize(value) }}</span>
        </template>
        <template #col-scope-format="{ value }">
            <span>{{ capitalize(value) }}</span>
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
import { makeProxy } from '@/lib/compostion-util';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import { store } from '@/store';

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
        });

        /* util */
        const ruleFormatter = (rules) => {
            const result = [] as string[];
            rules.forEach((rule, idx) => {
                let formattedRule = rule.notification_level;
                if (idx + 1 < rules.length) {
                    formattedRule += ` (${rule.escalate_minutes}min)`;
                    formattedRule += ' > ';
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
            ruleFormatter,
            capitalize,
            onChangeSort,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
