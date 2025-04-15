<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { isEmpty } from 'lodash';

import {
    PCard, PFieldTitle, PFieldGroup, PDataLoader, PDivider, PLazyImg, PI, PIconButton, screens,
} from '@cloudforet/mirinae';

import { ALERT_STATUS } from '@/schema/alert-manager/alert/constants';
import type { AlertStatusType } from '@/schema/alert-manager/alert/type';
import {
    EVENT_RULE_CONDITIONS_POLICY,
    EVENT_RULE_SCOPE,
    EVENT_RULE_URGENCY,
} from '@/schema/alert-manager/event-rule/constant';
import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';
import type {
    EventRuleActionsMatchAssetType, EventRuleActionsType,
    EventRuleActionsMergeAssetLabelsType,
} from '@/schema/alert-manager/event-rule/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CloudServiceTypeReferenceMap } from '@/store/reference/cloud-service-type-reference-store';
import type { EscalationPolicyReferenceMap } from '@/store/reference/escalation-policy-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import type { ServiceReferenceMap } from '@/store/reference/service-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import { gray } from '@/styles/colors';

import ServiceDetailTabsSettingsEventRuleDeleteModal
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRuleDeleteModal.vue';
import {
    getActionSettingTypeI18n,
    getActionSettingI18n,
} from '@/services/alert-manager/v2/composables/event-rule-action-data';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { EventRuleActionsItemValueType, EventRuleActionsItemType } from '@/services/alert-manager/v2/types/alert-manager-type';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const { width } = useWindowSize();

const { hasReadWriteAccess } = usePageEditableStatus();

const storeState = reactive({
    webhook: computed<WebhookReferenceMap>(() => allReferenceGetters.webhook),
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
    service: computed<ServiceReferenceMap>(() => allReferenceGetters.service),
    cloudServiceType: computed<CloudServiceTypeReferenceMap>(() => allReferenceGetters.cloudServiceType),
    escalationPolicy: computed<EscalationPolicyReferenceMap>(() => allReferenceGetters.escalationPolicy),
    eventRuleInfo: computed<EventRuleModel>(() => serviceDetailPageState.eventRuleInfo),
    eventRuleInfoLoading: computed<boolean>(() => serviceDetailPageState.eventRuleInfoLoading),
});
const state = reactive({
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
    actionSetting: getActionSettingI18n(),
    actionSettingType: getActionSettingTypeI18n(),
    actions: computed<EventRuleActionsItemType>(() => {
        const result = {} as EventRuleActionsItemType;

        const actionOrder: (keyof EventRuleActionsType)[] = [
            'change_service',
            'match_asset',
            'merge_asset_labels',
            'change_title',
            'change_status',
            'change_urgency',
            'change_escalation_policy',
            'set_labels',
            'add_additional_info',
        ];

        if (storeState.eventRuleInfo.actions) {
            actionOrder.forEach((actionKey) => {
                const actionValue = storeState.eventRuleInfo.actions[actionKey];
                const setting = state.actionSetting[actionKey];

                if (setting && actionValue) {
                    const { type, label, name } = setting;

                    if (!result[type]) {
                        result[type] = [] as EventRuleActionsItemValueType[];
                    }

                    if (actionKey === 'match_asset' && typeof actionValue === 'object') {
                        const matchAssetValue = actionValue as EventRuleActionsMatchAssetType;
                        if (matchAssetValue.asset_types) {
                            result[type].push({
                                label: i18n.t('ALERT_MANAGER.EVENT_RULE.ASSET_TYPE'),
                                name: 'asset_types',
                                value: matchAssetValue.asset_types.map((i) => (storeState.cloudServiceType[i] ? storeState.cloudServiceType[i].label : i)).join(', '),
                            });
                        }
                        if (matchAssetValue.key) {
                            result[type].push({
                                label: i18n.t('ALERT_MANAGER.EVENT_RULE.POLICY'),
                                name: 'key',
                                value: matchAssetValue.key,
                            });
                        }
                        result[type].push({
                            label: i18n.t('ALERT_MANAGER.EVENT_RULE.TEMP_ASSET'),
                            name: 'create_temporary_asset',
                            value: matchAssetValue.create_temporary_asset ? i18n.t('ALERT_MANAGER.CREATE') : i18n.t('ALERT_MANAGER.EVENT_RULE.DO_NOT_CREATE'),
                        });
                    } else if (actionKey === 'merge_asset_labels' && typeof actionValue === 'object') {
                        const matchAssetValue = actionValue as EventRuleActionsMergeAssetLabelsType;
                        if (matchAssetValue.period) {
                            result[type].push({
                                label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_PERIOD'),
                                name: 'merge_asset_labels',
                                value: matchAssetValue.period,
                            });
                        }
                    } else if (actionKey === 'add_additional_info') {
                        result[type].push({
                            label: i18n.t('ALERT_MANAGER.ALERTS.ADDITIONAL_INFO'),
                            name: 'add_additional_info',
                            value: actionValue,
                        });
                    } else {
                        result[type].push({
                            label,
                            name,
                            value: actionValue,
                        });
                    }
                }
            });
        }

        return result;
    }),
    modalVisible: false,
});

