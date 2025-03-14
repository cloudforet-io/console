<script lang="ts" setup>
import type { ComputedRef } from 'vue';
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PPaneLayout, PToggleButton, PFieldTitle, PTextInput, PSelectDropdown, PI, PButton, PIconButton, PCheckbox, PLazyImg,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { DomainConfigGetParameters } from '@/api-clients/config/domain-config/schema/api-verbs/get';
import type { DomainConfigSetParameters } from '@/api-clients/config/domain-config/schema/api-verbs/set';
import { DOMAIN_CONFIG_NAMES } from '@/api-clients/config/domain-config/schema/constant';
import type { DomainConfigModel } from '@/api-clients/config/domain-config/schema/model';
import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';


import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import { NOTIFY_LEVEL_MAP } from '@/services/cost-explorer/constants/anomaly-detection-constant';
import type {
    NotificationRule,
    NotificationUnit,
    NotificationVariation,
    NotifyLevel,
} from '@/services/cost-explorer/types/anomaly-detection-type';

interface State {
    statusToggle: boolean;
    notificationRules:Partial<NotificationRule>[];
    unitMenu: ComputedRef<MenuItem[]>;
    variationMenu: ComputedRef<MenuItem[]>;
    notifyLevelMenu: ComputedRef<MenuItem[]>;
    recipients: boolean;
    hasReadWriteAccess?: ComputedRef<boolean|undefined>;
}

const ALL_VALUE: NotificationVariation[] = ['gte', 'lte'];

const { hasReadWriteAccess } = usePageEditableStatus();

const state = reactive<State>({
    statusToggle: false,
    notificationRules: [{ variation: ALL_VALUE }],
    unitMenu: computed(() => [
        { label: 'Percentage (%)', name: 'PERCENTAGE' },
        { label: 'Fixed Amount', name: 'FIXED_AMOUNT' },
    ]),
    variationMenu: computed(() => [
        { label: 'All', name: 'all' },
        { label: 'Increase (>=)', name: JSON.stringify(['gte']) },
        { label: 'Decrease (<=)', name: JSON.stringify(['lte']) },
    ]),
    notifyLevelMenu: computed(() => Object.values(NOTIFY_LEVEL_MAP).map((level) => ({
        label: level.label,
        name: level.name,
        icon: level.icon,
        iconColor: level.color,
    }))),
    recipients: false,
});


const handleUpdateNotificationRules = (key: keyof NotificationRule, value: NotificationRule[keyof NotificationRule]|'all', index: number) => {
    const clonedNotificationRules = cloneDeep(state.notificationRules);
    if (key === 'variation') {
        clonedNotificationRules[index] = {
            ...clonedNotificationRules[index],
            variation: value === 'all' ? ALL_VALUE : JSON.parse(value as string),
        };
    } else {
        clonedNotificationRules[index] = {
            ...clonedNotificationRules[index],
            [key]: value,
        };
    }
    state.notificationRules = clonedNotificationRules;
};

const handleAddNotificationRule = () => {
    state.notificationRules = cloneDeep(state.notificationRules).concat({ variation: ALL_VALUE });
};

const handleDeleteRule = (index:number) => {
    state.notificationRules = cloneDeep(state.notificationRules).filter((_, i) => i !== index);
};


interface NotificationRuleConfig {
    threshold: number;
    unit_type: NotificationUnit;
    variations: NotificationVariation[];
    severity: NotifyLevel;
}
interface AnomalyDetectionConfig {
    enabled: boolean;
    notification_rules: NotificationRuleConfig[];
    recipients?: {
        role_types: string[];
    };
}

const fetchConfig = async ():Promise<AnomalyDetectionConfig|undefined> => {
    try {
        const data = await SpaceConnector.clientV2.config.domainConfig.get<DomainConfigGetParameters, DomainConfigModel<AnomalyDetectionConfig>>({
            name: DOMAIN_CONFIG_NAMES.ANOMALY_DETECTION_CONFIGURATION,
        });
        return data.data;
    } catch (e) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};
const filterNotificationRulesAndRemovedUnSelectedItem = (notificationRules: Partial<NotificationRule>[]):NotificationRuleConfig[] => notificationRules.map((rule) => ({
    threshold: rule.threshold,
    unit_type: rule.unit,
    variations: rule.variation,
    severity: rule.notifyLevel,
})).filter((r): r is NotificationRuleConfig => r.threshold !== undefined && r.unit_type !== undefined && r.variations !== undefined && r.severity !== undefined);

