<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PLink } from '@cloudforet/mirinae';
import { ACTION_ICON } from '@cloudforet/mirinae/src/inputs/link/type';
import { isNotEmpty } from '@cloudforet/utils';

import type { CollectorRuleModel, AdditionalRuleAction } from '@/schema/inventory/collector-rule/model';
import { i18n as _i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';


interface Props {
    data?: CollectorRuleModel;
}
const props = withDefaults(defineProps<Props>(), {
    data: undefined,
});
const { getProperRouteLocation } = useProperRouteLocation();
const allReferenceStore = useAllReferenceStore();

interface Field {
    name: string;
    label: TranslateResult;
}

const ConditionNameMap = {
    provider: 'Provider',
    cloud_service_group: 'Cloud Service Group',
    cloud_service_type: 'Cloud Service Type',
    region_code: 'Region',
    account: 'Account',
    'reference.resource_id': 'Resource ID',
};

const state = reactive({
    conditionFields: computed<Field[]>(() => (props.data?.conditions ?? []).map((condition) => ({
        name: condition.key,
        label: ConditionNameMap[condition.key] ?? condition.key,
    }))),
    conditionItems: computed(() => {
        if (!props.data) return {};
        return props.data.conditions.reduce((acc, condition) => {
            acc[condition.key] = {
                operator: condition.operator,
                value: condition.value,
            };
            return acc;
        }, {});
    }),
    actionFields: computed<Field[]>(() => {
        if (!props.data) return [];
        const fields:Field[] = [];
        const actionKeys = Object.keys(props.data.actions);
        if (actionKeys[0] === 'change_project') {
            fields.push({ name: 'change_project', label: 'Project Routing' });
        } else if (actionKeys[0] === 'match_service_account') {
            fields.push({ name: 'match_service_account', label: 'Match Service Account' });
        } else if (actionKeys[0] === 'match_project') {
            fields.push({ name: 'match_project', label: 'Match Project' });
        }
        fields.push({ name: 'stop_processing', label: _i18n.t('PROJECT.EVENT_RULE.THEN_STOP_PROCESSING') });
        return fields;
    }),
    actionItems: computed<AdditionalRuleAction>(() => {
        if (!props.data) return {};
        return props.data.actions;
    }),
    projects: computed(() => allReferenceStore.getters.project),
    changeProjectId: computed(() => props.data?.actions?.change_project ?? ''),
    conditions: computed(() => ({
        ANY: _i18n.t('PROJECT.EVENT_RULE.ANY'),
        ALL: _i18n.t('PROJECT.EVENT_RULE.ALL'),
        ALWAYS: _i18n.t('PROJECT.EVENT_RULE.ALWAYS'),
    })),
});

</script>

<template>
    <div class="additional-rule-content">
        <section class="left-section">
            <h4><span>{{ state.conditions[props.data.conditions_policy] }}</span> {{ $t('PROJECT.EVENT_RULE.OF_THE_FOLLOWING_ARE_MET') }}</h4>
        </section>
        <section class="middle-section">
            <table>
                <tbody>
                    <template v-for="(field, index) in state.conditionFields">
                        <tr v-if="isNotEmpty(state.conditionItems[field.name])"
                            :key="`${field}-${index}`"
                        >
                            <td>{{ field.label }}</td>
                            <td>
                                {{ state.conditionItems[field.name]?.operator }} {{ state.conditionItems[field.name]?.value }}
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </section>
        <section class="right-section">
            <table>
                <tbody>
                    <template v-for="(field, index) in state.actionFields">
                        <tr v-if="isNotEmpty(state.actionItems[field.name])"
                            :key="`${field}-${index}`"
                        >
                            <td>{{ field.label }}</td>
                            <td v-if="field.name === 'change_project'">
                                <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                                        new-tab
                                        :to="getProperRouteLocation(referenceRouter(
                                            state.changeProjectId,
                                            { resource_type: 'identity.Project' }))"
                                >
                                    {{ state.projects[state.changeProjectId] ? state.projects[state.changeProjectId].label : state.changeProjectId ?? '--' }}
                                </p-link>
                            </td>
                            <td v-else>
                                <b>Source</b>: {{ state.actionItems[field.name].source }} / <b>Target</b>: {{ state.actionItems[field.name].target }}
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </section>
    </div>
</template>

<style lang="postcss" scoped>
.additional-rule-content {
    @apply grid grid-cols-12;
    gap: 2rem;
}

h4 {
    font-size: 1rem;
    line-height: 160%;
}
.left-section {
    @apply col-span-2;

    > h4 > span {
        font-weight: bold;
    }
}
.middle-section {
    @apply col-span-5;
}
.right-section {
    @apply col-span-5;
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
        @apply col-span-12;
    }
    .right-section {
        @apply col-span-12;
        margin-top: 1rem;
    }
}
</style>
