<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PCard, PFieldTitle, PFieldGroup, PDataLoader, PDivider, PLazyImg, PI, PIconButton,
} from '@cloudforet/mirinae';

import { EVENT_RULE_CONDITIONS_POLICY, EVENT_RULE_SCOPE } from '@/schema/alert-manager/event-rule/constant';
import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';

import { gray } from '@/styles/colors';

import ServiceDetailTabsSettingsEventRuleDeleteModal
    from '@/services/alert-manager/components/ServiceDetailTabsSettingsEventRuleDeleteModal.vue';
import {
    getActionSettingTypeI18n,
    getActionSettingI18n,
} from '@/services/alert-manager/composables/event-rule-action-data';
import type { EventRuleActionsItemValueType, EventRuleActionsItemType } from '@/services/alert-manager/types/alert-manager-type';

interface Props {
    eventRule?: EventRuleModel;
    loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    eventRule: () => ({} as EventRuleModel),
    loading: true,
});

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const storeState = reactive({
    webhook: computed<WebhookReferenceMap>(() => allReferenceGetters.webhook),
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});
const state = reactive({
    actionSetting: getActionSettingI18n(),
    actionSettingType: getActionSettingTypeI18n(),
    actions: computed<EventRuleActionsItemType>(() => {
        const result = {} as EventRuleActionsItemType;

        if (props.eventRule.actions) {
            Object.entries(props.eventRule.actions).forEach(([actionKey, actionValue]) => {
                const setting = state.actionSetting[actionKey];

                if (setting && actionValue) {
                    const { type, label, name } = setting;

                    if (!result[type]) {
                        result[type] = [] as EventRuleActionsItemValueType[];
                    }

                    result[type].push({
                        label,
                        name,
                        value: actionValue,
                    });
                }
            });
        }

        return result;
    }),
    modalVisible: false,
});

const getWebhookIcon = (): string|undefined => {
    const webhook = storeState.webhook[props.eventRule?.webhook_id]?.data;
    if (!webhook) return undefined;
    return storeState.plugins[webhook.plugin_info.plugin_id]?.icon || '';
};
const handleDeleteEventRule = () => {
    state.modalVisible = true;
};
</script>

