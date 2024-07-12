<script lang="ts" setup>
import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import {
    PPaneLayout, PToggleButton, PFieldTitle, PTextInput, PSelectDropdown, PI, PButton, PIconButton,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { NOTIFY_LEVEL_MAP } from '@/services/cost-explorer/constants/anomaly-detection-constant';
import type { NotificationRule } from '@/services/cost-explorer/types/anomaly-detection-type';

const state = reactive<{
    statusToggle: boolean;
    notificationRules:Partial<NotificationRule>[];
    unitMenu: ComputedRef<MenuItem[]>;
    variationMenu: ComputedRef<MenuItem[]>;
    notifyLevelMenu: ComputedRef<MenuItem[]>;
    recipients: boolean;
        }>({
            statusToggle: false,
            notificationRules: [
                {
                    threshold: 5,
                    unit: 'PERCENTAGE',
                    variation: ['gte'],
                    notifyLevel: 'INFO',
                },
                {
                    threshold: 10,
                    unit: 'PERCENTAGE',
                    variation: ['gte'],
                    notifyLevel: 'MINOR',
                },
                {
                    threshold: 5,
                    unit: 'PERCENTAGE',
                    variation: ['gte'],
                    notifyLevel: 'MODERATE',
                },
                {
                    threshold: 10,
                    unit: 'PERCENTAGE',
                    variation: ['gte'],
                    notifyLevel: 'MAJOR',
                },
                {
                    threshold: 20,
                    unit: 'PERCENTAGE',
                    variation: ['gte'],
                    notifyLevel: 'CRITICAL',
                },
            ],
            unitMenu: computed(() => [
                { label: 'Percentage (%)', name: 'PERCENTAGE' },
                { label: 'Fixed Amount', name: 'CURRENCY' },
            ]),
            variationMenu: computed(() => [
                { label: 'All', name: JSON.stringify(['gte', 'lte']) },
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

const handleUpdateNotificationRules = (key: keyof NotificationRule, value: NotificationRule[keyof NotificationRule], index: number) => {
    const clonedNotificationRules = cloneDeep(state.notificationRules);
    clonedNotificationRules[index] = {
        ...clonedNotificationRules[index],
        [key]: value,
    };
    state.notificationRules = clonedNotificationRules;
};

const handleAddNotificationRule = () => {
    state.notificationRules = cloneDeep(state.notificationRules).concat({ variation: ['gte', 'lte'] });
};

const handleDeleteRule = (index:number) => {
    state.notificationRules = cloneDeep(state.notificationRules).filter((_, i) => i !== index);
};

</script>

<template>
    <p-pane-layout class="admin-domain-settings-anomaly-detection-configuration-page">
        <div class="content-wrapper">
            <div class="toggle-wrapper">
                <p-toggle-button :value.sync="state.statusToggle"
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
                <div class="cost-wrapper notification-rules-wrapper"
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
                                          block
                                          @update:value="handleUpdateNotificationRules('threshold', $event, index)"
                            />
                            <p-select-dropdown :selected="rule.unit"
                                               :menu="state.unitMenu"
                                               :placeholder="$t('COST_EXPLORER.ANOMALY_DETECTION.NOTIFICATION_RULES.SELECT_UNIT')"
                                               block
                                               use-fixed-menu-style
                                               @select="handleUpdateNotificationRules('unit', $event, index)"
                            />
                            <p-select-dropdown :selected="JSON.stringify(rule.variation)"
                                               :menu="state.variationMenu"
                                               block
                                               use-fixed-menu-style
                                               @select="handleUpdateNotificationRules('variation', $event, index)"
                            />
                            <p-select-dropdown :selected="rule.notifyLevel"
                                               :menu="state.notifyLevelMenu"
                                               use-fixed-menu-style
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
                                           @click="handleDeleteRule(index)"
                            />
                        </div>
                        <p-button icon-left="ic_plus"
                                  class="add-btn"
                                  style-type="secondary"
                                  @click="handleAddNotificationRule"
                        >
                            {{ $t('COMMON.BUTTONS.ADD') }}
                        </p-button>
                    </div>
                </div>
            </div>
            <div class="cost-wrapper"
                 :class="{ disabled: !state.statusToggle }"
            >
                <p-field-title size="lg"
                               :label="$t('IAM.DOMAIN_SETTINGS.RECIPIENTS')"
                />
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

        .notification-rules-wrapper {
            min-width: 38.25rem;
        }
        .cost-wrapper {
            @apply relative flex flex-col text-label-md border border-gray-200;
            padding: 1.5rem;
            gap: 1.5rem;
            border-radius: 0.375rem;

            .notification-rules-container {
                @apply flex flex-col;

                .disabled-layer {
                    @apply absolute inset-0 bg-gray-150 rounded-lg;
                    opacity: 0.45;
                    z-index: 10;

                    &:hover {
                        cursor: not-allowed;
                    }
                }

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
    }
}
</style>
