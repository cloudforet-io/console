<script setup lang="ts">
import { computed, reactive } from 'vue';
import draggable from 'vuedraggable';

import { isEmpty } from 'lodash';

import {
    PButton, PIconButton, PSelectDropdown, PFieldTitle, PTextInput, PLazyImg, PI,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { useReportAdjustmentQuery } from '@/services/cost-explorer/composables/use-report-adjustment-query';
import { useAdvancedSettingsPageStore } from '@/services/cost-explorer/stores/advanced-settings-page-store';
import type { AdjustmentData, AdjustmentType } from '@/services/cost-explorer/types/report-adjustment-type';

const props = defineProps<{
    policyId: string;
}>();
const referenceMap = useAllReferenceDataModel();
const providerDataMap = referenceMap.provider;

const allReferenceStore = useAllReferenceStore();
const advancedSettingsPageStore = useAdvancedSettingsPageStore();
const advancedSettingsPageState = advancedSettingsPageStore.$state;
const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
});

const {
    reportAdjustmentList,
} = useReportAdjustmentQuery();

const providerMenuItems = computed<SelectDropdownMenuItem[]>(() => Object.values(storeState.providers).map((item) => ({
    name: item.key,
    label: item.name,
    imageUrl: item.icon,
})));
const adjustmentMenuItems = computed<SelectDropdownMenuItem[]>(() => ([
    {
        name: 'FIXED_ADDITION',
        label: i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.FIXED_ADDITION'),
    },
    {
        name: 'FIXED_DEDUCTION',
        label: i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.FIXED_DEDUCTION'),
    },
    {
        name: 'PERCENT_ADDITION',
        label: i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.PERCENTAGE_ADDITION'),
    },
    {
        name: 'PERCENT_DEDUCTION',
        label: i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.PERCENTAGE_DEDUCTION'),
    },
]));
const adjustmentList = computed<AdjustmentData[]>(() => advancedSettingsPageState.adjustmentListMap[props.policyId] || []);

/* Util */
const getAmountRightExtra = (adjustment: AdjustmentType): string => {
    if (adjustment === 'PERCENT_DEDUCTION' || adjustment === 'PERCENT_ADDITION') {
        return '%';
    }
    const currency = reportAdjustmentList.value?.find((item) => item.report_adjustment_id === props.policyId)?.currency || 'USD';
    return currency;
};
const getAmountSymbol = (adjustment: AdjustmentType): string => {
    if (adjustment === 'FIXED_DEDUCTION' || adjustment === 'PERCENT_DEDUCTION') {
        return 'ic_minus';
    }
    return 'ic_plus';
};

/* Event */
const handleAddAdjustmentRow = () => {
    advancedSettingsPageStore.addAdjustment(props.policyId);
};
const handleDeleteAdjustmentRow = (adjustmentId: string) => {
    if (!adjustmentId) return;
    advancedSettingsPageStore.deleteAdjustment(props.policyId, adjustmentId);
};
const handleUpdateProvider = (adjustmentId: string, selected: string) => {
    const targetAdjustment = advancedSettingsPageState.adjustmentListMap[props.policyId].find((item) => item.id === adjustmentId);
    if (!targetAdjustment) return;
    advancedSettingsPageStore.updateAdjustment(props.policyId, adjustmentId, {
        ...targetAdjustment,
        provider: selected,
    });
};
const handleUpdateAdjustment = (adjustmentId: string, selected: AdjustmentType) => {
    const targetAdjustment = advancedSettingsPageState.adjustmentListMap[props.policyId].find((item) => item.id === adjustmentId);
    if (!targetAdjustment) return;
    advancedSettingsPageStore.updateAdjustment(props.policyId, adjustmentId, {
        ...targetAdjustment,
        adjustment: selected,
    });
};
</script>

