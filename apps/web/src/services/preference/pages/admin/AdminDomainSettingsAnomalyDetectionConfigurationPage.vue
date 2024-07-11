<script lang="ts" setup>
import { reactive } from 'vue';

import {
    PPaneLayout, PToggleButton, PFieldTitle,
} from '@spaceone/design-system';

const state = reactive({
    statusToggle: false,
    notificationRules: [],
});

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
            <div class="cost-wrapper"
                 :class="{ disabled: !state.statusToggle }"
            >
                <p-field-title size="lg"
                               :label="$t('IAM.DOMAIN_SETTINGS.NOTIFICATION_RULES')"
                />
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
        .cost-wrapper {
            @apply relative flex flex-col text-label-md border border-gray-200;
            padding: 1.5rem;
            gap: 1.5rem;
            border-radius: 0.375rem;
            .cost-report-button {
                @apply absolute;
                top: 1.5rem;
                right: 1.5rem;
            }
            .icon {
                margin-top: -0.25rem;
            }

            &.disabled {
                @apply bg-gray-100;

                /* custom design-system component - p-field-group */
                :deep(.p-field-group) {
                    .title-wrapper {
                        .title {
                            @apply text-gray-600;
                        }
                    }
                }
                .tooltip, .cost-input {
                    @apply cursor-not-allowed;
                }
            }
        }
    }
}
</style>
