<template>
    <section class="event-rule-condition-form">
        <div class="title-wrapper">
            <p class="title">
                <strong>{{ $t('PROJECT.EVENT_RULE.CONDITION') }}</strong>
            </p>
            <p-button style-type="tertiary"
                      icon-left="ic_plus_bold"
                      class="add-button"
                      @click="onClickAdd"
            >
                {{ $t('PROJECT.EVENT_RULE.ADD') }}
            </p-button>
        </div>
        <div class="content-wrapper">
            <div class="radio-wrapper">
                <p-radio v-for="policy in conditionsPolicies"
                         :key="policy.name"
                         v-model="proxyConditionsPolicy"
                         :value="policy.name"
                         class="mr-4"
                >
                    {{ policy.label }}
                </p-radio>
                <span>{{ $t('PROJECT.EVENT_RULE.OF_THE_FOLLOWING_ARE_MET') }}</span>
            </div>
            <template v-for="(condition, idx) of proxyConditions">
                <p-divider v-if="idx > 0"
                           :key="`divider-${idx}`"
                />
                <div :key="`condition-${idx}`"
                     class="input-wrapper"
                >
                    <div class="left-part">
                        <p-select-dropdown v-model="condition.key"
                                           class="input"
                                           :items="keys"
                                           use-fixed-menu-style
                        />
                        <p-select-dropdown v-model="condition.operator"
                                           class="input"
                                           :items="operators"
                                           use-fixed-menu-style
                        />
                        <p-text-input v-model="condition.value"
                                      class="input"
                        />
                    </div>
                    <p-icon-button name="ic_delete"
                                   class="delete-button"
                                   :class="{ opacity: proxyConditions.length < 2}"
                                   @click="onClickDelete(idx)"
                    />
                </div>
            </template>
        </div>
    </section>
</template>

<script lang="ts">

import { computed, reactive, toRefs } from 'vue';

import {
    PButton, PRadio, PSelectDropdown, PTextInput, PIconButton, PDivider,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';

const CONDITIONS_POLICY = Object.freeze({
    ALL: 'ALL',
    ANY: 'ANY',
});
const OPERATOR = Object.freeze({
    eq: 'eq',
    contain: 'contain',
    not: 'not',
    not_contain: 'not_contain',
});

export default {
    name: 'EventRuleConditionForm',
    components: {
        PButton,
        PRadio,
        PSelectDropdown,
        PTextInput,
        PIconButton,
        PDivider,
    },
    props: {
        conditionsPolicy: {
            type: String,
            default: CONDITIONS_POLICY.ALL,
        },
        conditions: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            conditionsPolicies: computed(() => ([
                {
                    name: CONDITIONS_POLICY.ALL,
                    label: i18n.t('PROJECT.EVENT_RULE.ALL'),
                },
                {
                    name: CONDITIONS_POLICY.ANY,
                    label: i18n.t('PROJECT.EVENT_RULE.ANY'),
                },
            ])),
            operators: computed(() => ([
                {
                    name: OPERATOR.contain,
                    label: i18n.t('PROJECT.EVENT_RULE.CONTAINS'),
                },
                {
                    name: OPERATOR.not_contain,
                    label: i18n.t('PROJECT.EVENT_RULE.DOES_NOT_CONTAIN'),
                },
                {
                    name: OPERATOR.eq,
                    label: i18n.t('PROJECT.EVENT_RULE.EQUALS'),
                },
                {
                    name: OPERATOR.not,
                    label: i18n.t('PROJECT.EVENT_RULE.DOES_NOT_EQUAL'),
                },
            ])),
            proxyConditionsPolicy: useProxyValue('conditionsPolicy', props, emit),
            proxyConditions: useProxyValue('conditions', props, emit),
            keys: [
                {
                    name: 'title',
                    label: 'Title',
                },
                {
                    name: 'description',
                    label: 'Description',
                },
                {
                    name: 'rule',
                    label: 'Rule',
                },
                {
                    name: 'resource_id',
                    label: 'Resource ID',
                },
                {
                    name: 'resource_name',
                    label: 'Resource Name',
                },
                {
                    name: 'resource_type',
                    label: 'Resource Type',
                },
            ],
        });

        /* event */
        const onClickAdd = () => {
            state.proxyConditions.push({
                key: '',
                value: '',
                operator: OPERATOR.contain,
            });
        };
        const onClickDelete = (idx) => {
            const conditions = [...state.proxyConditions];
            conditions.splice(idx, 1);
            state.proxyConditions = conditions;
        };

        return {
            ...toRefs(state),
            onClickAdd,
            onClickDelete,
        };
    },
};
</script>

<style lang="postcss" scoped>
.title-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;

    .title {
        font-size: 1rem;
        line-height: 2;
    }
}
.content-wrapper {
    @apply border border-gray-100 rounded-md;
    border-width: 0.25rem;
    font-size: 0.875rem;
    padding: 1rem;

    .radio-wrapper {
        @apply flex items-center;
    }
    .input-wrapper {
        display: flex;
        margin-top: 0.75rem;
        gap: 0.5rem;

        .left-part {
            display: flex;
            width: 100%;
            justify-content: space-between;
            flex-grow: 1;
            gap: 0.5rem;

            .input {
                min-width: calc((100% - 1rem) / 3);
                width: inherit;
                flex-basis: 0;
                flex-grow: 1;
            }
        }
        .delete-button {
            &.opacity {
                pointer-events: none;
                opacity: 0;
            }
        }
    }
    .p-divider {
        display: none;
    }
}

@screen mobile {
    .content-wrapper {
        .input-wrapper {
            margin: 1rem 0;
            .left-part {
                display: block;
                .input {
                    width: 100%;
                    padding-bottom: 0.5rem;
                    &:last-child {
                        padding-bottom: 0;
                    }
                }
            }
        }
        .p-divider {
            display: block;
        }
    }
}
</style>
