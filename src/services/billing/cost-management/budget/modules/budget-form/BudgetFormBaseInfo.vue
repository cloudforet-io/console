<template>
    <p-pane-layout>
        <p-panel-top>
            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.BASE_INFORMATION') }}
        </p-panel-top>
        <div class="p-4">
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_NAME')"
                           required
            >
                <p-text-input v-model="name" />
            </p-field-group>

            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_TARGET')"
                           required
            >
                <project-select-dropdown :selected-project-ids.sync="selectedTargets" />
            </p-field-group>

            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_COST_TYPE')"
                           required
                           class="cost-type"
            >
                <p-radio v-for="(costTypeLabel, costTypeKey) in costTypeItems" :key="costTypeKey"
                         v-model="selectedCostType" :value="costTypeKey"
                >
                    {{ costTypeLabel }}
                </p-radio>
                <p-search-dropdown v-if="selectedCostType !== 'all'"
                                   :handler="resourceMenuHandler"
                                   :loading="resourceMenuLoading"
                                   type="checkbox"
                                   :selected.sync="selectedResources"
                />
            </p-field-group>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PFieldGroup, PPaneLayout, PPanelTop, PRadio, PSearchDropdown, PTextInput,
} from '@spaceone/design-system';
import {
    SearchDropdownMenuItem, AutocompleteHandler,
} from '@spaceone/design-system/dist/src/inputs/search/search-dropdown/type';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { i18n } from '@/translations';
import { TranslateResult } from 'vue-i18n';
import { BudgetCostType } from '@/services/billing/cost-management/budget/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import axios, { CancelTokenSource } from 'axios';


type BudgetCostTypes = Record<BudgetCostType, TranslateResult>

const COST_TYPE_TO_RESOURCE_TYPE: Record<Exclude<BudgetCostType, 'all'>, string> = {
    provider: 'identity.Provider',
    region: 'inventory.Region',
    account: 'identity.ServiceAccount',
    product: 'inventory.CloudServiceType',
};

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
    setup() {
        const state = reactive({
            name: '',
            selectedTargets: [] as string[],
            selectedCostType: 'all' as BudgetCostType,
            costTypeItems: computed<BudgetCostTypes>(() => ({
                all: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.ALL'),
                provider: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.PROVIDER'),
                region: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REGION'),
                account: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.ACCOUNT'),
                product: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.PRODUCT'),
            })),
            selectedResources: [] as SearchDropdownMenuItem[],
            resourceMenuLoading: false,
        });


        let resourceToken: CancelTokenSource | undefined;
        const getResources = async (inputText: string, resourceType): Promise<{name: string; key: string}[]|void> => {
            if (resourceToken) {
                resourceToken.cancel('Next request has been called.');
                resourceToken = undefined;
            }

            resourceToken = axios.CancelToken.source();

            try {
                const { results } = await SpaceConnector.client.addOns.autocomplete.resource({
                    resource_type: resourceType,
                    search: inputText,
                    options: {
                        limit: 10,
                    },
                }, {
                    cancelToken: resourceToken.token,
                });
                resourceToken = undefined;

                return results;
            } catch (e) {
                if (!axios.isCancel(e.axiosError)) {
                    ErrorHandler.handleError(e);
                }

                return undefined;
            }
        };

        const resourceMenuHandler: AutocompleteHandler = async (value: string) => {
            const resourceType = COST_TYPE_TO_RESOURCE_TYPE[state.selectedCostType];
            if (!resourceType) return { results: [] };

            state.resourceMenuLoading = true;
            const results = await getResources(value, resourceType);
            state.resourceMenuLoading = false;

            return { results: results ? results.map(d => ({ name: d.key, label: d.name })) : [] };
        };

        watch(() => state.selectedCostType, () => {
            state.selectedResources = [];
        });


        return {
            ...toRefs(state),
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