const setConfig = async () => {
    const params: DomainConfigSetParameters<AnomalyDetectionConfig> = {
        name: DOMAIN_CONFIG_NAMES.ANOMALY_DETECTION_CONFIGURATION,
        data: {
            enabled: state.statusToggle,
            notification_rules: filterNotificationRulesAndRemovedUnSelectedItem(state.notificationRules),
            recipients: { role_types: state.recipients ? ['WORKSPACE_OWNER'] : [] },
        },
    };
    try {
        await SpaceConnector.clientV2.config.domainConfig.set<DomainConfigSetParameters<AnomalyDetectionConfig>, DomainConfigModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

watch([() => state.statusToggle, () => state.notificationRules, () => state.recipients], async () => {
    await setConfig();
});

onMounted(async () => {
    const savedConfig = await fetchConfig();
    if (savedConfig) {
        state.statusToggle = savedConfig.enabled;
        state.notificationRules = savedConfig.notification_rules.map((rule) => ({
            threshold: rule.threshold,
            unit: rule.unit_type,
            variation: rule.variations,
            notifyLevel: rule.severity,
        }));
        if (!state.notificationRules.length) {
            state.notificationRules = [{ variation: ALL_VALUE }];
        }
        state.recipients = savedConfig.recipients?.role_types.includes('WORKSPACE_OWNER') ?? false;
    }
});

</script>

<template>
    <p-pane-layout class="admin-domain-settings-anomaly-detection-configuration-page">
        <div class="content-wrapper">
            <div class="toggle-wrapper">
                <p-toggle-button :value.sync="state.statusToggle"
                                 :disabled="!hasReadWriteAccess"
                                 class="toggle-button"
                />
                <div class="toggle-text">
                    <strong class="title">{{ $t('IAM.DOMAIN_SETTINGS.ANOMALY_DETECTION_CONF_TOGGLE_TITLE') }}</strong>
                    <p>
                        <span class="text-paragraph-md text-gray-600">{{ $t('IAM.DOMAIN_SETTINGS.ANOMALY_DETECTION_CONF_TOGGLE_DESC1') }}</span>
                        <span class="font-medium"> {{ $t('IAM.DOMAIN_SETTINGS.ANOMALY_DETECTION_CONF_TOGGLE_DESC2') }}</span>
                    </p>
                </div>
            </div>
            <div class="overflow-wrapper">
                <div class="notification-rules section-wrapper"
                     :class="{ disabled: !state.statusToggle }"
                >
                    <p-field-title size="lg"
                                   :label="$t('IAM.DOMAIN_SETTINGS.NOTIFICATION_RULES')"
                    />
                    <div class="notification-rules-container">
                        <div v-if="!state.statusToggle"
                             class="disabled-layer"
                        />
                        <div class="notification-rules-header notification-align">
                            <th>{{ $t('COST_EXPLORER.ANOMALY_DETECTION.NOTIFICATION_RULES.THRESHOLD') }}</th>
                            <th>{{ $t('COST_EXPLORER.ANOMALY_DETECTION.NOTIFICATION_RULES.UNIT') }}</th>
                            <th>{{ $t('COST_EXPLORER.ANOMALY_DETECTION.NOTIFICATION_RULES.VARIATION') }}</th>
                            <th>{{ $t('COST_EXPLORER.ANOMALY_DETECTION.NOTIFICATION_RULES.NOTIFY_LEVEL') }}</th>
                        </div>
                        <div v-for="(rule, index) in state.notificationRules"
                             :key="index"
                             class="notification-align notification-rules-content"
                        >
                            <p-text-input :value="rule.threshold"
                                          :placeholder="$t('COST_EXPLORER.ANOMALY_DETECTION.NOTIFICATION_RULES.AMOUNT')"
                                          :disabled="!hasReadWriteAccess"
                                          block
                                          @update:value="handleUpdateNotificationRules('threshold', $event, index)"
                            />
                            <p-select-dropdown :selected="rule.unit"
                                               :menu="state.unitMenu"
                                               :placeholder="$t('COST_EXPLORER.ANOMALY_DETECTION.NOTIFICATION_RULES.SELECT_UNIT')"
                                               :disabled="!hasReadWriteAccess"
                                               block
                                               use-fixed-menu-style
                                               @select="handleUpdateNotificationRules('unit', $event, index)"
                            />
                            <p-select-dropdown :selected="rule.variation.length === 2 ? 'all': JSON.stringify(rule.variation)"
                                               :disabled="!hasReadWriteAccess"
                                               :menu="state.variationMenu"
                                               block
                                               use-fixed-menu-style
                                               @select="handleUpdateNotificationRules('variation', $event, index)"
                            />
                            <p-select-dropdown :selected="rule.notifyLevel"
                                               :menu="state.notifyLevelMenu"
                                               use-fixed-menu-style
                                               :disabled="!hasReadWriteAccess"
                                               block
                                               @select="handleUpdateNotificationRules('notifyLevel', $event, index)"
                            >
                                <template #dropdown-button>
                                    <span>
                                        <span v-if="rule.notifyLevel"
                                              class="selected-urgency"
                                        >
                                            <p-i :name="NOTIFY_LEVEL_MAP[rule.notifyLevel]?.icon"
                                                 width="1em"
                                                 height="1em"
                                                 class="mr-2"
                                                 :color="NOTIFY_LEVEL_MAP[rule.notifyLevel]?.color"
                                            />
                                            <span>{{ NOTIFY_LEVEL_MAP[rule.notifyLevel]?.label }}</span>
                                        </span>
                                        <span v-else
                                              class="text-gray-600"
                                        >{{ $t('COST_EXPLORER.ANOMALY_DETECTION.NOTIFICATION_RULES.SELECT_LEVEL') }}</span>
                                    </span>
                                </template>
                            </p-select-dropdown>
                            <p-icon-button name="ic_delete"
                                           size="sm"
                                           class="self-center"
                                           :disabled="!hasReadWriteAccess"
                                           @click="handleDeleteRule(index)"
                            />
                        </div>
                        <p-button icon-left="ic_plus"
                                  class="add-btn"
                                  style-type="secondary"
                                  :disabled="!hasReadWriteAccess"
                                  @click="handleAddNotificationRule"
                        >
                            {{ $t('COMMON.BUTTONS.ADD') }}
                        </p-button>
                    </div>
                </div>
            </div>
            <div class="recipients section-wrapper"
                 :class="{ disabled: !state.statusToggle }"
            >
                <div v-if="!state.statusToggle"
                     class="disabled-layer"
                />
                <div class="recipient-header">
                    <p-field-title size="lg"
                                   class="mb-1"
                                   :label="$t('IAM.DOMAIN_SETTINGS.RECIPIENTS')"
                    />
                    <p class="recipients-desc">
                        {{ $t('IAM.DOMAIN_SETTINGS.ANOMALY_DETECTION_CONF_RECIPIENTS_DESC') }}
                    </p>
                </div>
                <div class="check-role">
                    <p-checkbox v-model="state.recipients"
                                :disabled="!hasReadWriteAccess"
                    /><span class="owner-img"><p-lazy-img :src="WorkspaceOwnerImage"
                                                          width="1.25rem"
                                                          height="1.25rem"
                    /></span><span class="owner-text">Workspace Owner Role</span>
                </div>
            </div>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.admin-domain-settings-anomaly-detection-configuration-page {
    .content-wrapper {
        @apply flex flex-col;
        gap: 1.5rem;
        padding: 1.5rem 1rem;

        .toggle-wrapper {
            @apply flex items-start;
            gap: 1rem;
            .toggle-button {
                padding-top: 0.25rem;
            }
            .toggle-text {
                @apply flex flex-col text-paragraph-md;
                .title {
                    @apply text-label-lg;
                }
            }
        }
        .overflow-wrapper {
            overflow-x: auto;
        }

        .disabled-layer {
            @apply absolute inset-0 bg-gray-150 rounded-lg;
            opacity: 0.45;
            z-index: 10;

            &:hover {
                cursor: not-allowed;
            }
        }

        .section-wrapper {
            @apply relative flex flex-col text-label-md border border-gray-200;
            padding: 1.5rem;
            gap: 1.5rem;
            border-radius: 0.375rem;
        }

        .notification-rules {
            min-width: 38.25rem;
            .notification-rules-container {
                @apply flex flex-col;

                .notification-align {
                    @apply grid gap-3;
                    grid-template-columns: 1fr 1fr 1fr 1fr 1.5rem;
                    text-align: left;
                }

                .notification-rules-header {
                    @apply text-label-md font-bold text-gray-600 mb-1;
                }

                .notification-rules-content {
                    @apply mb-4;
                }

                .add-btn {
                    width: 6rem;
                }
            }
        }

        .recipients {
            @apply relative flex flex-col text-label-md border border-gray-200;

            .recipients-desc {
                @apply text-paragraph-md text-gray-900;
            }

            .check-role {
                @apply flex gap-1 items-center;

                .owner-img {
                    @apply rounded-full;
                    overflow: hidden;
                    display: inline-block;
                    height: 1.25rem;
                    width: 1.25rem;
                }

                .owner-text {
                    @apply text-label-md text-gray-900;
                }
            }
        }
    }
}
</style>