<template>
    <p-data-loader class="service-detail-tabs-settings-event-rule-card"
                   :loading="props.loading"
                   :data="props.eventRule"
    >
        <p-card :header="$t('ALERT_MANAGER.EVENT_RULE.TITLE')">
            <template #header>
                <div class="flex items-center justify-between">
                    <span class="font-bold">{{ $t('ALERT_MANAGER.EVENT_RULE.TITLE') }}</span>
                    <div class="flex items-center gap-2">
                        <p-icon-button name="ic_edit"
                                       style-type="transparent"
                        />
                        <p-icon-button name="ic_delete"
                                       style-type="transparent"
                                       @click="handleDeleteEventRule"
                        />
                    </div>
                </div>
            </template>
            <div class="flex flex-col gap-4 py-1 px-4">
                <div class="form-wrapper">
                    <div class="flex flex-col gap-1">
                        <div class="input-form-wrapper">
                            <p-field-title :label="$t('ALERT_MANAGER.EVENT_RULE.LABEL_NAME')"
                                           size="lg"
                                           required
                                           class="field-title"
                            />
                            <p-field-group class="input-form"
                                           required
                            >
                                <span>{{ props.eventRule.name }}</span>
                            </p-field-group>
                        </div>
                        <div class="input-form-wrapper">
                            <p-field-title :label="$t('ALERT_MANAGER.EVENT_RULE.LABEL_SCOPE')"
                                           size="lg"
                                           required
                                           class="field-title"
                            />
                            <p-field-group class="input-form scope">
                                <div class="flex items-center gap-1 text-label-md">
                                    <span class="text-label-lg text-gray-500">{{ $t('ALERT_MANAGER.EVENT_RULE.WEBHOOK_SCOPE') }}: </span>
                                    <p v-if="props.eventRule.scope === EVENT_RULE_SCOPE.GLOBAL"
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
                                        <span>{{ storeState.webhook[props.eventRule.webhook_id]?.label }}</span>
                                    </p>
                                </div>
                            </p-field-group>
                        </div>
                        <p-divider class="divider" />
                    </div>
                </div>
                <div class="form-wrapper">
                    <div v-if="props.eventRule.conditions_policy === EVENT_RULE_CONDITIONS_POLICY.ALWAYS"
                         class="input-form-wrapper"
                    >
                        <p-field-title :label="$t('ALERT_MANAGER.EVENT_RULE.ALWAYS')"
                                       size="lg"
                                       required
                                       class="field-title"
                        />
                        <p-field-group class="input-form"
                                       required
                        >
                            <span class="help-text">{{ $t('ALERT_MANAGER.EVENT_RULE.ALWAYS_HELP_TEXT') }}</span>
                            <span class="text-gray-500 pl-1">({{ $t('ALERT_MANAGER.EVENT_RULE.ALWAYS_DESC') }})</span>
                        </p-field-group>
                    </div>
                    <div v-else
                         class="input-form-wrapper"
                    >
                        <p-field-title :label="props.eventRule.conditions_policy === EVENT_RULE_CONDITIONS_POLICY.ANY
                                           ? $t('ALERT_MANAGER.EVENT_RULE.ANY')
                                           : $t('ALERT_MANAGER.EVENT_RULE.ALL')"
                                       size="lg"
                                       required
                                       class="field-title"
                        />
                        <p-field-group class="input-form"
                                       required
                        >
                            <span class="help-text">{{ $t('ALERT_MANAGER.EVENT_RULE.OF_THE_FOLLOWING_ARE_MET') }}</span>
                        </p-field-group>
                    </div>
                </div>
                <div class="flex items-center justify-center h-6 bg-gray-100 rounded-xl">
                    <p-i name="ic_arrow-down-bold"
                         width="1rem"
                         height="1rem"
                         :color="gray[300]"
                    />
                </div>
                <div class="form-wrapper">
                    <p-field-title :label="$t('ALERT_MANAGER.EVENT_RULE.EXECUTE_ACTIONS')"
                                   size="lg"
                                   required
                                   class="field-title"
                    />
                    <div class="border-section">
                        <div v-for="(type, idx) in Object.keys(state.actions)"
                             :key="`setting-${type}-action-${idx}`"
                        >
                            <div class="settings-section">
                                <p-field-title :label="state.actionSettingType[type]"
                                               size="lg"
                                               required
                                               class="field-title"
                                />
                                <ul v-for="(action, actionIdx) in state.actions[type]"
                                    :key="`action-${actionIdx}`"
                                    class="action-list"
                                >
                                    <li>
                                        <span class="text-label-md text-gray-700">{{ action.label }}</span>
                                        <span class="text-paragraph-md text-blue-800 ml-2">
                                            <span>{{ action.value }}</span>
                                        </span>
                                    </li>
                                </ul>
                            </div>
                            <p-divider v-if="idx !== Object.keys(state.actions).length - 1"
                                       class="divider"
                            />
                        </div>
                        <div v-if="props.eventRule.options">
                            <p-divider class="divider" />
                            <ul class="action-list">
                                <li>
                                    <span class="text-label-md text-gray-700">{{ $t('ALERT_MANAGER.EVENT_RULE.THEN_STOP_PROCESSING') }}</span>
                                    <span class="text-paragraph-md text-blue-800 ml-2">{{ props.eventRule?.options?.stop_processing }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </p-card>
        <service-detail-tabs-settings-event-rule-delete-modal v-if="state.modalVisible"
                                                              :id="props.eventRule.event_rule_id"
                                                              :visible.sync="state.modalVisible"
        />
    </p-data-loader>
</template>

<style scoped>
.service-detail-tabs-settings-event-rule-card {
    .form-wrapper {
        @apply flex flex-col;
        .input-form-wrapper {
            @apply flex items-center gap-2;
            .input-form {
                margin-bottom: 0;
                &:not(.scope) {
                    @apply text-blue-800;
                }
                .scope-wrapper {
                    @apply flex items-center gap-1;
                }
            }
        }
        .field-title {
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
        }
        .border-section {
            @apply flex flex-col gap-2 border-4 border-gray-100 rounded-xl mt-1 py-2 px-4;
            .settings-section {
                @apply flex flex-col;
                .action-list {
                    @apply pt-0.5 pb-0.5;
                    list-style: disc;

                    li {
                        margin-left: 1.5rem;
                    }
                }
            }
        }
        .help-text {
            @apply text-gray-900;
        }
        .divider {
            margin-top: 0.75rem;
        }
    }
}
</style>
