<template>
    <div class="event-rule-form">
        <event-rule-condition-form class="event-rule-condition-form" @change="onChangeConditionInput" />
        <event-rule-action-form class="event-rule-action-form" @change="onChangeActionInput" />
        <div class="button-group">
            <p-button style-type="gray900" :outline="true" @click="onClickCancel">
                {{ $t('PROJECT.EVENT_RULE.CANCEL') }}
            </p-button>
            <p-button style-type="primary-dark" @click="onClickConfirm">
                {{ $t('PROJECT.EVENT_RULE.CREATE') }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    PButton,
} from '@spaceone/design-system';

import EventRuleActionForm from '@/views/project/project/modules/event-rule/EventRuleActionForm.vue';
import EventRuleConditionForm from '@/views/project/project/modules/event-rule/EventRuleConditionForm.vue';
import { reactive } from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { i18n } from '@/translations';


const EDIT_MODE = Object.freeze({
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
});
type EDIT_MODE = typeof EDIT_MODE[keyof typeof EDIT_MODE];

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
    setup(props, { emit, root }) {
        const formState = reactive({
            conditionsPolicy: '',
            conditions: [],
            actions: {},
        });

        /* api */
        const createEventRule = async () => {
            try {
                await SpaceConnector.client.monitoring.eventRule.create({
                    conditions: formState.conditions,
                    conditions_policy: formState.conditionsPolicy,
                    actions: formState.actions,
                    project_id: props.projectId,
                });
                showSuccessMessage(i18n.t('PROJECT.EVENT_RULE.ALT_S_CREATE_EVENT_RULE'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('PROJECT.EVENT_RULE.ALT_E_CREATE_EVENT_RULE'), e, root);
            }
        };
        const updateEventRule = async () => {
            try {
                await SpaceConnector.client.monitoring.eventRule.update({
                    event_rule_id: props.eventRuleId,
                    conditions: formState.conditions,
                    conditions_policy: formState.conditionsPolicy,
                    actions: formState.actions,
                });
                showSuccessMessage(i18n.t('PROJECT.EVENT_RULE.ALT_S_UPDATE_EVENT_RULE'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('PROJECT.EVENT_RULE.ALT_E_UPDATE_EVENT_RULE'), e, root);
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
        const onChangeConditionInput = (data) => {
            formState.conditionsPolicy = data.conditionsPolicy;
            formState.conditions = data.conditions;
        };
        const onChangeActionInput = (data) => {
            formState.actions = { ...data };
        };

        return {
            onClickConfirm,
            onClickCancel,
            onChangeConditionInput,
            onChangeActionInput,
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
