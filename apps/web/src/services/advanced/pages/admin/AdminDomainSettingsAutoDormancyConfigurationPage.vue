<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { isEmpty } from 'lodash';

import {
    PPaneLayout, PDivider, PTextButton, PCheckbox, PToggleButton, PFieldGroup, PTextInput, PButton, PTooltip, PI,
} from '@cloudforet/mirinae';
import { getNumberFromString, numberFormatter } from '@cloudforet/utils';

import { useDomainConfigApi } from '@/api-clients/config/domain-config/composables/use-domain-config-api';
import type { DomainConfigCreateParameters } from '@/api-clients/config/domain-config/schema/api-verbs/create';
import type { DomainConfigUpdateParameters } from '@/api-clients/config/domain-config/schema/api-verbs/update';
import { DOMAIN_CONFIG_NAMES } from '@/api-clients/config/domain-config/schema/constant';
import { useCostReportConfigApi } from '@/api-clients/cost-analysis/cost-report-config/composables/use-cost-report-config-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n as _i18n } from '@/translations';

import { CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import type { DormancyConfig } from '@/services/advanced/types/preferences-type';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';

const router = useRouter();

const { hasReadWriteAccess } = usePageEditableStatus();

const state = reactive({
    currency: undefined as Currency|undefined,
    toggleText: computed<string>(() => (state.statusToggle
        ? 'IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_TOGGLE_ENABLED'
        : 'IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_TOGGLE_DISABLED'
    )),
    attributes: { type: 'number' },
    isChanged: computed<boolean>(() => {
        if ([cost.value, dormancyConfigData.value].every((d) => !d)) return false;
        return (getNumberFromString(cost.value) !== dormancyConfigData.value?.cost)
            || (state.checkbox !== dormancyConfigData.value?.send_email);
    }),
    statusToggle: false,
    checkbox: false,
});

const queryClient = useQueryClient();
const { domainConfigAPI } = useDomainConfigApi();
const { costReportConfigAPI } = useCostReportConfigApi();

const { key: domainConfigListQueryKey, params: domainConfigListParams } = useServiceQueryKey('config', 'domain-config', 'list', {
    params: computed(() => ({
        name: DOMAIN_CONFIG_NAMES.DORMANCY_WORKSPACE,
    })),
});
const { key: costReportConfigQueryKey } = useServiceQueryKey('cost-analysis', 'cost-report-config', 'list');

const { data: dormancyConfigData } = useScopedQuery({
    queryKey: domainConfigListQueryKey,
    queryFn: async () => domainConfigAPI.list(domainConfigListParams.value),
    select: (data) => data.results?.[0]?.data as DormancyConfig ?? null,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 2,
}, ['DOMAIN']);
const { data: currencyData } = useScopedQuery({
    queryKey: costReportConfigQueryKey,
    queryFn: () => costReportConfigAPI.list({}),
    select: (data) => data.results?.[0]?.currency as Currency ?? CURRENCY_SYMBOL.USD,
}, ['DOMAIN']);

const { mutate: createDomainDormancyMutation } = useMutation({
    mutationFn: (params: DomainConfigCreateParameters) => domainConfigAPI.create(params),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: domainConfigListQueryKey.value });
    },
    onError: (e) => {
        ErrorHandler.handleError(e);
    },
});
const { mutate: updateDomainDormancyMutation } = useMutation({
    mutationFn: (params: DomainConfigUpdateParameters) => domainConfigAPI.update(params),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: domainConfigListQueryKey.value });
    },
    onError: (e) => {
        ErrorHandler.handleError(e);
    },
});

const {
    forms: { cost },
    invalidState,
    invalidTexts,
    setForm,
    initForm,
    isAllValid,
} = useFormValidator({
    cost: numberFormatter(dormancyConfigData.value?.cost) as string|undefined,
}, {
    cost: (val?: string) => {
        if (state.statusToggle && !val?.trim()) return _i18n.t('IAM.DOMAIN_SETTINGS.ALT_E_EMPTY_COST');
        return true;
    },
});

