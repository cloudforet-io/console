<script lang="ts" setup>
import {
    PDataTable, PLink, PBadge,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import { useProxyValue } from '@/common/composables/proxy-state';

import { ALERT_STATE } from '@/services/alert-manager/lib/config';
import { alertStateBadgeStyleTypeFormatter, alertScopeBadgeStyleTypeFormatter } from '@/services/alert-manager/lib/helper';


interface Props {
    loading: boolean;
    items: any[];
    selectIndex: number[];
    tableCustomStyle: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
    loading: true,
    items: () => [],
    selectIndex: () => [],
    tableCustomStyle: () => ({}),
});
const emit = defineEmits<{(e: 'update:select-index', value: number[]): void;
    (arg0: 'change', value: { sortBy: string; sortDesc: boolean }): void;
}>();
const store = useStore();
const { t } = useI18n();

const state = reactive({
    projects: computed(() => store.getters['reference/projectItems']),
    finishConditions: computed(() => ({
        ACKNOWLEDGED: t('MONITORING.ALERT.ESCALATION_POLICY.ACKNOWLEDGED'),
        RESOLVED: t('MONITORING.ALERT.ESCALATION_POLICY.RESOLVED'),
    })),
    scopes: computed(() => ({
        DOMAIN: t('MONITORING.ALERT.ESCALATION_POLICY.GLOBAL'),
        PROJECT: t('MONITORING.ALERT.ESCALATION_POLICY.PROJECT'),
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

</script>

<template>
    <p-data-table v-model:select-index="state.proxySelectIndex"
                  v-model:sort-by="state.sortBy"
                  v-model:sort-desc="state.sortDesc"
                  :items="items"
                  :fields="state.fields"
                  :loading="loading"
                  selectable
                  sortable
                  search-type="query"
                  :multi-select="false"
                  :table-custom-style="tableCustomStyle"
                  @change-sort="onChangeSort"
    >
        <template #col-name-format="{ value }">
            <span>{{ value.label }}</span>
            <p-badge v-if="value.isDefault"
                     badge-type="solid-outline"
                     style-type="primary"
                     class="ml-2"
            >
                {{ t('MONITORING.ALERT.ESCALATION_POLICY.DEFAULT') }}
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
        <template #col-scope-format="{ value }">
            <p-badge :style-type="alertScopeBadgeStyleTypeFormatter(value)"
                     badge-type="subtle"
            >
                {{ state.scopes[value] }}
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
                    {{ state.projects[value] ? state.projects[value].label : value }}
                </p-link>
            </template>
        </template>
    </p-data-table>
</template>
