<script setup lang="ts">
import {
    reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton,
} from '@cloudforet/mirinae';


import type { EventRuleCreateParameters } from '@/schema/monitoring/event-rule/api-verbs/create';
import type { EventRuleGetParameters } from '@/schema/monitoring/event-rule/api-verbs/get';
import type { EventRuleUpdateParameters } from '@/schema/monitoring/event-rule/api-verbs/update';
import type { EventRuleModel } from '@/schema/monitoring/event-rule/model';
import type {
    EventRuleActions,
    EventRuleCondition,
    EventRuleConditionsPolicy,
    EventRuleOptions,
} from '@/schema/monitoring/event-rule/type';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ProjectAlertEventRuleActionForm from '@/services/project/v1/components/ProjectAlertEventRuleActionForm.vue';
import ProjectAlertEventRuleConditionForm from '@/services/project/v1/components/ProjectAlertEventRuleConditionForm.vue';


type EditMode = 'CREATE' | 'UPDATE';

interface Props {
    projectId?: string;
    mode?: EditMode;
    eventRuleId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    projectId: undefined,
    mode: 'CREATE',
    eventRuleId: undefined,
});
const emit = defineEmits<{(e: 'cancel'): void;
    (e: 'confirm'): void;
}>();

const state = reactive({
    conditionsPolicy: 'ALL' as EventRuleConditionsPolicy,
    conditions: [
        {
            key: 'title',
            value: '',
            operator: 'contain',
        },
    ] as EventRuleCondition[],
    actions: {
        change_assignee: undefined,
        change_urgency: undefined,
        change_escalation_policy: undefined,
        add_additional_info: undefined,
        no_notification: undefined,
    } as EventRuleActions,
    options: {
        stop_processing: undefined,
    } as EventRuleOptions,
    isAllValid: false,
    isProjectRoute: false,
});

/* api */
const getEventRule = async () => {
    try {
        const res = await SpaceConnector.clientV2.monitoring.eventRule.get<EventRuleGetParameters, EventRuleModel>({
            event_rule_id: props.eventRuleId || '',
        });
        state.conditionsPolicy = res.conditions_policy;
        state.conditions = res.conditions;
        state.actions = res.actions;
        state.options = res.options;

        if (state.actions.change_project) {
            state.isProjectRoute = true;
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const createEventRule = async () => {
    try {
        await SpaceConnector.clientV2.monitoring.eventRule.create<EventRuleCreateParameters>({
            conditions: state.conditions,
            conditions_policy: state.conditionsPolicy,
            resource_group: 'PROJECT' as const,
            project_id: props.projectId,
            actions: state.actions,
            options: state.options,
        });
        showSuccessMessage(i18n.t('PROJECT.EVENT_RULE.ALT_S_CREATE_EVENT_RULE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.EVENT_RULE.ALT_E_CREATE_EVENT_RULE'));
    }
};
const updateEventRule = async () => {
    try {
        await SpaceConnector.clientV2.monitoring.eventRule.update<EventRuleUpdateParameters>({
            event_rule_id: props.eventRuleId || '',
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
    if (props.mode === 'CREATE') {
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
        <project-alert-event-rule-condition-form
            class="event-rule-condition-form"
            :conditions-policy.sync="state.conditionsPolicy"
            :conditions.sync="state.conditions"
            :project-id="props.projectId"
        />
        <project-alert-event-rule-action-form
            class="event-rule-action-form"
            :actions.sync="state.actions"
            :options.sync="state.options"
            :is-project-route.sync="state.isProjectRoute"
        />
        <div class="button-group">
            <p-button style-type="tertiary"
                      @click="onClickCancel"
            >
                {{ $t('PROJECT.EVENT_RULE.CANCEL') }}
            </p-button>
            <p-button :disabled="!state.isAllValid"
                      style-type="primary"
                      @click="onClickConfirm"
            >
                {{ props.mode === 'CREATE' ? $t('PROJECT.EVENT_RULE.ADD') : $t('PROJECT.EVENT_RULE.SAVE') }}
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
