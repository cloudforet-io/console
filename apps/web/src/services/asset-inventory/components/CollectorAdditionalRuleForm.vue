<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton, PRadio, PSelectDropdown, PI, PTextInput, PTooltip, PFieldGroup, PCheckbox,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import {
    COLLECTOR_RULE_CONDITION_KEY, COLLECTOR_RULE_CONDITION_KEY_LABEL,
    COLLECTOR_RULE_CONDITION_POLICY,
} from '@/schema/inventory/collector-rule/constant';
import type { AdditionalRuleCondition, CollectorRuleModel, AdditionalRuleAction } from '@/schema/inventory/collector-rule/model';
import type { CollectorRuleConditionKey, CollectorRuleConditionOperator } from '@/schema/inventory/collector-rule/type';
import { i18n as _i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import CollectorAdditionalRuleFormOperatorDropdown
    from '@/services/asset-inventory/components/CollectorAdditionalRuleFormOperatorDropdown.vue';


interface Props {
    data?: CollectorRuleModel;
    provider?: string;
}
const props = withDefaults(defineProps<Props>(), {
    data: undefined,
    provider: undefined,
});

const allReferenceStore = useAllReferenceStore();

interface CollectorRuleForm {
    conditions_policy: string;
    conditions: AdditionalRuleCondition[];
    actions: AdditionalRuleAction;
    options?: {
        stop_processing: boolean;
    };
}

const emit = defineEmits<{(e: 'click-done', formData?: CollectorRuleForm): void; }>();

const DEFAULT_CONDITION_KEY = props.provider ? COLLECTOR_RULE_CONDITION_KEY.cloud_service_group : COLLECTOR_RULE_CONDITION_KEY.provider;

interface AdditionalRuleConditionWithSubkey extends AdditionalRuleCondition {
    subkey?: string;
}
const convertToUiCondition = (condition?:AdditionalRuleCondition[]):AdditionalRuleConditionWithSubkey[] => (condition ?? [{
    key: DEFAULT_CONDITION_KEY,
    subkey: '',
    operator: 'eq',
    value: '',
}]).map((c) => {
    if (c.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.data) || c.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.tags)) {
        return {
            ...c,
            subkey: c.key.slice(4),
        };
    }
    return c;
});

const convertToApiCondition = (condition:AdditionalRuleConditionWithSubkey[]):AdditionalRuleCondition[] => condition.map((c) => {
    if (c.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.data) || c.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.tags)) {
        return {
            key: `${c.key}.${c.subkey}`,
            operator: c.operator,
            value: c.value,
        };
    }
    return c;
});

const state = reactive({
    projects: computed(() => allReferenceStore.getters.project),
    isConditionTooltipVisible: computed(() => {
        let isConditionTooltipVisible = false;
        state.conditionList.forEach((condition) => {
            if (condition.key === COLLECTOR_RULE_CONDITION_KEY.data || condition.key === COLLECTOR_RULE_CONDITION_KEY.tags) {
                isConditionTooltipVisible = true;
            }
        });
        return isConditionTooltipVisible;
    }),
    conditionPolicies: computed(() => ({
        [COLLECTOR_RULE_CONDITION_POLICY.ANY]: _i18n.t('PROJECT.EVENT_RULE.ANY'),
        [COLLECTOR_RULE_CONDITION_POLICY.ALL]: _i18n.t('PROJECT.EVENT_RULE.ALL'),
        [COLLECTOR_RULE_CONDITION_POLICY.ALWAYS]: _i18n.t('PROJECT.EVENT_RULE.ALWAYS'),
    })),
    selectedConditionRadioIdx: COLLECTOR_RULE_CONDITION_POLICY.ANY,
    conditionKeyMenu: computed<SelectDropdownMenuItem[]>(() => Object.keys(COLLECTOR_RULE_CONDITION_KEY).filter((key) => (!((key === 'data' || key === 'tags')))).map((key) => ({
        label: COLLECTOR_RULE_CONDITION_KEY_LABEL[key],
        name: key,
    })).concat([
        { label: 'Data', name: 'data' },
        { label: 'Tags', name: 'tags' },
    ])),
    conditionList: convertToUiCondition(props.data?.conditions),
    // actions
    actionPolicies: computed(() => ({
        change_project: 'Project Routing',
        match_project: 'Match Project',
        match_service_account: 'Match Service Account',
    })),
    selectedActionRadioIdx: 'change_project',
    selectedProjectId: props.data?.actions?.change_project ? [props.data?.actions?.change_project ?? ''] : undefined,
    isStopProcessingChecked: false,
    sourceInput: '',
    targetInput: '',
});

const handleClickAddRule = () => {
    state.conditionList.push({
        key: DEFAULT_CONDITION_KEY,
        operator: 'eq',
        value: '',
    });
};
const handleClickDeleteCondition = (idx:number) => {
    state.conditionList = state.conditionList.filter((condition, index) => index !== idx);
};

