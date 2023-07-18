<script lang="ts" setup>
/* eslint-disable camelcase */

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton,
} from '@spaceone/design-system';
import {
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import EventRuleActionForm from '@/services/project/project-detail/project-alert/project-alert-event-rule/modules/EventRuleActionForm.vue';
import EventRuleConditionForm from '@/services/project/project-detail/project-alert/project-alert-event-rule/modules/EventRuleConditionForm.vue';
import type { Actions, Options, Condition } from '@/services/project/project-detail/project-alert/project-alert-event-rule/type';
import { OPERATOR } from '@/services/project/project-detail/project-alert/project-alert-event-rule/type';

const CONDITIONS_POLICY = Object.freeze({
    ALL: 'ALL',
    ANY: 'ANY',
});
type ConditionsPolicy = typeof CONDITIONS_POLICY[keyof typeof CONDITIONS_POLICY];


const EDIT_MODE = Object.freeze({
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
});
type EditMode = typeof EDIT_MODE[keyof typeof EDIT_MODE];

interface Props {
    projectId: string;
    mode: EditMode;
    eventRuleId: string;
}

const props = withDefaults(defineProps<Props>(), {
    projectId: undefined,
    mode: EDIT_MODE.CREATE,
    eventRuleId: undefined,
});
const emit = defineEmits<{(e: 'confirm'): void;
    (e: 'cancel'): void;
}>();
const { t } = useI18n();

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
    } as Options,
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
        showSuccessMessage(t('PROJECT.EVENT_RULE.ALT_S_CREATE_EVENT_RULE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.EVENT_RULE.ALT_E_CREATE_EVENT_RULE'));
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
        showSuccessMessage(t('PROJECT.EVENT_RULE.ALT_S_UPDATE_EVENT_RULE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.EVENT_RULE.ALT_E_UPDATE_EVENT_RULE'));
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

</script>

<template>
    <div class="event-rule-form">
        <event-rule-condition-form
            v-model:conditions-policy="conditionsPolicy"
            v-model:conditions="state.conditions"
            class="event-rule-condition-form"
        />
        <event-rule-action-form
            v-model:actions="actions"
            v-model:options="options"
            class="event-rule-action-form"
        />
        <div class="button-group">
            <p-button style-type="tertiary"
                      @click="onClickCancel"
            >
                {{ t('PROJECT.EVENT_RULE.CANCEL') }}
            </p-button>
            <p-button :disabled="!state.isAllValid"
                      style-type="primary"
                      @click="onClickConfirm"
            >
                {{ mode === EDIT_MODE.CREATE ? t('PROJECT.EVENT_RULE.ADD') : t('PROJECT.EVENT_RULE.SAVE') }}
            </p-button>
        </div>
    </div>
</template>

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
