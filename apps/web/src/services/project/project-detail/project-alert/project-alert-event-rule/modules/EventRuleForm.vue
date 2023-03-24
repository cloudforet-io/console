<template>
    <div class="event-rule-form">
        <event-rule-condition-form
            class="event-rule-condition-form"
            :conditions-policy.sync="conditionsPolicy"
            :conditions.sync="conditions"
        />
        <event-rule-action-form
            class="event-rule-action-form"
            :actions.sync="actions"
            :options.sync="options"
        />
        <div class="button-group">
            <p-button style-type="tertiary"
                      @click="onClickCancel"
            >
                {{ $t('PROJECT.EVENT_RULE.CANCEL') }}
            </p-button>
            <p-button :disabled="!isAllValid"
                      style-type="primary"
                      @click="onClickConfirm"
            >
                {{ mode === EDIT_MODE.CREATE ? $t('PROJECT.EVENT_RULE.ADD') : $t('PROJECT.EVENT_RULE.SAVE') }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import type { SetupContext } from 'vue';
import {
    reactive, toRefs, watch,
} from 'vue';

import {
    PButton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import EventRuleActionForm from '@/services/project/project-detail/project-alert/project-alert-event-rule/modules/EventRuleActionForm.vue';
import EventRuleConditionForm from '@/services/project/project-detail/project-alert/project-alert-event-rule/modules/EventRuleConditionForm.vue';

const CONDITIONS_POLICY = Object.freeze({
    ALL: 'ALL',
    ANY: 'ANY',
});
type ConditionsPolicy = typeof CONDITIONS_POLICY[keyof typeof CONDITIONS_POLICY];

const OPERATOR = Object.freeze({
    eq: 'eq',
    contain: 'contain',
    not: 'not',
    not_contain: 'not_contain',
});
type Operator = typeof OPERATOR[keyof typeof OPERATOR];

interface Condition {
    key: string;
    value: string;
    operator: Operator;
}

const EDIT_MODE = Object.freeze({
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
});

type Responder = {
    resource_type: string;
    resource_id: string;
};
interface Actions {
    change_assignee: string;
    change_urgency?: string;
    change_project: string;
    add_project_dependency: string[];
    add_responder: Responder[];
    add_additional_info: Record<string, string>;
    no_notification: boolean;
}

export default {
    name: 'EventRuleForm',
    components: {
        EventRuleActionForm,
        EventRuleConditionForm,
        PButton,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
        mode: {
            type: String,
            default: EDIT_MODE.CREATE,
        },
        eventRuleId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            conditionsPolicy: CONDITIONS_POLICY.ALL as ConditionsPolicy,
            conditions: [
                {
                    key: '',
                    value: '',
                    operator: OPERATOR.contain,
                },
            ] as Condition[],
            actions: {
                change_assignee: '',
                change_urgency: undefined,
                change_project: '',
                add_project_dependency: [],
                add_responder: [],
                add_additional_info: {},
                no_notification: false,
            } as Actions,
            options: {
                stop_processing: false,
            },
            isAllValid: false,
        });

        /* api */
        const getEventRule = async () => {
            try {
                const res = await SpaceConnector.client.monitoring.eventRule.get({
                    event_rule_id: props.eventRuleId,
                });
                state.conditionsPolicy = res.conditions_policy;
                state.conditions = res.conditions;
                state.actions = res.actions;
                state.options = res.options;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        const createEventRule = async () => {
            try {
                await SpaceConnector.client.monitoring.eventRule.create({
                    conditions: state.conditions,
                    conditions_policy: state.conditionsPolicy,
                    actions: state.actions,
                    options: state.options,
                    project_id: props.projectId,
                });
                showSuccessMessage(i18n.t('PROJECT.EVENT_RULE.ALT_S_CREATE_EVENT_RULE'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.EVENT_RULE.ALT_E_CREATE_EVENT_RULE'));
            }
        };
        const updateEventRule = async () => {
            try {
                await SpaceConnector.client.monitoring.eventRule.update({
                    event_rule_id: props.eventRuleId,
                    conditions: state.conditions,
                    conditions_policy: state.conditionsPolicy,
                    actions: state.actions,
                    options: state.options,
                });
                showSuccessMessage(i18n.t('PROJECT.EVENT_RULE.ALT_S_UPDATE_EVENT_RULE'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.EVENT_RULE.ALT_E_UPDATE_EVENT_RULE'));
            }
        };

        /* event */
        const onClickConfirm = async () => {
            if (props.mode === EDIT_MODE.CREATE) {
                await createEventRule();
            } else {
                await updateEventRule();
            }
            emit('confirm');
        };
        const onClickCancel = () => {
            emit('cancel');
        };

        watch(() => props.eventRuleId, async (eventRuleId) => {
            if (eventRuleId) await getEventRule();
        }, { immediate: true });

        watch(() => state.conditions, (conditions) => {
            state.isAllValid = conditions.every((d) => d.key && d.value);
        }, { immediate: true, deep: true });

        return {
            ...toRefs(state),
            EDIT_MODE,
            onClickConfirm,
            onClickCancel,
        };
    },
};
</script>

<style lang="postcss" scoped>
.event-rule-form {
    @apply grid grid-cols-12;
    gap: 2rem;

    .event-rule-condition-form {
        @apply col-span-6;
    }
    .event-rule-action-form {
        @apply col-span-6;
    }
    .button-group {
        @apply col-span-12;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }
}

@screen tablet {
    .event-rule-form {
        display: block;
        .event-rule-action-form {
            padding-top: 2rem;
        }
        .button-group {
            padding-top: 2rem;
        }
    }
}

</style>