const handleSelectConditionKey = (value:CollectorRuleConditionKey, idx:number) => {
    state.conditionList = state.conditionList.map((condition, index) => {
        if (index === idx) {
            return {
                ...condition,
                key: value,
            };
        }
        return condition;
    });
};
const handleUpdateSubkeyInput = (value:string) => {
    state.conditionList = state.conditionList.map((condition, index) => {
        if (index === state.conditionList.length - 1) {
            return {
                ...condition,
                subkey: value,
            };
        }
        return condition;
    });
};

const handleUpdateValueInput = (value:string, idx:number) => {
    state.conditionList = state.conditionList.map((condition, index) => {
        if (index === idx) {
            return {
                ...condition,
                value,
            };
        }
        return condition;
    });
};

const handleUpdateOperator = (value:CollectorRuleConditionOperator, idx:number) => {
    state.conditionList = state.conditionList.map((condition, index) => {
        if (index === idx) {
            return {
                ...condition,
                operator: value,
            };
        }
        return condition;
    });
};

const handleClickCancel = () => {
    console.log('cancel');
};

const handleSelectProjectId = (value) => {
    state.selectedProjectId = value;
};

const handleClickDone = () => {
    const actions:AdditionalRuleAction = {};

    if (state.selectedActionRadioIdx === 'change_project') {
        actions.change_project = state.selectedProjectId?.[0];
    } else if (state.selectedActionRadioIdx === 'match_project') {
        actions.match_project = {
            source: state.sourceInput,
            target: state.targetInput,
        };
    } else if (state.selectedActionRadioIdx === 'match_service_account') {
        actions.match_service_account = {
            source: state.sourceInput,
            target: state.targetInput,
        };
    }

    emit('click-done', {
        conditions_policy: state.selectedConditionRadioIdx,
        conditions: convertToApiCondition(state.conditionList),
        actions,
        options: {
            stop_processing: state.isStopProcessingChecked,
        },
    });
};
</script>