<template>
    <div class="advanced-settings-adjustment-form-adjustments">
        <div class="adjustment-row">
            <p-field-title size="sm"
                           color="gray"
            >
                {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.TITLE') }}
            </p-field-title>
            <p-field-title size="sm"
                           color="gray"
            >
                {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.PROVIDER') }}
            </p-field-title>
            <p-field-title size="sm"
                           color="gray"
            >
                {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.ADJUSTMENT') }}
            </p-field-title>
            <p-field-title size="sm"
                           color="gray"
            >
                {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.AMOUNT') }}
            </p-field-title>
            <p-field-title size="sm"
                           color="gray"
            >
                <span>{{ $t('COST_EXPLORER.ADVANCED_SETTINGS.DESCRIPTION') }}</span>
                <span class="text-gray-400 text-xs font-normal"> (optional)</span>
            </p-field-title>
        </div>
        <draggable :list="adjustmentList"
                   draggable=".draggable-item"
                   ghost-class="ghost"
        >
            <div v-for="(item, idx) in adjustmentList"
                 :key="`adjustment-row-${idx}`"
                 class="adjustment-row draggable-item"
            >
                <p-icon-button name="ic_drag-handle"
                               size="sm"
                               class="adjustment-row-drag-button"
                />
                <p-text-input v-model="item.name"
                              :placeholder="$t('COST_EXPLORER.ADVANCED_SETTINGS.TITLE')"
                              :invalid="!item.name"
                              block
                />
                <p-select-dropdown :menu="providerMenuItems"
                                   :selected="item.provider"
                                   use-fixed-menu-style
                                   :placeholder="$t('COST_EXPLORER.ADVANCED_SETTINGS.PROVIDER')"
                                   :invalid="!item.provider"
                                   @update:selected="handleUpdateProvider(item.id, $event)"
                >
                    <template #dropdown-button="dropdownItem">
                        <div v-if="!isEmpty(dropdownItem)"
                             class="flex items-center gap-2"
                        >
                            <p-lazy-img v-if="providerDataMap[dropdownItem.name]?.data?.icon"
                                        class="selected-icon"
                                        :src="providerDataMap[dropdownItem.name]?.data?.icon"
                                        width="1rem"
                                        height="1rem"
                            />
                            <span class="selected-text">
                                {{ providerDataMap[dropdownItem.name]?.data?.name }}
                            </span>
                        </div>
                        <div v-else>
                            <span class="text-gray-600">
                                {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.PROVIDER') }}
                            </span>
                        </div>
                    </template>
                </p-select-dropdown>
                <p-select-dropdown :menu="adjustmentMenuItems"
                                   :selected="item.adjustment"
                                   use-fixed-menu-style
                                   :invalid="!item.adjustment"
                                   @update:selected="handleUpdateAdjustment(item.id, $event)"
                />
                <p-text-input v-model="item.amount"
                              type="number"
                              :placeholder="$t('COST_EXPLORER.ADVANCED_SETTINGS.AMOUNT')"
                              :invalid="!item.amount"
                              class="w-auto"
                              :min="0"
                >
                    <template #input-left>
                        <div :class="['symbol-icon', getAmountSymbol(item.adjustment) === 'ic_minus' ? 'text-red-500' : 'text-green-500']">
                            <p-i :name="getAmountSymbol(item.adjustment)"
                                 width="1rem"
                                 height="1rem"
                                 color="inherit"
                            />
                        </div>
                    </template>
                    <template #input-right>
                        {{ getAmountRightExtra(item.adjustment) }}
                    </template>
                </p-text-input>
                <p-text-input v-model="item.description"
                              :placeholder="$t('COST_EXPLORER.ADVANCED_SETTINGS.DESCRIPTION')"
                />
                <p-icon-button name="ic_delete"
                               size="sm"
                               class="adjustment-row-delete-button"
                               @click="handleDeleteAdjustmentRow(item.id)"
                />
            </div>
        </draggable>
        <p-button style-type="transparent"
                  icon-left="ic_plus_bold"
                  block
                  class="adjustment-footer"
                  @click="handleAddAdjustmentRow"
        >
            {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.ADD_ADJUSTMENT') }}
        </p-button>
    </div>
</template>

<style scoped lang="postcss">
.advanced-settings-adjustment-form-adjustments {
    padding: 1rem;
    .adjustment-row {
        @apply grid grid-cols-5 gap-2 mb-1;
        position: relative;
        padding: 0.25rem 2rem;
        &.ghost {
            opacity: 0.5;
        }
        .adjustment-row-drag-button {
            @apply cursor-move;
            position: absolute;
            left: 0;
            top: 0.5rem;
            z-index: 1;
        }
        .adjustment-row-delete-button {
            position: absolute;
            right: 0;
            top: 0.5rem;
            z-index: 1;
        }
        .symbol-icon {
            padding-right: 0.25rem;
        }
    }
    .adjustment-footer {
        @apply mt-4;
    }
}
.p-text-input {
    width: 100%;
}
</style>