const handleUpdateCost = (value?: string) => {
    const _cost = getNumberFromString(value);
    setForm('cost', numberFormatter(_cost));
};
const handleClickReportButton = () => {
    window.open(router.resolve({
        name: ADMIN_COST_EXPLORER_ROUTE.COST_REPORT._NAME,
    }).href, '_blank');
};
const handleChangeToggleButton = async (value: boolean) => {
    try {
        await updateDomainDormancy({
            enabled: value,
            cost: dormancyConfigData.value?.cost || 0,
            send_email: dormancyConfigData.value?.send_email || false,
        });
        if (value) {
            showSuccessMessage(_i18n.t('IAM.DOMAIN_SETTINGS.ALT_S_DORMANCY_TOGGLE_ENABLE'), '');
        } else {
            showSuccessMessage(_i18n.t('IAM.DOMAIN_SETTINGS.ALT_S_DORMANCY_TOGGLE_DISABLE'), '');
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const handleSaveConfig = async () => {
    try {
        await updateDomainDormancy({
            enabled: true,
            cost: getNumberFromString(cost.value) || 0,
            send_email: state.checkbox,
        });
        showSuccessMessage(_i18n.t('IAM.DOMAIN_SETTINGS.ALT_S_UPDATE_DORMANCY'), '');
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const createDomainDormancy = (data: DormancyConfig) => {
    createDomainDormancyMutation({
        name: DOMAIN_CONFIG_NAMES.DORMANCY_WORKSPACE,
        data,
    });
};
const updateDomainDormancy = (data: DormancyConfig) => {
    if (!dormancyConfigData.value) {
        createDomainDormancy(data);
    } else {
        updateDomainDormancyMutation({
            name: DOMAIN_CONFIG_NAMES.DORMANCY_WORKSPACE,
            data,
        });
    }
};

watch(() => dormancyConfigData.value, (config) => {
    if (isEmpty(config)) return;
    state.statusToggle = config?.enabled || false;
    state.checkbox = config?.send_email || false;
    setForm('cost', numberFormatter(config?.cost));
}, { immediate: true });

onMounted(async () => {
    await initForm();
});
</script>

<template>
    <p-pane-layout class="admin-domain-settings-auto-dormancy-configuration-page">
        <div class="content-wrapper">
            <div class="toggle-wrapper">
                <p-toggle-button :value.sync="state.statusToggle"
                                 class="toggle-button"
                                 :disabled="!hasReadWriteAccess"
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
                            <p-tooltip :contents="$t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_COST_THRESHOLD_DESC')"
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
                                <p-text-input :value="state.statusToggle ? cost : undefined"
                                              :invalid="invalid"
                                              :disabled="!hasReadWriteAccess || !state.statusToggle"
                                              masking-mode
                                              class="cost-input"
                                              @update:value="handleUpdateCost"
                                />
                                <span class="placeholder">{{ CURRENCY_SYMBOL[currencyData] }} {{ currencyData }}</span>
                            </div>
                        </template>
                    </p-field-group>
                    <p-divider class="divider" />
                    <p-checkbox v-model="state.checkbox"
                                :disabled="!hasReadWriteAccess || !state.statusToggle"
                    >
                        <span>{{ $t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_CHECKBOX') }}</span>
                    </p-checkbox>
                    <p-text-button icon-left="ic_service_cost-report"
                                   style-type="highlight"
                                   class="cost-report-button"
                                   @click="handleClickReportButton"
                    >
                        {{ $t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION_COST_REPORT') }}
                    </p-text-button>
                </div>
            </div>
            <p-button v-if="state.statusToggle"
                      :disabled="!hasReadWriteAccess || !isAllValid || !state.isChanged"
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
                    max-width: 47rem;
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
                flex: 1;
                gap: 1.25rem;
                .divider {
                    @apply block;
                    width: 100%;
                    margin-top: 1.25rem;
                    margin-bottom: 1.25rem;
                }

                /* custom design-system component - p-checkbox */
                :deep(.p-checkbox) {
                    @apply items-center;
                    width: auto;
                    .text {
                        margin-left: 0.25rem;
                    }
                }
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
                    max-width: 15rem;
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
                .cost-input {
                    @apply cursor-not-allowed;
                }
            }
        }
    }
    .save-button {
        width: 7.5rem;
        margin-bottom: 1rem;
    }

    @screen tablet {
        .cost-report-button {
            display: none;
        }
    }

    @screen mobile {
        .cost-wrapper {
            flex-direction: column;
            align-items: center;
            .cost-threshold-chart {
                width: auto;
                height: auto;
                max-width: 13rem;
            }
            .cost-content-wrapper {
                max-width: 15rem;
            }
        }
    }
}
</style>
