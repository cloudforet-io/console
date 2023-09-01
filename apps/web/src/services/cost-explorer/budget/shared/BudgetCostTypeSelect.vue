<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PFieldGroup, PRadio, PFilterableDropdown } from '@spaceone/design-system';
import type {
    AutocompleteHandler,
    FilterableDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import { debounce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';
import type { ReferenceMap } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import type { CostType, BudgetModel } from '@/services/cost-explorer/budget/model';

type CostTypes = BudgetModel['cost_types'];
type BudgetCostType = 'all'| CostType;

interface Props {
    costTypes?: CostTypes;
    disableValidation?: boolean;
}

type BudgetCostTypes = Record<BudgetCostType, TranslateResult>;
interface DistinctResult {
    results?: {name: string; key: string}[];
    total_count?: number;
}

const getSearchDropdownItems = (resourceItems: ReferenceMap): FilterableDropdownMenuItem[] => Object.keys(resourceItems).map((k) => ({
    name: k, label: resourceItems[k].label,
}));

const props = withDefaults(defineProps<Props>(), {
    costTypes: undefined,
    disableValidation: false,
});

const emit = defineEmits<{(e: 'update', costTypeInfo: CostTypes|undefined, isValid: boolean): void; }>();

const {
    forms: {
        selectedCostType, selectedResources,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    selectedCostType: 'all' as BudgetCostType,
    selectedResources: [] as FilterableDropdownMenuItem[],
}, {
    selectedResources(value: BudgetCostType) {
        if (selectedCostType.value === 'all') return '';
        return value.length ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REQUIRED_COST_TYPE');
    },
}, { selectedCostType: true, selectedResources: true });

const state = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
    costTypeItems: computed<BudgetCostTypes>(() => ({
        all: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.ALL'),
        provider: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.PROVIDER'),
    })),
    resourceMenuItems: computed<FilterableDropdownMenuItem[]|undefined>(() => (selectedCostType.value === 'provider' ? getSearchDropdownItems(state.providers) : undefined)),
    resourceMenuLoading: false,
    visibleResourceMenu: false,
    costTypeInfo: computed<CostTypes|undefined>(() => {
        if (selectedCostType.value === 'all') return undefined;

        const resources = selectedResources.value.map((d) => d.name as string);
        if (resources.length === 0) return undefined;

        return { [selectedCostType.value as CostType]: resources };
    }),
});

let resourceToken: CancelTokenSource | undefined;
const getResources = async (inputText: string, distinctKey): Promise<DistinctResult> => {
    if (resourceToken) {
        resourceToken.cancel('Next request has been called.');
        resourceToken = undefined;
    }

    resourceToken = axios.CancelToken.source();

    try {
        const res = await SpaceConnector.client.addOns.autocomplete.distinct({
            resource_type: 'cost_analysis.Cost',
            distinct_key: distinctKey,
            search: inputText,
            options: {
                limit: 10,
            },
        }, {
            cancelToken: resourceToken.token,
        });
        resourceToken = undefined;

        return res;
    } catch (e: any) {
        if (!axios.isCancel(e.axiosError)) {
            ErrorHandler.handleError(e);
        }

        return {};
    }
};

const resourceMenuHandler: AutocompleteHandler = async (inputText: string) => {
    if (state.resourceMenuItems) return { results: [] };

    state.resourceMenuLoading = true;
    const { results, total_count } = await getResources(inputText, selectedCostType.value);
    state.resourceMenuLoading = false;

    return {
        results: results ? results.map((d) => ({ name: d.key, label: d.name })) : [],
        totalCount: total_count,
    };
};

watch(() => selectedCostType.value, () => {
    state.visibleResourceMenu = false;
    setForm('selectedResources', []);
});

watch([() => state.costTypeInfo, () => isAllValid.value], debounce(([costTypeInfo, isValid]) => {
    emit('update', costTypeInfo, isValid);
}, 300) as any, { immediate: true });

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/provider/load'),
        store.dispatch('reference/region/load'),
        store.dispatch('reference/serviceAccount/load'),
    ]);
})();

</script>

<template>
    <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_COST_TYPE')"
                   required
                   :invalid="!props.disableValidation && invalidState.selectedResources"
                   :invalid-text="invalidTexts.selectedResources"
                   class="budget-cost-type-select-field"
    >
        <div class="cost-type-wrapper">
            <p-radio v-for="(costTypeLabel, costTypeKey) in state.costTypeItems"
                     :key="costTypeKey"
                     :selected="selectedCostType"
                     :value="costTypeKey"
                     @change="setForm('selectedCostType', $event)"
            >
                {{ costTypeLabel }}
            </p-radio>
        </div>
        <p-filterable-dropdown v-if="selectedCostType !== 'all'"
                               :visible-menu.sync="state.visibleResourceMenu"
                               :menu="state.resourceMenuItems"
                               :handler="state.resourceMenuItems ? undefined : resourceMenuHandler"
                               :loading="state.resourceMenuLoading"
                               :invalid="!props.disableValidation && invalidState.selectedResources"
                               :selected="selectedResources"
                               multi-selectable
                               show-select-marker
                               appearance-type="stack"
                               class="mt-2"
                               @update:selected="setForm('selectedResources', $event)"
        />
    </p-field-group>
</template>

<style lang="postcss" scoped>
.budget-cost-type-select-field {
    width: 30rem;
    .p-filterable-dropdown {
        margin-top: 0.5rem;
    }
}

.cost-type-wrapper {
    display: flex;
    flex-wrap: wrap;
    .p-radio {
        margin-right: 1rem;
        margin-bottom: 0.25rem;
    }
}

@screen mobile {
    .budget-cost-type-select-field {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
    }
}
</style>
