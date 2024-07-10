<script setup lang="ts">
import { reactive } from 'vue';

import {
    PCard, PI, PDivider, PButton,
} from '@spaceone/design-system';

import { NOTIFY_LEVEL, NOTIFY_LEVEL_MAP } from '@/services/cost-explorer/constants/anomaly-detection-constant';

interface Props {
    policyName?: string;
    description?: string;
}

const props = defineProps<Props>();

const state = reactive({
    notifyLevelList: [ // TODO: Remove this dummy data
        { threshold: { upDown: 'increase', value: 5 }, notifyLevel: NOTIFY_LEVEL.INFO },
        { threshold: { upDown: 'increase', value: 10 }, notifyLevel: NOTIFY_LEVEL.MINOR },
        { threshold: { upDown: 'decrease', value: 5 }, notifyLevel: NOTIFY_LEVEL.MODERATE },
        { threshold: { upDown: 'decrease', value: 10 }, notifyLevel: NOTIFY_LEVEL.MAJOR },
        { threshold: { upDown: 'decrease', value: 20 }, notifyLevel: NOTIFY_LEVEL.CRITICAL },
    ],
});

</script>

<template>
    <p-card class="anomaly-detection-policy-rule-card"
            size="md"
    >
        <template #header>
            <div class="header-box">
                <h3 class="header-title">
                    <div class="title-left">
                        <p-i width="1.09375rem"
                             height="1.09375rem"
                             name="ic_main-filled"
                        />{{ props.policyName }}
                    </div>
                    <div class="title-right">
                        <div class="manage-btn">
                            <p-i width="1rem"
                                 height="1rem"
                                 name="ic_duplicate"
                            /> {{ $t('Clone') }}
                        </div>
                        <p-divider vertical
                                   :style="{height: '18px'}"
                        />
                        <div class="manage-btn">
                            <p-i width="1rem"
                                 height="1rem"
                                 name="ic_edit"
                            /> {{ $t('Edit') }}
                        </div>
                    </div>
                </h3>
                <div class="header-body">
                    <p>{{ props.description }}</p>
                </div>
            </div>
        </template>
        <div class="body-container">
            <div class="rule-settings">
                <h3 class="header-wrapper">
                    <span>{{ $t('Rule Settings') }}</span>
                </h3>
                <div class="notify-table">
                    <div class="table-header">
                        <div class="header-item">
                            {{ $t('Threshold') }}
                        </div>
                        <div class="header-item">
                            {{ $t('Notify Level') }}
                        </div>
                    </div>
                    <div class="table-body">
                        <div v-if="!state.notifyLevelList.length"
                             class="empty-case"
                        >
                            <p-button size="sm"
                                      icon-left="ic_plus_bold"
                                      style-type="secondary"
                            >
                                {{ $t('Set Policy') }}
                            </p-button>
                        </div>
                        <div v-for="(item, idx) in state.notifyLevelList"
                             :key="idx"
                             class="table-item-row"
                        >
                            <div class="body-item font-bold text-label-md">
                                {{ item.threshold.upDown === 'increase' ? $t('Increase') : $t('Decrease') }} {{ item.threshold.value }}%
                            </div>
                            <div class="body-item">
                                <p-i width="1rem"
                                     height="1rem"
                                     :color="NOTIFY_LEVEL_MAP[item.notifyLevel].color"
                                     :name="NOTIFY_LEVEL_MAP[item.notifyLevel].icon"
                                /><span class="notify-level-text">{{ NOTIFY_LEVEL_MAP[item.notifyLevel].label }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </p-card>
</template>

<style scoped lang="postcss">
.anomaly-detection-policy-rule-card {

    .header-box {
        @apply flex flex-col;

        .header-title {
            @apply flex gap-2 text-label-lg items-center justify-between;
            padding-bottom: 0.5rem;

            .title-left {
                @apply flex gap-2 items-center font-bold;
            }

            .title-right {
                @apply flex gap-1 items-center;

                .manage-btn {
                    @apply flex gap-1 items-center text-label-md text-gray-700;
                    cursor: pointer;
                }
            }
        }

        .header-body {
            padding: 0.625rem 0 0.5rem 0;

            > p {
                @apply text-label-md text-gray-600;
            }
        }
    }

    .body-container {
        display: flex;
        flex-direction: column;
        margin: 0.25rem 0.125rem;
        gap: 0.75rem;

        .rule-settings {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            .header-wrapper {
                @apply flex gap-2 text-label-lg font-bold;
            }

            .notify-table {
                @apply border border-gray-200 rounded-lg;

                .table-header {
                    @apply text-gray-700 text-label-sm flex mt-4 border-t border-b-2 border-gray-200;

                    .header-item {
                        width: 50%;
                        margin: 0.40625rem 1rem;
                    }
                }

                .table-body {
                    @apply text-gray-900 mb-4;

                    .empty-case {
                        @apply flex items-center justify-center mt-4;
                    }

                    .table-item-row {
                        @apply flex text-gray-900 border-b border-gray-200;

                        .body-item {
                            @apply flex items-center gap-2;
                            width: 50%;
                            margin: 0.67rem 1rem 0.75rem 1rem;
                        }

                        .notify-level-text {
                            font-size: 0.875rem;
                            line-height: 1.3125rem;
                        }
                    }
                }
            }
        }
    }
}
</style>
