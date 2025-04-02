<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PCard,
    PFieldTitle,
    PFieldGroup,
    PTextInput,
    PDivider,
    PLazyImg,
    PI,
    PSelectButton,
    PIconButton,
    PCheckbox,
    PButton,
    screens,
} from '@cloudforet/mirinae';

import type { EventRuleCreateParameters } from '@/schema/alert-manager/event-rule/api-verbs/create';
import type { EventRuleUpdateParameters } from '@/schema/alert-manager/event-rule/api-verbs/update';
import { EVENT_RULE_CONDITIONS_POLICY, EVENT_RULE_SCOPE } from '@/schema/alert-manager/event-rule/constant';
import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';
import type {
    EventRuleScopeType, EventRuleConditionsPolicyType, EventRuleActionsType,
} from '@/schema/alert-manager/event-rule/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { gray, white } from '@/styles/colors';

import ServiceDetailTabsSettingsEventRuleActionForm
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRuleActionForm.vue';
import ServiceDetailTabsSettingsEventRuleConditionForm
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRuleConditionForm.vue';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type {
    EventRuleConditionPolicyButtonType,
    EventRuleConditionsDataType,
} from '@/services/alert-manager/v2/types/alert-manager-type';

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
const { width } = useWindowSize();

const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
    isEventRuleEditMode: computed<boolean>(() => serviceDetailPageState.isEventRuleEditMode),
    eventRuleInfo: computed<EventRuleModel>(() => serviceDetailPageState.eventRuleInfo),
    eventRuleList: computed<EventRuleModel[]>(() => serviceDetailPageState.eventRuleList),
    webhook: computed<WebhookReferenceMap>(() => allReferenceGetters.webhook),
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});
const state = reactive({
    isMobileSize: computed(() => width.value < screens.mobile.max),
    loading: false,
    conditionPolicy: computed<EventRuleConditionPolicyButtonType[]>(() => [
        { name: EVENT_RULE_CONDITIONS_POLICY.ALWAYS, label: i18n.t('ALERT_MANAGER.EVENT_RULE.ALWAYS') },
        { name: EVENT_RULE_CONDITIONS_POLICY.ANY, label: i18n.t('ALERT_MANAGER.EVENT_RULE.SET_CONDITION') },
    ]),
    selectedPolicyButton: EVENT_RULE_CONDITIONS_POLICY.ALWAYS as EventRuleConditionsPolicyType,
    conditionsPolicy: EVENT_RULE_CONDITIONS_POLICY.ALL as EventRuleConditionsPolicyType,
    conditions: [] as EventRuleConditionsDataType[],
    stopProcessing: false,
    actions: undefined as EventRuleActionsType|undefined,
    isAllValid: computed<boolean>(() => {
        if (name.value === '') return false;

        if (state.selectedPolicyButton !== EVENT_RULE_CONDITIONS_POLICY.ALWAYS) {
            const areConditionsValid = state.conditions.every((condition) => {
                if (condition.key.includes('additional_info')) {
                    return condition.subKey?.trim() && condition.value?.trim();
                }

                if (condition.key === 'severity') return true;

                return condition?.value.toString().trim() !== '';
            });

            if (!areConditionsValid) return false;
        }

        if (state.actions) {
            if (state.actions.match_asset?.create_temporary_asset) {
                const matchAssetValid = state.actions.match_asset.asset_types.length > 0 && state.actions.match_asset.key !== '';
                if (!matchAssetValid) return false;
            }
            if (state.actions.merge_asset_labels?.period !== undefined) {
                return state.actions.merge_asset_labels?.period !== '';
            }
            if (state.actions.change_title !== undefined) {
                return state.actions.change_title !== '';
            }
            if (state.actions.change_escalation_policy !== undefined) {
                return state.actions.change_escalation_policy !== '';
            }
        }

        return true;
    }),
    refinedData: computed<EventRuleCreateParameters>(() => ({
        name: name.value.trim(),
        scope: props.selectedScope || EVENT_RULE_SCOPE.GLOBAL,
        conditions: state.selectedPolicyButton === EVENT_RULE_CONDITIONS_POLICY.ALWAYS
            ? undefined
            : state.conditions.map((i) => {
                if (i.key.includes('additional_info')) {
                    return {
                        key: `additional_info.${i.subKey}`,
                        value: i.value,
                        operator: i.operator,
                    };
                }
                if (i.key === 'labels') {
                    return {
                        key: i.key,
                        value: i.operator === 'size_gte' || i.operator === 'size_lte' ? Number(i.value) || 0 : i.value,
                        operator: i.operator,
                    };
                }
                return {
                    key: i.key,
                    value: i.value,
                    operator: i.operator,
                };
            }),
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
} = useFormValidator({
    name: '',
}, {
    name(value: string) {
        if (value === storeState.eventRuleInfo.name) return '';
        const duplicatedName = Object.values(storeState.eventRuleList)?.find((item) => item.name === value);
        if (duplicatedName) {
            return i18n.t('ALERT_MANAGER.EVENT_RULE.VALIDATION_NAME_UNIQUE');
        }
        return '';
    },
});

const initializeState = () => {
    setForm('name', '');
    state.selectedPolicyButton = EVENT_RULE_CONDITIONS_POLICY.ALWAYS;
    state.conditionsPolicy = EVENT_RULE_CONDITIONS_POLICY.ALL;
    state.conditions = [{
        key: 'title',
        value: '',
        operator: 'contain',
        subKey: '',
    }];
    state.stopProcessing = false;
};

const updateStateFromEventRuleInfo = () => {
    const eventRuleInfo = storeState.eventRuleInfo;

    setForm('name', eventRuleInfo.name || '');
    state.selectedPolicyButton = eventRuleInfo.conditions_policy === EVENT_RULE_CONDITIONS_POLICY.ALWAYS
        ? EVENT_RULE_CONDITIONS_POLICY.ALWAYS
        : EVENT_RULE_CONDITIONS_POLICY.ANY;
    if (state.selectedPolicyButton !== EVENT_RULE_CONDITIONS_POLICY.ALWAYS) {
        state.conditionsPolicy = eventRuleInfo.conditions_policy;
    }

    state.conditions = eventRuleInfo.conditions.map((i) => {
        if (i.key.includes('additional_info')) {
            return {
                key: 'additional_info',
                value: i.value,
                operator: i.operator,
                subKey: i.key.split('.')[1],
            };
        }
        return i;
    }) || [{
        key: 'title',
        value: '',
        operator: 'contain',
        subKey: '',
    }];
    state.stopProcessing = eventRuleInfo.options?.stop_processing || false;
};
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
            subKey: '',
        },
    ];
};
const handleDeleteForm = () => {
    serviceDetailPageStore.setShowEventRuleFormCard(false);
};
const handleAddButton = async () => {
    state.loading = true;
    try {
        const method = storeState.isEventRuleEditMode ? 'update' : 'create';
        const response = await fetchEventRule(method);
        await serviceDetailPageStore.fetchEventRuleList({
            service_id: storeState.serviceId,
        });
        if (!storeState.isEventRuleEditMode) {
            await replaceUrlQuery({
                webhookId: response.webhook_id || 'global',
                eventRuleId: response.event_rule_id,
            });
        }
        await handleDeleteForm();
    } finally {
        state.loading = false;
    }
};

const fetchEventRule = async (method: 'create' | 'update') => {
    try {
        let response;
        if (method === 'create') {
            response = await SpaceConnector.clientV2.alertManager.eventRule.create<EventRuleCreateParameters>(state.refinedData);
            showSuccessMessage(i18n.t('ALERT_MANAGER.EVENT_RULE.ALT_S_CREATE_EVENT_RULE'), '');
        } else {
            response = await SpaceConnector.clientV2.alertManager.eventRule.update<EventRuleUpdateParameters>({
                event_rule_id: storeState.eventRuleInfo.event_rule_id,
                name: state.refinedData.name,
                conditions: state.refinedData.conditions,
                conditions_policy: state.refinedData.conditions_policy,
                actions: state.refinedData.actions,
                options: state.refinedData.options,
            });
            showSuccessMessage(i18n.t('ALERT_MANAGER.EVENT_RULE.ALT_S_UPDATE_EVENT_RULE'), '');
        }
        return response;
    } catch (e) {
        ErrorHandler.handleError(e, true);
        throw e;
    }
};

watch(() => storeState.isEventRuleEditMode, (isEventRuleEditMode) => {
    if (!isEventRuleEditMode) {
        initializeState();
    } else {
        updateStateFromEventRuleInfo();
    }
}, { immediate: true });
</script>

<template>
    <p-card style-type="indigo400"
            :header="$t('ALERT_MANAGER.EVENT_RULE.CREATE_FORM_TITLE')"
            class="service-detail-tabs-settings-event-rule-form-card"
            :class="{ 'is-mobile': state.isMobileSize }"
    >
        <template #header>
            <div class="flex items-center justify-between">
                <span class="font-bold">{{ storeState.isEventRuleEditMode ? $t('ALERT_MANAGER.EVENT_RULE.EDIT_FORM_TITLE ') : $t('ALERT_MANAGER.EVENT_RULE.CREATE_FORM_TITLE') }}</span>
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
                                              :block="!state.isMobileSize"
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
                            <div class="input-form-contents">
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
                        <service-detail-tabs-settings-event-rule-action-form :actions="state.actions"
                                                                             @change-form="handleChangeActionForm"
                        />
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
                    {{ storeState.isEventRuleEditMode ? $t('ALERT_MANAGER.EVENT_RULE.SAVE') : $t('COMMON.BUTTONS.ADD') }}
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
                    .input-form-contents {
                        @apply flex items-center gap-1 text-label-md;
                    }
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
    &.is-mobile {
        @apply flex flex-col;
        .content-wrapper {
            padding: 1.25rem 1.125rem 1.75rem;
            .form-wrapper {
                @apply flex flex-col gap-3;
                .field-title {
                    width: 15rem;
                }
                .input-form-wrapper {
                    @apply flex flex-col items-start;
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
}
</style>
