<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';


import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { PLink } from '@cloudforet/mirinae';
import { isNotEmpty } from '@cloudforet/utils';

import type { EventRuleModel } from '@/schema/monitoring/event-rule/model';
import type { EventRuleActions, EventRuleOptions } from '@/schema/monitoring/event-rule/type';
import { i18n as _i18n } from '@/translations';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { ALERT_MANAGER_ROUTE_V1 } from '@/services/alert-manager/v1/routes/route-constant';

interface Props {
    data?: EventRuleModel;
}
const props = withDefaults(defineProps<Props>(), {
    data: undefined,
});

const allReferenceStore = useAllReferenceStore();
const userWorkspaceStore = useUserWorkspaceStore();

const { getReferenceLocation } = useReferenceRouter();

interface Field {
    name: keyof EventRuleOptions | keyof EventRuleActions;
    label: TranslateResult;
}
const queryHelper = new QueryHelper();

const state = reactive({
    fields: computed<Field[]>(() => ([
        { name: 'no_notification', label: _i18n.t('PROJECT.EVENT_RULE.SNOOZED_NOTIFICATIONS') },
        { name: 'change_project', label: _i18n.t('PROJECT.EVENT_RULE.PROJECT_ROUTING') },
        { name: 'change_urgency', label: _i18n.t('PROJECT.EVENT_RULE.URGENCY') },
        { name: 'change_assignee', label: _i18n.t('PROJECT.EVENT_RULE.ASSIGNEE') },
        { name: 'change_escalation_policy', label: _i18n.t('PROJECT.EVENT_RULE.ESCALATION_POLICY') },
        { name: 'add_additional_info', label: _i18n.t('PROJECT.EVENT_RULE.ADDITIONAL_INFORMATION') },
        { name: 'stop_processing', label: _i18n.t('PROJECT.EVENT_RULE.THEN_STOP_PROCESSING') },
    ])),
    items: computed<EventRuleOptions & EventRuleActions>(() => {
        if (!props.data) return {};
        return { ...props.data.actions, ...props.data.options };
    }),
    projects: computed(() => allReferenceStore.getters.project),
    conditions: computed(() => ({
        ANY: _i18n.t('PROJECT.EVENT_RULE.ANY'),
        ALL: _i18n.t('PROJECT.EVENT_RULE.ALL'),
    })),
    escalationPolicies: computed(() => allReferenceStore.getters.escalationPolicy),
    escalationPolicyLink: computed<Location|undefined>(() => {
        if (!state.items.change_escalation_policy) return undefined;
        const filters: ConsoleFilter[] = [];
        filters.push({ k: 'escalation_policy_id', o: '=', v: state.items.change_escalation_policy });
        return {
            name: ALERT_MANAGER_ROUTE_V1.ESCALATION_POLICY._NAME,
            query: {
                filters: queryHelper.setFilters(filters).rawQueryStrings,
            },
        };
    }),
});
</script>

<template>
    <div class="event-rule-content">
        <section class="left-section">
            <h4><b>{{ state.conditions[props.data.conditions_policy] }}</b> {{ $t('PROJECT.EVENT_RULE.OF_THE_FOLLOWING_ARE_MET') }}</h4>
            <ul v-for="(condition, idx) in props.data.conditions"
                :key="`${condition}-${idx}`"
                class="condition-list"
            >
                <li>
                    <span class="text-blue-900 capitalize">{{ condition.key }}</span>
                    {{ condition.operator }}
                    <span class="text-blue-900">{{ condition.value }}</span>
                </li>
            </ul>
        </section>
        <section class="right-section">
            <h4>
                <i18n path="PROJECT.EVENT_RULE.DO">
                    <template #actions>
                        <strong>{{ $t('PROJECT.EVENT_RULE.THESE_THINGS') }}</strong>
                    </template>
                </i18n>
            </h4>
            <table>
                <tbody>
                    <template v-for="(field, index) in state.fields">
                        <tr v-if="isNotEmpty(state.items[field.name])"
                            :key="`${field}-${index}`"
                        >
                            <td>{{ field.label }}</td>
                            <td v-if="field.name === 'no_notification'">
                                <span class="text-secondary">{{ $t('PROJECT.EVENT_RULE.ON') }}</span>
                            </td>
                            <td v-else-if="field.name === 'change_project'">
                                <p-link action-icon="internal-link"
                                        new-tab
                                        :to="getReferenceLocation(
                                            state.items[field.name] ?? '',
                                            {
                                                resource_type: 'identity.Project',
                                                workspace_id: userWorkspaceStore.getters.currentWorkspaceId,
                                            })"
                                >
                                    {{ state.projects[state.items[field.name]] ? state.projects[state.items[field.name]].label : state.items[field.name] }}
                                </p-link>
                            </td>
                            <td v-else-if="field.name === 'change_escalation_policy'">
                                <p-link action-icon="internal-link"
                                        new-tab
                                        :to="state.escalationPolicyLink"
                                >
                                    {{ state.escalationPolicies[state.items[field.name]].label }}
                                </p-link>
                            </td>
                            <td v-else-if="field.name === 'add_additional_info'">
                                <p v-for="(info, infoIdx) in Object.entries(state.items[field.name])"
                                   :key="`${info}-${infoIdx}`"
                                >
                                    <span class="font-bold">{{ info[0] }}</span>: {{ info[1] }}
                                </p>
                            </td>
                            <td v-else-if="field.name === 'stop_processing'"
                                class="stop-processing"
                            >
                                <span v-if="state.items[field.name]" />
                            </td>
                            <td v-else>
                                {{ state.items[field.name] }}
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </section>
    </div>
</template>

<style lang="postcss" scoped>
.event-rule-content {
    @apply grid grid-cols-12;
    gap: 2rem;
}

h4 {
    font-size: 1rem;
    line-height: 160%;
}
.left-section {
    @apply col-span-4;
    .condition-list {
        list-style: disc;
        font-size: 1rem;
        line-height: 160%;

        li {
            margin-left: 1.5rem;
            line-height: 150%;
            font-size: 0.875rem;
        }
    }
}
.right-section {
    @apply col-span-8;
}
table {
    display: flex;
    width: 100%;
    td, th {
        @apply px-4 py-2;
    }

    tbody {
        width: 100%;
        tr {
            @apply border-gray-300 border-b;
            td, th {
                width: 100%;
                vertical-align: top;
                &:first-child {
                    @apply text-gray-500;
                    font-size: 0.875rem;
                    line-height: 150%;
                    width: 11rem;
                    flex-shrink: 0;
                }
                &:last-child {
                    font-size: 0.875rem;
                    line-height: 150%;
                }
            }
            td {
                &:first-child {
                    min-width: 11rem;
                }
            }
        }
    }
}

@screen tablet {
    .left-section {
        grid-column: span 12 / span 12;
    }
    .right-section {
        grid-column: span 12 / span 12;
        margin-top: 1rem;
    }
}
</style>
