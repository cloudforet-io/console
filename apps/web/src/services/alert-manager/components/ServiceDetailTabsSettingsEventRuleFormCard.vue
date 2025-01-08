<script setup lang="ts">
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PCard, PFieldTitle, PFieldGroup, PTextInput, PDivider, PLazyImg, PI, PSelectButton, PIconButton, PCheckbox, PButton,
} from '@cloudforet/mirinae';

import type { EventRuleCreateParameters } from '@/schema/alert-manager/event-rule/api-verbs/create';
import { EVENT_RULE_CONDITIONS_POLICY, EVENT_RULE_SCOPE } from '@/schema/alert-manager/event-rule/constant';
import type { EventRuleScopeType, EventRuleConditionsPolicyType, EventRuleActionsType } from '@/schema/alert-manager/event-rule/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { gray, white } from '@/styles/colors';

import ServiceDetailTabsSettingsEventRuleActionForm
    from '@/services/alert-manager/components/ServiceDetailTabsSettingsEventRuleActionForm.vue';
import ServiceDetailTabsSettingsEventRuleConditionForm
    from '@/services/alert-manager/components/ServiceDetailTabsSettingsEventRuleConditionForm.vue';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type { EventRuleConditionPolicyButtonType } from '@/services/alert-manager/types/alert-manager-type';

interface Props {
    selectedWebhook: string;
    selectedScope?: EventRuleScopeType;
}

const props = withDefaults(defineProps<Props>(), {
    selectedWebhook: '',
    selectedScope: undefined,
});

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
    webhook: computed<WebhookReferenceMap>(() => allReferenceGetters.webhook),
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});
const state = reactive({
    loading: false,
    conditionPolicy: computed<EventRuleConditionPolicyButtonType[]>(() => [
        { name: EVENT_RULE_CONDITIONS_POLICY.ALWAYS, label: i18n.t('ALERT_MANAGER.EVENT_RULE.ALWAYS') },
        { name: EVENT_RULE_CONDITIONS_POLICY.ANY, label: i18n.t('ALERT_MANAGER.EVENT_RULE.SET_CONDITION') },
    ]),
    selectedPolicyButton: EVENT_RULE_CONDITIONS_POLICY.ALWAYS as EventRuleConditionsPolicyType,
    conditionsPolicy: 'ALL' as EventRuleConditionsPolicyType,
    conditions: [
        {
            key: 'title',
            value: '',
            operator: 'contain',
        },
    ],
    stopProcessing: false,
    actions: undefined as EventRuleActionsType|undefined,
    isAllValid: computed<boolean>(() => isAllValid.value
            && (state.selectedPolicyButton === EVENT_RULE_CONDITIONS_POLICY.ALWAYS ? true : state.conditions.every((condition) => condition.value.trim() !== ''))
            && (state.actions ? Object.values(state.actions).every((action) => !!action) : true)),
    refinedData: computed<EventRuleCreateParameters>(() => ({
        name: name.value,
        scope: props.selectedScope || EVENT_RULE_SCOPE.GLOBAL,
        conditions: state.selectedPolicyButton === EVENT_RULE_CONDITIONS_POLICY.ALWAYS
            ? undefined
            : state.conditions,
        conditions_policy: state.selectedPolicyButton === EVENT_RULE_CONDITIONS_POLICY.ALWAYS
            ? EVENT_RULE_CONDITIONS_POLICY.ALWAYS
            : state.conditionsPolicy,
        actions: state.actions,
        options: {
            stop_processing: state.stopProcessing,
        },
        service_id: storeState.serviceId,
        webhook_id: props.selectedScope === EVENT_RULE_SCOPE.GLOBAL ? undefined : props.selectedWebhook,
    })),
});

const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: 'Event_Rule_Name',
}, {
    name(value: string) {
        if (!value) return i18n.t('ALERT_MANAGER.EVENT_RULE.NAME_REQUIRED');
        return '';
    },
});

const getWebhookIcon = (): string|undefined => {
    if (!props.selectedWebhook) return undefined;
    const webhook = storeState.webhook[props.selectedWebhook]?.data;
    if (!webhook) return undefined;
    return storeState.plugins[webhook.plugin_info.plugin_id]?.icon || '';
};

const handleChangeActionForm = (value: EventRuleActionsType) => {
    state.actions = value;
};
const handleStopProcessingChange = (value: boolean) => {
    state.stopProcessing = value;
};
const handleSelectPolicyButton = () => {
    state.conditions = [
        {
            key: 'title',
            value: '',
            operator: 'contain',
        },
    ];
};
const handleDeleteForm = () => {
    serviceDetailPageStore.setShowEventRuleFormCard(false);
};

const handleAddButton = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.alertManager.eventRule.create<EventRuleCreateParameters>(state.refinedData);
        showSuccessMessage(i18n.t('ALERT_MANAGER.EVENT_RULE.ALT_S_CREATE_EVENT_RULE'), '');
        await serviceDetailPageStore.fetchEventRuleList({
            service_id: storeState.serviceId,
        });
        handleDeleteForm();
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
    }
};
</script>

