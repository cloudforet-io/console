<template>
    <p-pane-layout>
        <p-panel-top>
            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.BASE_INFORMATION') }}
        </p-panel-top>
        <div class="p-4">
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <p-text-input :value="name" :invalid="invalidState.name" @input="setForm('name', $event)" />
            </p-field-group>

            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_TARGET')"
                           :invalid="invalidState.selectedTargets"
                           :invalid-text="invalidTexts.selectedTargets"
                           required
            >
                <project-select-dropdown :selected-project-ids="selectedTargets"
                                         :invalid="invalidState.selectedTargets"
                                         project-group-selectable
                                         @update:selectedProjectIds="setForm('selectedTargets', $event)"
                />
            </p-field-group>

            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_COST_TYPE')"
                           required
                           :invalid="invalidState.selectedCostType"
                           :invalid-text="invalidTexts.selectedCostType"
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
                                   type="checkbox"
                                   show-selected-list
                                   :invalid="invalidState.selectedCostType"
                                   :selected="selectedResources"
                                   @update:selected="setForm('selectedResources', $event)"
                />
            </p-field-group>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import axios, { CancelTokenSource } from 'axios';

import {
    computed, reactive, toRefs, watch, watchEffect,
} from '@vue/composition-api';
import { TranslateResult } from 'vue-i18n';

import {
    PFieldGroup, PPaneLayout, PPanelTop, PRadio, PSearchDropdown, PTextInput,
} from '@spaceone/design-system';
import {
    SearchDropdownMenuItem, AutocompleteHandler,
} from '@spaceone/design-system/dist/src/inputs/search/search-dropdown/type';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { BudgetCostType, BudgetData, CostType } from '@/services/billing/cost-management/budget/type';
import { store } from '@/store';
import { ResourceMap } from '@/store/modules/resource/type';


type BudgetCostTypes = Record<BudgetCostType, TranslateResult>
type BudgetInfo = Pick<BudgetData, 'name'|'cost_types'|'project_group_id'|'project_id'>
interface DistinctResult {
    results?: {name: string; key: string}[];
    total_count?: number;
}

const getBudgetInfo = (_name: string, targets: string[], costType: BudgetCostType, resources: string[]) => {
    const target = targets[0];
    const isProjectGroup = target?.startsWith('pg-');

    const budgetInfo: BudgetInfo = {
        name: _name,
        [isProjectGroup ? 'project_group_id' : 'project_id']: target,
    };

    if (costType !== 'all') {
        budgetInfo.cost_types = { [costType as CostType]: resources };
    }

    return budgetInfo;
};

const getSearchDropdownItems = (resourceItems: ResourceMap): SearchDropdownMenuItem[] => Object.keys(resourceItems).map(k => ({
    name: k, label: resourceItems[k].label,
}));

export default {
    name: 'BudgetFormBaseInfo',
    components: {
        ProjectSelectDropdown,
        PPanelTop,
        PPaneLayout,
        PFieldGroup,
        PTextInput,
        PRadio,
        PSearchDropdown,
    },
    props: {
        budgetId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const {
            forms: {
                name, selectedTargets, selectedCostType, selectedResources,
            },
            setForm,
            invalidState,
            invalidTexts,
            isAllValid,
        } = useFormValidator({
            name: '',
            selectedTargets: [] as string[],
            selectedCostType: 'all' as BudgetCostType,
            selectedResources: [] as SearchDropdownMenuItem[],
        }, {
            name(value: string) { return value.trim().length ? '' : 'Required'; },
            selectedTargets(value: string[]) { return value.length ? '' : 'Required'; },
            selectedCostType(value: BudgetCostType) {
                if (value === 'all') return '';
                return selectedResources.value.length ? '' : 'Required';
            },
        });

        const state = reactive({
            costTypeItems: computed<BudgetCostTypes>(() => ({
                all: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.ALL'),
                provider: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.PROVIDER'),
                region_code: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REGION'),
                service_account_id: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.ACCOUNT'),
                product: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.PRODUCT'),
            })),
            resourceMenuLoading: false,
            visibleResourceMenu: false,
            resourceMenuItems: computed<SearchDropdownMenuItem[]|undefined>(() => {
                if (selectedCostType.value === 'provider') return getSearchDropdownItems(store.state.resource.provider.items);
                if (selectedCostType.value === 'region_code') return getSearchDropdownItems(store.state.resource.region.items);
                if (selectedCostType.value === 'service_account_id') return getSearchDropdownItems(store.state.resource.serviceAccount.items);
                return undefined;
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
            } catch (e) {
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

        watchEffect(() => {
            if (!isAllValid.value) return;

            const resources = selectedResources.value.map(d => d.name);
            const budgetInfo = getBudgetInfo(name.value, selectedTargets.value, selectedCostType.value, resources);


            emit('update', budgetInfo);
        });


        return {
            name,
            selectedTargets,
            selectedCostType,
            selectedResources,
            invalidState,
            invalidTexts,
            ...toRefs(state),
            setForm,
            resourceMenuHandler,
        };
    },
};
</script>
<style lang="postcss" scoped>
.p-panel-top {
    margin-bottom: 0.5rem;
}
.p-field-group {
    width: 30rem;
    .p-text-input {
        width: 100%;
    }
    .p-radio {
        margin-right: 1rem;
    }
}
.cost-type {
    .p-search-dropdown {
        margin-top: 0.5rem;
    }
}

@screen mobile {
    .p-field-group {
        width: 100%;
    }
    .cost-type::v-deep {
        display: flex;
        flex-wrap: wrap;
        .label-box {
            width: 100%;
        }
        .p-radio {
            margin-bottom: 0.25rem;
        }
    }
}
</style>
