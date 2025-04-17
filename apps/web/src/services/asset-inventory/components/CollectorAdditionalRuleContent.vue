<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PLink, PI, PTooltip } from '@cloudforet/mirinae';
import { isNotEmpty } from '@cloudforet/utils';

import {
    COLLECTOR_RULE_CONDITION_KEY,
    COLLECTOR_RULE_CONDITION_KEY_LABEL,
    COLLECTOR_RULE_CONDITION_OPERATOR_LABEL,
} from '@/schema/inventory/collector-rule/constant';
import type { CollectorRuleModel, AdditionalRuleAction } from '@/schema/inventory/collector-rule/model';
import { i18n as _i18n } from '@/translations';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

interface Props {
    data?: CollectorRuleModel;
}
const props = withDefaults(defineProps<Props>(), {
    data: undefined,
});
const allReferenceStore = useAllReferenceStore();

const { getReferenceLocation } = useReferenceRouter();

interface Field {
    name: string;
    label: TranslateResult;
}

const state = reactive({
    conditionFields: computed<Field[]>(() => (props.data?.conditions ?? []).map((condition) => ({
        name: condition.key,
        label: COLLECTOR_RULE_CONDITION_KEY_LABEL[condition.key] ?? condition.key,
    }))),
    conditionItems: computed(() => {
        if (!props.data) return [];
        return props.data.conditions.map((condition) => ({
            operator: condition.operator,
            value: condition.value,
        }));
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
    region: computed(() => allReferenceStore.getters.region),
    changeProjectId: computed(() => props.data?.actions?.change_project ?? ''),
    conditions: computed(() => ({
        ANY: _i18n.t('PROJECT.EVENT_RULE.ANY'),
        ALL: _i18n.t('PROJECT.EVENT_RULE.ALL'),
        ALWAYS: _i18n.t('PROJECT.EVENT_RULE.ALWAYS'),
    })),
    isConditionTooltipVisible: computed(() => {
        let isConditionTooltipVisible = false;
        state.conditionFields.forEach((condition) => {
            if (condition.name.slice(0, 4) === COLLECTOR_RULE_CONDITION_KEY.data || condition.name.slice(0, 4) === COLLECTOR_RULE_CONDITION_KEY.tags) {
                isConditionTooltipVisible = true;
            }
        });
        return isConditionTooltipVisible;
    }),
});

</script>

<template>
    <div class="additional-rule-content">
        <section class="left-section">
            <h4><span>{{ state.conditions[props.data.conditions_policy] }}</span> {{ $t('PROJECT.EVENT_RULE.OF_THE_FOLLOWING_ARE_MET') }}</h4>
        </section>
        <section class="middle-section">
            <h5 v-if="state.conditionFields.length"
                class="text-paragraph-lg text-gray-900 font-bold"
            >
                <span>{{ $t('INVENTORY.COLLECTOR.CONDITIONS') }}<p-tooltip v-if="state.isConditionTooltipVisible"
                                                                           class="ml-2"
                                                                           position="bottom"
                                                                           :contents="$t('INVENTORY.COLLECTOR.ADDITIONAL_RULE_CONDITION_INFO')"
                ><p-i width="1rem"
                      height="1rem"
                      name="ic_info-circle"
                /></p-tooltip></span>
            </h5>
            <table>
                <tbody>
                    <template v-for="(field, index) in state.conditionFields">
                        <tr v-if="isNotEmpty(state.conditionItems[index])"
                            :key="`${field}-${index}`"
                        >
                            <td>{{ field.label }}</td>
                            <td>{{ COLLECTOR_RULE_CONDITION_OPERATOR_LABEL[state.conditionItems[index]?.operator]?.toLowerCase() }}</td>
                            <td>
                                <span v-if="field.label !== 'Region'">{{ state.conditionItems[index]?.value }}</span>
                                <span v-else>{{ state.region[state.conditionItems[index]?.value]?.label }}</span>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </section>
        <section class="right-section">
            <h5 class="text-paragraph-lg text-gray-900 font-bold">
                {{ $t('INVENTORY.COLLECTOR.ACTIONS') }}
            </h5>
            <table>
                <tbody>
                    <template v-for="(field, index) in state.actionFields">
                        <tr v-if="isNotEmpty(state.actionItems[field.name])"
                            :key="`${field}-${index}`"
                        >
                            <td>{{ field.label }}</td>
                            <td v-if="field.name === 'change_project'">
                                <p-link action-icon="internal-link"
                                        new-tab
                                        :to="getReferenceLocation(
                                            state.changeProjectId,
                                            { resource_type: 'identity.Project',
                                              workspace_id: state.projects[state.changeProjectId]?.data?.workspaceId },)"
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
    @apply text-label-md w-full;
    td, th {
        @apply px-4 py-2;
    }

    tbody {
        width: 100%;
        tr {
            @apply border-gray-300 border-b w-full;
            td, th {
                vertical-align: top;
                &:first-child {
                    @apply text-gray-500;
                    font-size: 0.875rem;
                    line-height: 150%;
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