<template>
    <div class="collector-additional-rule-form">
        <section class="left-section">
            <h5 class="text-paragraph-lg text-gray-900 font-bold flex justify-between">
                <span>{{ $t('INVENTORY.COLLECTOR.CONDITIONS') }}<p-tooltip v-if="state.isConditionTooltipVisible"
                                                                           class="ml-2"
                                                                           position="bottom"
                                                                           :contents="$t('INVENTORY.COLLECTOR.ADDITIONAL_RULE_CONDITION_INFO')"
                ><p-i width="1rem"
                      height="1rem"
                      name="ic_info-circle"
                /></p-tooltip></span>
                <p-button style-type="tertiary"
                          icon-left="ic_plus_bold"
                          class="add-event-rule-button"
                          size="md"
                          @click="handleClickAddRule"
                >
                    {{ $t('COMMON.BUTTONS.ADD') }}
                </p-button>
            </h5>
            <div class="condition-contents-wrapper">
                <div class="condition-policy-wrapper">
                    <p-radio v-for="([key,value], idx) in Object.entries(state.conditionPolicies)"
                             :key="`bookmark-scope-${idx}`"
                             v-model="state.selectedConditionRadioIdx"
                             :value="key"
                    >
                        <span class="radio-item">
                            {{ value }}
                        </span>
                    </p-radio>
                    <span class="text-label-md text-gray-700">{{ $t('INVENTORY.COLLECTOR.CONDITION_POLICY_DESC') }}</span>
                </div>
                <div v-if="state.selectedConditionRadioIdx !== COLLECTOR_RULE_CONDITION_POLICY.ALWAYS"
                     class="condition-list"
                >
                    <div v-for="(condition, idx) in state.conditionList"
                         :key="`condition-${idx}`"
                         class="condition-item-row"
                    >
                        <p-select-dropdown class="condition-key"
                                           :menu="state.conditionKeyMenu"
                                           :selected="condition.key"
                                           is-fixed-width
                                           @select="handleSelectConditionKey($event, idx)"
                        />
                        <template v-if="condition.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.data)">
                            <p-text-input :value="state.conditionList[idx].subkey"
                                          class="condition-sub-key"
                                          block
                                          is-fixed-width
                                          placeholder="ex) os.os_type"
                                          @update:value="handleUpdateSubkeyInput($event)"
                            />
                        </template>
                        <template v-if="condition.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.tags)">
                            <p-text-input :value="state.conditionList[idx].subkey"
                                          class="condition-sub-key"
                                          block
                                          is-fixed-width
                                          placeholder="ex) a.b.c"
                                          @update:value="handleUpdateSubkeyInput($event)"
                            />
                        </template>
                        <collector-additional-rule-form-operator-dropdown class="condition-operator"
                                                                          @update:value="handleUpdateOperator($event, idx)"
                        />
                        <template v-if="condition.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.data) || condition.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.tags)">
                            <span>:</span>
                        </template>
                        <p-select-dropdown v-if="condition.key !== COLLECTOR_RULE_CONDITION_KEY.account
                                               && condition.key !== COLLECTOR_RULE_CONDITION_KEY['reference.resource_id']
                                               && !condition.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.data)
                                               && !condition.key.startsWith(COLLECTOR_RULE_CONDITION_KEY.tags)"
                                           class="condition-value"
                                           is-fixed-width
                        />
                        <p-text-input v-else
                                      v-model="condition.value"
                                      class="condition-value"
                                      block
                                      @update:value="handleUpdateValueInput($event, idx)"
                        />
                        <p-i v-if="state.conditionList.length > 1"
                             class="flex-shrink-0 cursor-pointer"
                             name="ic_delete"
                             @click="handleClickDeleteCondition(idx)"
                        />
                    </div>
                </div>
            </div>
        </section>
        <section class="right-section">
            <h5 class="text-paragraph-lg text-gray-900 font-bold">
                {{ $t('INVENTORY.COLLECTOR.ACTIONS') }}
            </h5>
            <div class="condition-contents-wrapper">
                <div class="condition-policy-wrapper">
                    <p-radio v-for="([key,value], idx) in Object.entries(state.actionPolicies)"
                             :key="`bookmark-scope-${idx}`"
                             v-model="state.selectedActionRadioIdx"
                             :value="key"
                    >
                        <span class="radio-item">
                            {{ value }}
                        </span>
                    </p-radio>
                </div>
                <div class="action-contents-wrapper">
                    <div v-if="state.selectedActionRadioIdx === 'change_project'">
                        <project-select-dropdown class="action-project"
                                                 is-fixed-width
                                                 :selected-project-ids="state.selectedProjectId"
                                                 :project-group-selectable="false"
                                                 @update:selected-project-ids="handleSelectProjectId"
                        />
                    </div>
                    <div v-else
                         class="match-box"
                    >
                        <p-field-group class="action-field-group"
                                       label="Source"
                                       required
                        >
                            <p-text-input v-model="state.sourceInput"
                                          class="action-source"
                                          block
                            />
                        </p-field-group>
                        <p-field-group class="action-field-group"
                                       label="Target"
                                       required
                        >
                            <p-text-input v-model="state.targetInput"
                                          class="action-target"
                                          block
                            />
                        </p-field-group>
                    </div>
                </div>
                <div class="stop-processing-wrapper">
                    <p-checkbox v-model="state.isStopProcessingChecked" />{{ $t('INVENTORY.COLLECTOR.THEN_STOP_PROCESSING') }}
                </div>
            </div>
        </section>
        <div class="form-footer">
            <p-button style-type="tertiary"
                      class="cancel-event-rule-button"
                      @click="handleClickCancel"
            >
                {{ $t('COMMON.BUTTONS.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      class="done-event-rule-button"
                      @click="handleClickDone"
            >
                {{ $t('COMMON.BUTTONS.DONE') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.collector-additional-rule-form {
    @apply grid grid-cols-12 pt-2;
    gap: 2rem;

    h4 {
        font-size: 1rem;
        line-height: 160%;
    }

    .left-section {
        @apply col-span-6;

        > h4 > span {
            font-weight: bold;
        }
    }

    .right-section {
        @apply col-span-6;

        .action-contents-wrapper {
            @apply border-4 border-gray-100 rounded-lg mt-3;
            padding: 1rem;
        }

        .match-box {
            @apply flex gap-2;

            /* custom design-system component - p-field-group */
            &:deep(.p-field-group) {
                margin-bottom: 0;
            }

            .action-field-group {
                @apply flex-grow;
            }
        }
    }
    .stop-processing-wrapper {
        @apply flex gap-1 mt-3 justify-end items-center text-label-md text-gray-900;
    }

    .condition-policy-wrapper {
        @apply flex gap-4 mb-4 items-end;
    }

    .form-footer {
        @apply col-span-12 flex justify-end gap-2 mt-3;
        margin-bottom: 0.625rem;
    }
}

.condition-contents-wrapper {
    @apply border-4 border-gray-100 rounded-lg mt-3;
    padding: 1rem;

    .condition-list {
        @apply flex flex-col gap-3;

        .condition-item-row {
            @apply flex gap-2 items-center justify-between;

            .condition-key {
                flex-grow: 1;
            }

            .condition-operator {
                flex-grow: 1;
            }

            .condition-value {
                flex-grow: 1;
            }
        }
    }
}

@screen tablet {
    .collector-additional-rule-form {
        .left-section {
            @apply col-span-12;
        }

        .right-section {
            @apply col-span-12;
            margin-top: 1rem;
        }
    }
}
</style>