<template>
    <p-card style-type="indigo400"
            :header="$t('ALERT_MANAGER.EVENT_RULE.CREATE_FORM_TITLE')"
            class="service-detail-tabs-settings-event-rule-form-card"
    >
        <template #header>
            <div class="flex items-center justify-between">
                <span class="font-bold">{{ $t('ALERT_MANAGER.EVENT_RULE.CREATE_FORM_TITLE') }}</span>
                <p-icon-button name="ic_delete"
                               style-type="transparent"
                               :color="white"
                               @click="handleDeleteForm"
                />
            </div>
        </template>
        <div class="content-wrapper flex flex-col gap-2">
            <div class="flex flex-col gap-6">
                <div class="form-wrapper">
                    <div class="input-form-wrapper">
                        <p-field-title class="field-title"
                                       :label="$t('ALERT_MANAGER.EVENT_RULE.LABEL_NAME')"
                                       size="lg"
                                       font-weight="regular"
                                       required
                        />
                        <p-field-group class="input-form"
                                       required
                                       :invalid="invalidState.name"
                                       :invalid-text="invalidTexts.name"
                        >
                            <template #default="{ invalid }">
                                <p-text-input :value="name"
                                              :invalid="invalid"
                                              block
                                              @update:value="setForm('name', $event)"
                                />
                            </template>
                        </p-field-group>
                    </div>
                    <div class="input-form-wrapper">
                        <p-field-title class="field-title"
                                       :label="$t('ALERT_MANAGER.EVENT_RULE.LABEL_SCOPE')"
                                       size="lg"
                                       font-weight="regular"
                                       required
                        />
                        <p-field-group class="input-form">
                            <div class="flex items-center gap-1 text-label-md">
                                <span class="text-label-lg text-gray-500">{{ $t('ALERT_MANAGER.EVENT_RULE.WEBHOOK_SCOPE') }}: </span>
                                <p v-if="props.selectedScope === EVENT_RULE_SCOPE.GLOBAL"
                                   class="scope-wrapper"
                                >
                                    <p-i name="ic_globe-filled"
                                         height="1rem"
                                         width="1rem"
                                         color="inherit"
                                    />
                                    <span>{{ $t('ALERT_MANAGER.EVENT_RULE.GLOBAL') }}</span>
                                </p>
                                <p v-else
                                   class="scope-wrapper"
                                >
                                    <p-lazy-img :src="getWebhookIcon()"
                                                error-icon="ic_webhook"
                                                width="1rem"
                                                height="1rem"
                                                class="icon"
                                    />
                                    <span>{{ storeState.webhook[props.selectedWebhook]?.label }}</span>
                                </p>
                            </div>
                        </p-field-group>
                    </div>
                    <p-divider class="divider" />
                </div>
                <div class="form-wrapper">
                    <div class="flex gap-2">
                        <p-select-button v-for="(item, index) in state.conditionPolicy"
                                         :key="`condition-policy-${index}`"
                                         v-model="state.selectedPolicyButton"
                                         :value="item.name"
                                         @change="handleSelectPolicyButton"
                        >
                            {{ item.label }}
                        </p-select-button>
                    </div>
                    <div class="border-section py-4 px-6">
                        <service-detail-tabs-settings-event-rule-condition-form v-if="state.selectedPolicyButton === EVENT_RULE_CONDITIONS_POLICY.ANY"
                                                                                :conditions-policy.sync="state.conditionsPolicy"
                                                                                :conditions.sync="state.conditions"
                        />
                        <div v-else
                             class="text-center"
                        >
                            <p>{{ $t('ALERT_MANAGER.EVENT_RULE.ALWAYS') }} {{ $t('ALERT_MANAGER.EVENT_RULE.ALWAYS_HELP_TEXT') }}</p>
                            <p class="text-label-md text-gray-500 mt-1">
                                {{ $t('ALERT_MANAGER.EVENT_RULE.ALWAYS_DESC') }}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="flex items-center justify-center h-6 bg-gray-100 rounded-xl">
                    <p-i name="ic_arrow-down-bold"
                         width="1rem"
                         height="1rem"
                         :color="gray[300]"
                    />
                </div>
                <div class="flex flex-col gap-2">
                    <p-field-title :label="$t('ALERT_MANAGER.EVENT_RULE.EXECUTE_ACTIONS')"
                                   size="lg"
                                   required
                                   font-weight="regular"
                    />
                    <div class="border-section">
                        <service-detail-tabs-settings-event-rule-action-form @change-form="handleChangeActionForm" />
                    </div>
                </div>
            </div>
            <div class="flex justify-end">
                <p-checkbox :selected="state.stopProcessing"
                            :value="true"
                            @change="handleStopProcessingChange"
                >
                    {{ $t('PROJECT.EVENT_RULE.THEN_STOP_PROCESSING') }}
                </p-checkbox>
            </div>
            <div class="flex justify-end mt-6 gap-4">
                <p-button style-type="tertiary"
                          @click="handleDeleteForm"
                >
                    {{ $t('COMMON.BUTTONS.CANCEL') }}
                </p-button>
                <p-button :disabled="!state.isAllValid"
                          :loading="state.loading"
                          @click="handleAddButton"
                >
                    {{ $t('COMMON.BUTTONS.ADD') }}
                </p-button>
            </div>
        </div>
    </p-card>
</template>

<style scoped>
.service-detail-tabs-settings-event-rule-form-card {
    max-width: 100%;
    .content-wrapper {
        padding: 1.25rem 1.125rem 1.75rem;
        .form-wrapper {
            @apply flex flex-col gap-3;
            .field-title {
                width: 15rem;
            }
            .input-form-wrapper {
                @apply flex items-center gap-6;
                .input-form {
                    @apply flex-1;
                    margin-bottom: 0;
                    .scope-wrapper {
                        @apply flex items-center gap-1;
                    }
                }
            }
            .divider {
                margin-top: 0.25rem;
            }
        }
        .border-section {
            @apply border-4 border-gray-100 rounded-xl;
        }
    }
}
</style>
