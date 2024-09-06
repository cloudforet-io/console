<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton, PRadio, PSelectDropdown, PI, PTextInput, PTooltip,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import {
    COLLECTOR_RULE_CONDITION_KEY, COLLECTOR_RULE_CONDITION_KEY_LABEL,
    COLLECTOR_RULE_CONDITION_POLICY,
} from '@/schema/inventory/collector-rule/constant';
// import type { CollectorRuleModel } from '@/schema/inventory/collector-rule/model';
import type { CollectorRuleConditionKey } from '@/schema/inventory/collector-rule/type';
import { i18n as _i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import CollectorAdditionalRuleFormOperatorDropdown
    from '@/services/asset-inventory/components/CollectorAdditionalRuleFormOperatorDropdown.vue';


// interface Props {
//     data?: CollectorRuleModel;
// }
// const props = withDefaults(defineProps<Props>(), {
//     data: undefined,
// });

const allReferenceStore = useAllReferenceStore();



const state = reactive({
    projects: computed(() => allReferenceStore.getters.project),
    conditionPolicies: computed(() => ({
        [COLLECTOR_RULE_CONDITION_POLICY.ANY]: _i18n.t('PROJECT.EVENT_RULE.ANY'),
        [COLLECTOR_RULE_CONDITION_POLICY.ALL]: _i18n.t('PROJECT.EVENT_RULE.ALL'),
        [COLLECTOR_RULE_CONDITION_POLICY.ALWAYS]: _i18n.t('PROJECT.EVENT_RULE.ALWAYS'),
    })),
    selectedRadioIdx: COLLECTOR_RULE_CONDITION_POLICY.ANY,
    conditionKeyMenu: computed<SelectDropdownMenuItem[]>(() => Object.keys(COLLECTOR_RULE_CONDITION_KEY).filter((key) => (!((key === 'data' || key === 'tags')))).map((key) => ({
        label: COLLECTOR_RULE_CONDITION_KEY_LABEL[key],
        name: key,
    })).concat([
        { label: 'Data', name: 'data' },
        { label: 'Tags', name: 'tags' },
    ])),
    selectedConditionKey: COLLECTOR_RULE_CONDITION_KEY.provider as CollectorRuleConditionKey,
});

const handleClickAddRule = () => {
    console.log('add rule');
};

const handleSelectConditionKey = (value:CollectorRuleConditionKey) => {
    state.selectedConditionKey = value;
};
const handle = (value) => {
    console.log(value);
};
</script>

<template>
    <div class="collector-additional-rule-form">
        <section class="left-section">
            <h5 class="text-paragraph-lg text-gray-900 font-bold flex justify-between">
                <span>{{ $t('INVENTORY.COLLECTOR.CONDITIONS') }}<p-tooltip v-if="state.selectedConditionKey === COLLECTOR_RULE_CONDITION_KEY.data
                                                                               || state.selectedConditionKey === COLLECTOR_RULE_CONDITION_KEY.tags"
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
                             v-model="state.selectedRadioIdx"
                             :value="key"
                    >
                        <span class="radio-item">
                            {{ value }}
                        </span>
                    </p-radio>
                    <span class="text-label-md text-gray-700">{{ $t('INVENTORY.COLLECTOR.CONDITION_POLICY_DESC') }}</span>
                </div>
                <div v-if="state.selectedRadioIdx !== COLLECTOR_RULE_CONDITION_POLICY.ALWAYS"
                     class="condition-list"
                >
                    <div class="condition-item-row">
                        <p-select-dropdown class="condition-key"
                                           :menu="state.conditionKeyMenu"
                                           is-fixed-width
                                           @select="handleSelectConditionKey"
                        />
                        <template v-if="state.selectedConditionKey === COLLECTOR_RULE_CONDITION_KEY.data">
                            <p-text-input class="condition-sub-key"
                                          block
                                          is-fixed-width
                                          placeholder="ex) os.os_type"
                            />
                        </template>
                        <template v-if="state.selectedConditionKey === COLLECTOR_RULE_CONDITION_KEY.tags">
                            <p-text-input class="condition-sub-key"
                                          is-fixed-width
                                          placeholder="ex) a.b.c"
                            />
                        </template>
                        <template v-else>
                            <collector-additional-rule-form-operator-dropdown class="condition-operator"
                                                                              @update:value="handle($event)"
                            />
                            <template v-if="state.selectedConditionKey === COLLECTOR_RULE_CONDITION_KEY.data || state.selectedConditionKey === COLLECTOR_RULE_CONDITION_KEY.tags">
                                <span>:</span>
                            </template>
                            <p-select-dropdown v-if="state.selectedConditionKey !== COLLECTOR_RULE_CONDITION_KEY.account
                                                   && state.selectedConditionKey !== COLLECTOR_RULE_CONDITION_KEY['reference.resource_id']"
                                               class="condition-value"
                                               is-fixed-width
                            />
                            <p-text-input v-else
                                          class="condition-value"
                                          block
                            />
                            <p-i class="flex-shrink-0"
                                 name="ic_delete"
                            />
                        </template>
                    </div>
                </div>
            </div>
        </section>
        <section class="right-section">
            <h5 class="text-paragraph-lg text-gray-900 font-bold">
                {{ $t('INVENTORY.COLLECTOR.ACTIONS') }}
            </h5>
            <table />
        </section>
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

        .condition-policy-wrapper {
            @apply flex gap-4 mb-4 items-end;
        }
    }

    .right-section {
        @apply col-span-6;
    }
}

.condition-contents-wrapper {
    @apply border-4 border-gray-100 rounded-lg mt-3;
    padding: 1rem;

    .condition-list {
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
