<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PPaneLayout, PDivider, PTextButton, PCheckbox, PToggleButton, PFieldGroup, PTextInput, PButton, PTooltip, PI,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

const state = reactive({
    statusToggle: false,
    toggleText: computed<TranslateResult>(() => (state.statusToggle
        ? i18n.t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_TOGGLE _ENABLED')
        : i18n.t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_TOGGLE _DISABLED')
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
        if (!val.trim()) return i18n.t('IAM.DOMAIN_SETTINGS.ALT_E_EMPTY_COST');
        return true;
    },
});

(() => {
    initForm();
})();
</script>

<template>
    <p-pane-layout class="admin-domain-settings-auto-dormancy-configuration-page">
        <div class="content-wrapper">
            <div class="toggle-wrapper">
                <p-toggle-button :value.sync="state.statusToggle"
                                 class="toggle-button"
                />
                <p class="toggle-text">
                    <strong class="title">{{ $t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_TOGGLE') }}</strong>
                    <span>{{ state.toggleText }}</span>
                </p>
            </div>
            <div class="cost-wrapper"
                 :class="{ disabled: !state.statusToggle }"
            >
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
                        <p-text-input :value="cost"
                                      :invalid="invalid"
                                      :disabled="!state.statusToggle"
                                      type="number"
                                      masking-mode
                                      placeholder="$ USD"
                                      class="cost-input"
                                      @update:value="setForm('cost', $event)"
                        />
                    </template>
                </p-field-group>
                <p-divider />
                <p-checkbox :value.sync="state.checkbox"
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
            <p-button :disabled="!isAllValid"
                      class="save-button"
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

                input::placeholder {
                    @apply absolute text-right;
                    right: 0.125rem;
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
