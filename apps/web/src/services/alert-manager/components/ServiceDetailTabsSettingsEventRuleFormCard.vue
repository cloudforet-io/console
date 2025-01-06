<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PCard, PFieldTitle, PFieldGroup, PTextInput, PDivider, PLazyImg, PI, PSelectButton,
} from '@cloudforet/mirinae';

import { EVENT_RULE_CONDITIONS_POLICY, EVENT_RULE_SCOPE } from '@/schema/alert-manager/event-rule/constant';
import type { EventRuleScopeType, EventRuleConditionsPolicyType } from '@/schema/alert-manager/event-rule/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';

import { useFormValidator } from '@/common/composables/form-validator';

import { gray } from '@/styles/colors';

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

const storeState = reactive({
    webhook: computed<WebhookReferenceMap>(() => allReferenceGetters.webhook),
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});
const state = reactive({
    conditionPolicy: computed<EventRuleConditionPolicyButtonType[]>(() => [
        { name: EVENT_RULE_CONDITIONS_POLICY.ALWAYS, label: i18n.t('ALERT_MANAGER.EVENT_RULE.ALWAYS') },
        { name: EVENT_RULE_CONDITIONS_POLICY.ANY, label: i18n.t('ALERT_MANAGER.EVENT_RULE.SET_CONDITION') },
    ]),
    selectedPolicyButton: EVENT_RULE_CONDITIONS_POLICY.ALWAYS as EventRuleConditionsPolicyType,
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
</script>

<template>
    <p-card style-type="indigo400"
            :header="$t('ALERT_MANAGER.EVENT_RULE.CREATE_FORM_TITLE')"
            class="service-detail-tabs-settings-event-rule-form-card"
    >
        <div class="form-wrapper flex flex-col gap-6">
            <div class="flex flex-col gap-3">
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
            <div class="flex flex-col gap-3">
                <div class="flex gap-2">
                    <p-select-button v-for="(item, index) in state.conditionPolicy"
                                     :key="`condition-policy-${index}`"
                                     v-model="state.selectedPolicyButton"
                                     :value="item.name"
                    >
                        {{ item.label }}
                    </p-select-button>
                </div>
                <div v-if="state.selectedPolicyButton === EVENT_RULE_CONDITIONS_POLICY.ANY"
                     class="border-4 border-gray-100 rounded-xl py-4 px-6"
                >
                    set policy area
                </div>
            </div>
            <div class="flex items-center justify-center h-6 bg-gray-100 rounded-xl">
                <p-i name="ic_arrow-down-bold"
                     width="1rem"
                     height="1rem"
                     :color="gray[300]"
                />
            </div>
        </div>
    </p-card>
</template>

<style scoped>
.service-detail-tabs-settings-event-rule-form-card {
    .form-wrapper {
        padding: 1.25rem 1.125rem;
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
}
</style>