const formatState = (value: AlertStatusType): TranslateResult => {
    switch (value) {
    case ALERT_STATUS.TRIGGERED: return i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED');
    case ALERT_STATUS.ACKNOWLEDGED: return i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED');
    case ALERT_STATUS.IGNORED: return i18n.t('ALERT_MANAGER.ALERTS.IGNORED');
    case ALERT_STATUS.RESOLVED: return i18n.t('ALERT_MANAGER.ALERTS.RESOLVED');
    default: return '';
    }
};
const formatOperator = (value: string): TranslateResult => {
    switch (value) {
    case 'contain': return i18n.t('ALERT_MANAGER.EVENT_RULE.CONTAINS');
    case 'not_contain': return i18n.t('ALERT_MANAGER.EVENT_RULE.DOES_NOT_CONTAIN');
    case 'eq': return i18n.t('ALERT_MANAGER.EVENT_RULE.EQUALS');
    case 'not': return i18n.t('ALERT_MANAGER.EVENT_RULE.DOES_NOT_EQUAL');
    case 'size_gte': return i18n.t('ALERT_MANAGER.EVENT_RULE.AT_LEAST');
    case 'size_lte': return i18n.t('ALERT_MANAGER.EVENT_RULE.LESS_THAN_EQUAL');
    default: return '';
    }
};
const getWebhookIcon = (): string|undefined => {
    const webhook = storeState.webhook[storeState.eventRuleInfo?.webhook_id]?.data;
    if (!webhook) return undefined;
    return storeState.plugins[webhook.plugin_info.plugin_id]?.icon || '';
};

const handleEditEventRule = () => {
    serviceDetailPageStore.setShowEventRuleFormCard(true);
    serviceDetailPageStore.setIsEventRuleEditMode(true);
};
const handleDeleteEventRule = () => {
    state.modalVisible = true;
};
</script>

