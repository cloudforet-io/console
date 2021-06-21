<template>
    <section class="event-rule-condition-form">
        <div class="title-wrapper">
            <p class="title">
                <strong>{{ $t('PROJECT.EVENT_RULE.CONDITION') }}</strong>
            </p>
            <p-icon-text-button style-type="gray900" name="ic_plus_bold"
                                outline
                                class="add-button"
                                @click="onClickAdd"
            >
                {{ $t('PROJECT.EVENT_RULE.ADD') }}
            </p-icon-text-button>
        </div>
        <div class="content-wrapper">
            <div>
                <p-radio v-for="policy in conditionsPolicies"
                         :key="policy.name"
                         v-model="conditionsPolicy"
                         :value="policy.name"
                         class="mr-4"
                >
                    {{ policy.label }}
                </p-radio>
                <span>{{ $t('PROJECT.EVENT_RULE.OF_THE_FOLLOWING_ARE_MET') }}</span>
            </div>
            <div v-for="(condition, idx) of conditions" :key="`condition-${idx}`" class="input-wrapper">
                <div class="left-part">
                    <p-select-dropdown v-model="condition.key" class="input" />
                    <p-select-dropdown v-model="condition.operator"
                                       class="input"
                                       :items="operators"
                                       use-fixed-menu-style
                    />
                    <p-text-input v-model="condition.value" class="input" />
                </div>
                <p-icon-button name="ic_trashcan"
                               class="delete-button"
                               :class="{ opacity: conditions.length < 2}"
                               @click="onClickDelete(idx)"
                />
            </div>
        </div>
    </section>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { i18n } from '@/translations';

import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PIconTextButton, PRadio, PSelectDropdown, PTextInput, PIconButton,
} from '@spaceone/design-system';


const CONDITIONS_POLICY = Object.freeze({
    ALL: 'ALL',
    ANY: 'ANY',
});
type CONDITIONS_POLICY = typeof CONDITIONS_POLICY[keyof typeof CONDITIONS_POLICY];

const OPERATOR = Object.freeze({
    eq: 'eq',
    contain: 'contain',
    not: 'not',
    not_contain: 'not_contain',
});
type OPERATOR = typeof OPERATOR[keyof typeof OPERATOR];

interface Condition {
    key: string;
    value: string;
    operator: OPERATOR;
}

export default {
    name: 'EventRuleConditionForm',
    components: {
        PIconTextButton,
        PRadio,
        PSelectDropdown,
        PTextInput,
        PIconButton,
    },
    props: {},
    setup() {
        const state = reactive({
            conditionsPolicy: CONDITIONS_POLICY.ALL as CONDITIONS_POLICY,
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
            conditions: [
                {
                    key: '',
                    value: '',
                    operator: OPERATOR.contain,
                },
            ] as Condition[],
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
        });

        /* event */
        const onClickAdd = () => {
            state.conditions.push({
                key: '',
                value: '',
                operator: OPERATOR.contain,
            });
        };
        const onClickDelete = (idx) => {
            const conditions = [...state.conditions];
            conditions.splice(idx, 1);
            state.conditions = conditions;
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
                width: calc((100% - 1rem) / 3);
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
}
</style>
