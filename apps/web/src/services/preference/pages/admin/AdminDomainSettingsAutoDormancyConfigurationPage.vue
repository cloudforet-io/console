<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PPaneLayout, PDivider, PTextButton, PCheckbox, PToggleButton, PFieldGroup, PTextInput, PButton, PTooltip, PI,
} from '@spaceone/design-system';

import { i18n as _i18n } from '@/translations';

import { useDomainSettingsStore } from '@/store/domain-settings/domain-settings-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import type { DormancyConfig } from '@/services/preference/types/domain-settings-type';

const domainConfigStore = useDomainSettingsStore();
const domainConfigGetters = domainConfigStore.getters;

const storeState = reactive({
    dormancyConfig: computed<DormancyConfig|undefined>((() => domainConfigGetters.dormancyConfig)),
});
const state = reactive({
    isChanged: computed<boolean>(() => {
        if ([cost.value, storeState.dormancyConfig].every((d) => !d)) return false;
        return (cost.value !== storeState.dormancyConfig?.cost.toString())
            || (state.checkbox !== storeState.dormancyConfig?.send_email);
    }),
    statusToggle: false,
    toggleText: computed<string>(() => (state.statusToggle
        ? 'IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_TOGGLE_ENABLED'
        : 'IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_TOGGLE_DISABLED'
    )),
    checkbox: false,
    attributes: { type: 'number' },
});

const {
    forms: { cost },
    invalidState,
    invalidTexts,
    setForm,
    initForm,
    isAllValid,
} = useFormValidator({
    cost: '',
}, {
    cost: (val: string) => {
        if (state.statusToggle && !val.trim()) return _i18n.t('IAM.DOMAIN_SETTINGS.ALT_E_EMPTY_COST');
        return true;
    },
});

const handleChangeToggleButton = async (value: boolean) => {
    if (value) return;
    try {
        await domainConfigStore.updateDomainSettings({
            dormancy_config: {
                enabled: false,
                cost: storeState.dormancyConfig?.cost || 0,
                send_email: storeState.dormancyConfig?.send_email || false,
            },
        });
        await domainConfigStore.fetchDomainSettings();
        showSuccessMessage(_i18n.t('IAM.DOMAIN_SETTINGS.ALT_S_DORMANCY_TOGGLE'), '');
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const handleSaveConfig = async () => {
    try {
        await domainConfigStore.updateDomainSettings({
            dormancy_config: {
                enabled: true,
                cost: Number(cost.value),
                send_email: state.checkbox,
            },
        });
        showSuccessMessage(_i18n.t('IAM.DOMAIN_SETTINGS.ALT_S_UPDATE_DORMANCY'), '');
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

watch(() => domainConfigGetters.dormancyConfig, (config) => {
    state.statusToggle = config?.enabled || false;
    state.checkbox = config?.send_email || false;
    setForm('cost', config?.cost?.toString() || '');
}, { immediate: true });

onMounted(() => {
    initForm();
});
</script>

<template>
    <p-pane-layout class="admin-domain-settings-auto-dormancy-configuration-page">
        <div class="content-wrapper">
            <div class="toggle-wrapper">
                <p-toggle-button :value.sync="state.statusToggle"
                                 class="toggle-button"
                                 @change-toggle="handleChangeToggleButton"
                />
                <p class="toggle-text">
                    <strong class="title">{{ $t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_TOGGLE') }}</strong>
                    <i18n class="toggle-text-desc"
                          :path="state.toggleText"
                    >
                        <template #emphasis>
                            <span v-if="state.statusToggle"
                                  class="emphasis"
                            >
                                {{ $t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_TOGGLE_ENABLED_EMPHASIS') }}
                            </span>
                            <span v-else
                                  class="emphasis"
                            >
                                {{ $t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_TOGGLE_DISABLED_EMPHASIS') }}
                            </span>
                        </template>
                    </i18n>
                </p>
            </div>
            <div class="cost-wrapper"
                 :class="{ disabled: !state.statusToggle }"
            >
                <img alt="cost-threshold-chart"
                     src="/images/domain-settings/img_auto-dormancy-configuration_cost-threshold-chart.png"
                     srcset="/images/domain-settings/img_auto-dormancy-configuration_cost-threshold-chart@2x.png 2x,
                        /images/domain-settings/img_auto-dormancy-configuration_cost-threshold-chart@3x.png 3x"
                     class="cost-threshold-chart"
                >
                <div class="cost-content-wrapper">
                    <p-field-group :label="$t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_COST_THRESHOLD')"
                                   :invalid-text="invalidTexts.cost"
                                   :invalid="invalidState.cost"
                                   required
                    >
                        <template #label-extra>
                            <p-tooltip :contents="!state.statusToggle ? '' : $t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_COST_THRESHOLD_DESC')"
                                       position="top-start"
                                       class="tooltip"
                            >
                                <p-i width="1rem"
                                     height="1rem"
                                     name="ic_info-circle"
                                     class="icon"
                                />
                            </p-tooltip>
                        </template>
                        <template #default="{invalid}">
                            <div class="cost-input">
                                <p-text-input :value="cost"
                                              :invalid="invalid"
                                              :disabled="!state.statusToggle"
                                              type="number"
                                              masking-mode
                                              class="cost-input"
                                              @update:value="setForm('cost', $event)"
                                />
                                <span class="placeholder">$ USD</span>
                            </div>
                        </template>
                    </p-field-group>
                    <p-divider />
                    <p-checkbox v-model="state.checkbox"
                                :disabled="!state.statusToggle"
                    >
                        {{ $t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_CHECKBOX') }}
                    </p-checkbox>
                    <p-text-button icon-left="ic_service_cost-report"
                                   style-type="highlight"
                                   class="cost-report-button"
                    >
                        {{ $t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_COST_REPORT') }}
                    </p-text-button>
                </div>
            </div>
            <p-button v-if="state.statusToggle"
                      :disabled="!isAllValid || !state.isChanged"
                      class="save-button"
                      @click="handleSaveConfig"
            >
                {{ $t('IAM.DOMAIN_SETTINGS.SAVE_CHANGE') }}
            </p-button>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.admin-domain-settings-auto-dormancy-configuration-page {
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
                .toggle-text-desc {
                    @apply text-gray-600;
                    .emphasis {
                        @apply text-gray-900 font-medium;
                    }
                }
            }
        }
        .cost-wrapper {
            @apply relative flex text-label-md border border-gray-200;
            border-radius: 0.375rem;
            padding: 1.5rem;
            gap: 1.5rem;
            .cost-threshold-chart {
                width: 13rem;
                height: 7.75rem;
                margin-top: auto;
                margin-bottom: auto;
            }
            .cost-content-wrapper {
                @apply flex flex-col;
                gap: 1.25rem;
                .cost-report-button {
                    @apply absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                }
                .icon {
                    margin-top: -0.25rem;
                }
                .cost-input {
                    @apply relative;
                    width: 15rem;
                    .placeholder {
                        @apply absolute text-label-md text-gray-400 text-right;
                        top: 0.5rem;
                        right: 0.625rem;
                    }
                }

                /* custom design-system component - p-text-input */
                :deep(.p-text-input) {
                    .delete-all-icon {
                        @apply hidden;
                    }
                    input[type="number"] {
                        -moz-appearance: textfield;
                        appearance: textfield;
                        width: 100%;
                    }

                    input[type="number"]::-webkit-outer-spin-button,
                    input[type="number"]::-webkit-inner-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                }
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
    .save-button {
        width: 7.5rem;
        margin-bottom: 1rem;
    }
}
</style>
