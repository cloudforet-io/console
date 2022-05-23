<template>
    <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_COST_TYPE')"
                   required
                   :invalid="!disableValidation && invalidState.selectedResources"
                   :invalid-text="invalidTexts.selectedResources"
                   class="cost-type"
    >
        <p-radio v-for="(costTypeLabel, costTypeKey) in costTypeItems" :key="costTypeKey"
                 :selected="selectedCostType" :value="costTypeKey"
                 @change="setForm('selectedCostType', $event)"
        >
            {{ costTypeLabel }}
        </p-radio>
        <p-search-dropdown v-if="selectedCostType !== 'all'"
                           :visible-menu.sync="visibleResourceMenu"
                           :menu="resourceMenuItems"
                           :handler="resourceMenuItems ? undefined : resourceMenuHandler"
                           :loading="resourceMenuLoading"
                           :invalid="!disableValidation && invalidState.selectedResources"
                           :selected="selectedResources"
                           multi-selectable
                           class="mt-2"
                           @update:selected="setForm('selectedResources', $event)"
        />
    </p-field-group>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, PropType,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { PFieldGroup, PRadio, PSearchDropdown } from '@spaceone/design-system';
import {
    AutocompleteHandler,
    SearchDropdownMenuItem,
} from '@spaceone/design-system/dist/src/inputs/dropdown/search-dropdown/type';
import axios, { CancelTokenSource } from 'axios';
import { debounce } from 'lodash';
import { TranslateResult } from 'vue-i18n';

import { store } from '@/store';
import { i18n } from '@/translations';

import { ReferenceMap } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { BudgetCostType, BudgetData, CostType } from '@/services/cost-explorer/budget/type';


type CostTypes = BudgetData['cost_types']

interface Props {
    costTypes?: CostTypes;
    disableValidation?: boolean;
}

type BudgetCostTypes = Record<BudgetCostType, TranslateResult>
interface DistinctResult {
    results?: {name: string; key: string}[];
    total_count?: number;
}

const getSearchDropdownItems = (resourceItems: ReferenceMap): SearchDropdownMenuItem[] => Object.keys(resourceItems).map(k => ({
    name: k, label: resourceItems[k].label,
}));

export default defineComponent<Props>({
    name: 'BudgetCostTypeSelect',
    components: {
        PFieldGroup,
        PRadio,
        PSearchDropdown,
    },
    props: {
        costTypes: {
            type: Object as PropType<CostTypes|undefined>,
            default: undefined,
        },
        disableValidation: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
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
            selectedResources: [] as SearchDropdownMenuItem[],
        }, {
            selectedResources(value: BudgetCostType) {
                if (selectedCostType.value === 'all') return '';
                return value.length ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REQUIRED_COST_TYPE');
            },
        }, { selectedCostType: true, selectedResources: true });


        const state = reactive({
            costTypeItems: computed<BudgetCostTypes>(() => ({
                all: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.ALL'),
                provider: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.PROVIDER'),
                region_code: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REGION'),
                service_account_id: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.ACCOUNT'),
                product: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.PRODUCT'),
            })),
            resourceMenuItems: computed<SearchDropdownMenuItem[]|undefined>(() => {
                if (selectedCostType.value === 'provider') return getSearchDropdownItems(store.state.reference.provider.items);
                if (selectedCostType.value === 'region_code') return getSearchDropdownItems(store.state.reference.region.items);
                if (selectedCostType.value === 'service_account_id') return getSearchDropdownItems(store.state.reference.serviceAccount.items);
                return undefined;
            }),
            resourceMenuLoading: false,
            visibleResourceMenu: false,
            costTypeInfo: computed<CostTypes|undefined>(() => {
                if (selectedCostType.value === 'all') return undefined;

                const resources = selectedResources.value.map(d => d.name as string);
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
                results: results ? results.map(d => ({ name: d.key, label: d.name })) : [],
                totalCount: total_count,
            };
        };

        watch(() => selectedCostType.value, () => {
            state.visibleResourceMenu = false;
            setForm('selectedResources', []);
        });

        watch([() => state.costTypeInfo, () => isAllValid.value], debounce(([costTypeInfo, isValid]) => {
            emit('update', costTypeInfo, isValid);
        }, 300), { immediate: true });

        // LOAD REFERENCE STORE
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/provider/load'),
                store.dispatch('reference/region/load'),
                store.dispatch('reference/serviceAccount/load'),
            ]);
        })();

        return {
            selectedCostType,
            selectedResources,
            setForm,
            invalidState,
            invalidTexts,
            isAllValid,
            ...toRefs(state),
            resourceMenuHandler,
        };
    },
});
</script>