<template>
    <p-data-loader class="service-detail-tabs-settings-event-rule-card"
                   :loading="storeState.eventRuleInfoLoading"
                   :data="storeState.eventRuleInfo"
                   :class="{ 'is-mobile': state.isMobileSize }"
    >
        <p-card :header="$t('ALERT_MANAGER.EVENT_RULE.TITLE')">
            <template #header>
                <div class="flex items-center justify-between">
                    <span class="font-bold">{{ $t('ALERT_MANAGER.EVENT_RULE.TITLE') }}</span>
                    <div v-if="hasReadWriteAccess"
                         class="flex items-center gap-2"
                    >
                        <p-icon-button name="ic_edit-text"
                                       style-type="transparent"
                                       @click="handleEditEventRule"
                        />
                        <p-icon-button name="ic_delete"
                                       style-type="transparent"
                                       @click="handleDeleteEventRule"
                        />
                    </div>
                </div>
            </template>
            <div class="form">
                <div class="form-wrapper">
                    <div class="form-wrapper-inside">
                        <div class="input-form-wrapper">
                            <p-field-title :label="$t('ALERT_MANAGER.EVENT_RULE.LABEL_NAME')"
                                           size="lg"
                                           required
                                           class="field-title"
                            />
                            <p-field-group class="input-form"
                                           required
                            >
                                <span>{{ storeState.eventRuleInfo.name }}</span>
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
                                    <span class="text-label-lg text-gray-500">
                                        {{ storeState.eventRuleInfo.scope === EVENT_RULE_SCOPE.GLOBAL ? $t('ALERT_MANAGER.EVENT_RULE.GLOBAL_SCOPE') : $t('ALERT_MANAGER.EVENT_RULE.WEBHOOK_SCOPE') }}
                                    </span>
                                    <p v-if="storeState.eventRuleInfo.scope !== EVENT_RULE_SCOPE.GLOBAL"
                                       class="scope-wrapper"
                                    >
                                        <p-lazy-img :src="getWebhookIcon()"
                                                    error-icon="ic_webhook"
                                                    width="1rem"
                                                    height="1rem"
                                                    class="icon"
                                        />
                                        <span>: {{ storeState.webhook[storeState.eventRuleInfo.webhook_id]?.label }}</span>
                                    </p>
                                </div>
                            </p-field-group>
                        </div>
                        <p-divider class="divider" />
                    </div>
                </div>
                <div class="form-wrapper">
                    <div v-if="storeState.eventRuleInfo.conditions_policy === EVENT_RULE_CONDITIONS_POLICY.ALWAYS"
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
                         class="flex flex-col gap-1"
                    >
                        <div class="input-form-wrapper">
                            <p-field-title :label="storeState.eventRuleInfo.conditions_policy === EVENT_RULE_CONDITIONS_POLICY.ANY
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
                        <div class="border-section">
                            <div v-for="(condition, idx) in storeState.eventRuleInfo.conditions"
                                 :key="`action-${idx}`"
                                 class="condition-list"
                            >
                                <div class="dot">
                                    <p-i name="ic_dot"
                                         width="0.25rem"
                                         height="0.25rem"
                                         color="inherit"
                                    />
                                </div>
                                <p class="flex gap-1 text-paragraph-md text-gray-700">
                                    <span class="text-blue-800">{{ condition.key }}</span>
                                    <span>{{ formatOperator(condition.operator) }}</span>
                                    <span class="text-blue-800">{{ condition.value }}</span>
                                </p>
                            </div>
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
                <div class="form-wrapper">
                    <p-field-title :label="$t('ALERT_MANAGER.EVENT_RULE.EXECUTE_ACTIONS')"
                                   size="lg"
                                   required
                                   class="field-title"
                    />
                    <div class="border-section">
                        <div v-for="(type, idx) in Object.keys(state.actions)"
                             :key="`setting-${type}-action-${idx}`"
                             class="settings-wrapper"
                        >
                            <div class="settings-section">
                                <p-field-title :label="state.actionSettingType[type]"
                                               size="lg"
                                               required
                                               class="field-title"
                                />
                                <div v-for="(action, actionIdx) in state.actions[type]"
                                     :key="`action-${actionIdx}`"
                                     class="action-list"
                                >
                                    <div class="action">
                                        <div class="dot">
                                            <p-i name="ic_dot"
                                                 width="0.25rem"
                                                 height="0.25rem"
                                                 color="inherit"
                                            />
                                        </div>
                                        <span class="text-label-md text-gray-700">{{ action.label }}</span>
                                    </div>
                                    <p>
                                        <span class="action-paragraph">
                                            <template v-if="action.name === 'change_service'">
                                                {{ storeState.service[action.value]?.label || action.value }}
                                            </template>
                                            <template v-else-if="action.name === 'key'">
                                                <span>{{ action.value || '--' }}</span>
                                            </template>
                                            <template v-else-if="action.name === 'change_urgency'">
                                                {{ action.value === EVENT_RULE_URGENCY.HIGH ? $t('ALERT_MANAGER.EVENT_RULE.HIGH') : $t('ALERT_MANAGER.EVENT_RULE.LOW') }}
                                            </template>
                                            <template v-else-if="action.name === 'change_status'">
                                                {{ formatState(action.value) }}
                                            </template>
                                            <template v-else-if="action.name === 'change_escalation_policy'">
                                                {{ storeState.escalationPolicy[action.value]?.label || action.value }}
                                            </template>
                                            <template v-else-if="action.name === 'set_labels'">
                                                {{ action.value.join(', ') }}
                                            </template>
                                            <template v-else-if="action.name === 'add_additional_info'">
                                                <span v-for="([key, value], infoIdx) in Object.entries(action.value)"
                                                      :key="`additional-info-${key}`"
                                                >
                                                    <span class="font-bold">{{ key }}: </span>
                                                    <span>{{ value }}</span>
                                                    <span v-if="infoIdx < Object.entries(action.value).length - 1">, </span>
                                                </span>
                                            </template>
                                            <template v-else>
                                                {{ action.value }}
                                            </template>
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <p-divider v-if="idx !== Object.keys(state.actions).length - 1"
                                       class="divider"
                            />
                        </div>
                        <div v-if="storeState.eventRuleInfo.options">
                            <p-divider v-if="!isEmpty(state.actions)"
                                       class="divider option"
                            />
                            <div class="action-list">
                                <div class="action">
                                    <div class="dot">
                                        <p-i name="ic_dot"
                                             width="0.25rem"
                                             height="0.25rem"
                                             color="inherit"
                                        />
                                    </div>
                                    <span class="text-label-md text-gray-700">{{ $t('ALERT_MANAGER.EVENT_RULE.THEN_STOP_PROCESSING') }}</span>
                                </div>
                                <p class="text-paragraph-md text-blue-800 ml-2">
                                    {{ storeState.eventRuleInfo?.options?.stop_processing ? $t('ALERT_MANAGER.EVENT_RULE.TRUE') : $t('ALERT_MANAGER.EVENT_RULE.FALSE') }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </p-card>
        <service-detail-tabs-settings-event-rule-delete-modal v-if="state.modalVisible"
                                                              :visible.sync="state.modalVisible"
        />
    </p-data-loader>
</template>

<style scoped>
.service-detail-tabs-settings-event-rule-card {
    .form {
        @apply flex flex-col gap-4 py-1 px-4;
        .form-wrapper {
            @apply flex flex-col gap-1;
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
                @apply flex flex-col border-4 border-gray-100 rounded-xl mt-1 py-2 px-4;
                .condition-list {
                    @apply flex flex-row gap-3;
                }
                .settings-wrapper {
                    .settings-section {
                        @apply flex flex-col;
                    }
                    & + .settings-wrapper {
                        margin-top: 0.5rem;
                    }
                }
            }
            .help-text {
                @apply text-gray-900;
            }
            .divider {
                margin-top: 0.5rem;
                &.option {
                    margin-bottom: 0.5rem;
                }
            }

            .action-list {
                @apply flex pt-0.5 pb-0.5 gap-1 items-center;
                .dot {
                    @apply flex items-center justify-center;
                    width: 1.5rem;
                    height: 1.5rem;
                }
                .action {
                    @apply flex items-center;
                }
                p {
                    .action-paragraph {
                        @apply text-paragraph-md text-blue-800 ml-2;
                    }
                }
            }
        }
    }
    &.is-mobile {
        @apply flex flex-col;
        .form {
            @apply flex flex-col gap-4 py-1 px-4;
            .form-wrapper {
                @apply flex flex-col;
                .form-wrapper-inside {
                    @apply flex flex-col gap-4;
                    .input-form-wrapper {
                        @apply flex flex-col items-start gap-2;
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
                }
                .border-section {
                    .condition-list {
                        @apply flex flex-row;
                    }
                }
                .action-list {
                    @apply flex flex-col items-start;
                    .action {
                        @apply flex items-center;
                    }
                    p {
                        @apply ml-6;
                        .action-paragraph {
                            @apply ml-0;
                        }
                    }
                }
            }
        }
    }
}

/* custom design-system component - p-field-group */
:deep(.p-card > header) {
    @apply bg-gray-200;
}
</style>
