<template>
    <div class="cost-analysis-page">
        <p-breadcrumbs :routes="routeState.route" />
        <section class="title-section">
            <p-select-dropdown :items="queryItemList" type="icon-button" button-icon="ic_list"
                               class="list-button"
            >
                <template #menu-item--format="{item}">
                    <div class="query-item-wrapper" @click="handleClickQueryItem(item)">
                        <div class="dropdown-item-modal">
                            <p-i v-if="getQueryWithKey(item.name).scope === QUERY_VISIBILITY_TYPE.PRIVATE" name="ic_security" width="1rem"
                                 height="1rem"
                            />
                            <span>{{ item.label }}</span><span v-if="!item.name" class="default-item-suffix">(default)</span>
                        </div>
                        <div v-if="item.name" class="button-wrapper">
                            <p-icon-button name="ic_trashcan" size="sm"
                                           @click.stop="handleClickDeleteQuery(item.name)"
                            />
                            <p-icon-button name="ic_edit-text" size="sm" @click.stop="handleClickEditQuery(item.name)" />
                        </div>
                    </div>
                </template>
            </p-select-dropdown>
            <p-page-title>
                <template #title>
                    <div class="title-main-wrapper">
                        <p-i v-if="getQueryWithKey(selectedQueryId).scope === QUERY_VISIBILITY_TYPE.PRIVATE" name="ic_security"
                             width="1rem"
                             height="1rem"
                        />
                        <span>{{ selectedQueryId ? title : defaultTitle }}</span>
                        <div v-if="selectedQueryId" class="button-wrapper">
                            <p-icon-button name="ic_trashcan"
                                           @click.stop="handleClickDeleteQuery(selectedQueryId)"
                            />
                            <p-icon-button name="ic_edit-text" @click.stop="handleClickEditQuery(selectedQueryId)" />
                        </div>
                    </div>
                </template>
                <template #extra>
                    <div class="title-extra-wrapper">
                        <span />
                        <div class="button-wrapper">
                            <p-icon-text-button name="ic_download" style-type="gray-border">
                                PDF
                            </p-icon-text-button>
                            <p-button v-if="selectedQueryId" style-type="gray-border" @click="handleSaveQueryOption">
                                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE') }}
                            </p-button>
                            <p-button style-type="gray-border" @click="handleClickSaveQuery">
                                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE_AS') }}
                            </p-button>
                        </div>
                    </div>
                </template>
            </p-page-title>
        </section>
        <cost-analysis-query-filter />
        <cost-analysis-group-by-filter />
        <cost-analysis-chart />
        <cost-analysis-data-table />
        <save-query-form-modal :header-title="saveQueryFormState.title" :visible.sync="saveQueryFormState.visible"
                               :selected-query="saveQueryFormState.selectedQuery" :request-type="saveQueryFormState.requestType"
                               @confirm="handleSaveQueryConfirm"
        />
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      @confirm="handleDeleteQueryConfirm"
        />
    </div>
</template>

<script lang="ts">
import { upperFirst } from 'lodash';
import { TranslateResult } from 'vue-i18n';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PBreadcrumbs, PPageTitle, PIconButton, PSelectDropdown, PI, PIconTextButton, PButton,
} from '@spaceone/design-system';

import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import CostAnalysisChart from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisChart.vue';
import CostAnalysisQueryFilter from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisQueryFilter.vue';
import CostAnalysisGroupByFilter from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisGroupByFilter.vue';
import CostAnalysisDataTable from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisDataTable.vue';
import SaveQueryFormModal from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisSaveQueryFormModal.vue';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';

import { BILLING_ROUTE } from '@/services/billing/routes';
import {
    COST_ANALYSIS_PAGE_URL_QUERY_KEY,
    QUERY_VISIBILITY_TYPE, REQUEST_TYPE,
} from '@/services/billing/cost-management/cost-analysis/lib/config';
import { registerServiceStore } from '@/common/composables/register-service-store';
import {
    CostAnalysisStoreState,
    CostQuerySetModel,
    CostQuerySetOption,
} from '@/services/billing/cost-management/cost-analysis/store/type';
import costAnalysisStoreModule from '@/services/billing/cost-management/cost-analysis/store';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';
import { i18n } from '@/translations';
import { SpaceRouter } from '@/router';
import {
    arrayToQueryString,
    objectToQueryString,
    primitiveToQueryString,
    queryStringToArray,
    queryStringToObject,
    queryStringToString,
    replaceUrlQuery,
    ConvertValueToQueryString,
} from '@/lib/router-query-string';
import { CostAnalysisPageUrlQuery } from '@/services/billing/cost-management/cost-analysis/type';

export interface SaveQueryEmitParam {
    updatedQuery: CostQuerySetModel;
    requestType: REQUEST_TYPE;
}

export default {
    name: 'CostAnalysisPage',
    components: {
        CostAnalysisDataTable,
        CostAnalysisGroupByFilter,
        CostAnalysisChart,
        CostAnalysisQueryFilter,
        PBreadcrumbs,
        PPageTitle,
        PIconButton,
        PSelectDropdown,
        PI,
        PIconTextButton,
        PButton,
        SaveQueryFormModal,
        DeleteModal,
    },
    props: {
        querySetId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { root }) {
        registerServiceStore<CostAnalysisStoreState>('costAnalysis', costAnalysisStoreModule);

        const subscribeQuerySetOptions = () => {
            const MutationToUrlQueryKeyMap: Record<string, COST_ANALYSIS_PAGE_URL_QUERY_KEY> = {};
            COST_ANALYSIS_PAGE_URL_QUERY_KEY.forEach((k) => {
                MutationToUrlQueryKeyMap[`service/costAnalysis/set${upperFirst(k)}`] = k;
            });

            const urlQueryStringConverterMap: Record<COST_ANALYSIS_PAGE_URL_QUERY_KEY, ConvertValueToQueryString> = {
                chartType: primitiveToQueryString,
                granularity: primitiveToQueryString,
                groupBy: arrayToQueryString,
                period: objectToQueryString,
                filters: objectToQueryString,
            };

            store.subscribe((mutation, storeState) => {
                if (props.querySetId) return;

                const urlQueryKey = MutationToUrlQueryKeyMap[mutation.type];
                if (urlQueryKey) {
                    try {
                        const value = storeState.service.costAnalysis[urlQueryKey];
                        const converter = urlQueryStringConverterMap[urlQueryKey];
                        replaceUrlQuery(urlQueryKey, converter(value));
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
        };

        const state = reactive({
            defaultTitle: computed<TranslateResult>(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.COST_ANALYSIS')),
            costQueryList: computed<CostQuerySetModel[]>(() => store.state.service.costAnalysis.costQueryList),
            queryItemList: computed<MenuItem[]>(() => ([
                { name: 'header', label: 'Saved Query', type: 'header' },
                { name: undefined, label: 'Cost Analysis', type: 'item' },
                ...state.costQueryList.map((item: CostQuerySetModel): MenuItem => ({
                    name: item.cost_query_set_id,
                    label: item.name,
                    type: 'item',
                })),
            ])),
            selectedQueryId: computed<string|undefined>(() => store.state.service.costAnalysis.selectedQueryId),
            selectedQuerySet: computed<CostQuerySetModel|undefined>(() => store.getters['service/costAnalysis/selectedQuerySet']),
            title: computed<string>(() => state.selectedQuerySet?.name ?? 'Cost Analysis'),
            itemIdForDeleteQuery: '',
        });

        const saveQueryFormState = reactive({
            visible: false,
            title: '' as string | TranslateResult,
            selectedQuery: {},
            requestType: REQUEST_TYPE.SAVE as REQUEST_TYPE,
        });

        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), to: { name: BILLING_ROUTE._NAME } },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), to: { name: BILLING_ROUTE.COST_MANAGEMENT._NAME } },
                { name: i18n.t('MENU.BILLING.COST_ANALYSIS') },
            ]),
        });

        const checkDeleteState = reactive({
            visible: false,
            headerTitle: computed(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CHECK_DELETE_MODAL_DESC')),
        });

        /* util */
        const initSelectedQueryOptions = () => {
            store.dispatch('service/costAnalysis/initCostAnalysisStoreState');
        };

        const getQueryWithKey = (queryItemKey: string): Partial<CostQuerySetModel> => (state.costQueryList.find(item => item.cost_query_set_id === queryItemKey)) || {};

        /* event */
        const handleClickDeleteQuery = (id) => {
            state.itemIdForDeleteQuery = id;
            checkDeleteState.visible = true;
        };
        const handleClickEditQuery = (queryItemId) => {
            const queryItem = getQueryWithKey(queryItemId);
            saveQueryFormState.title = i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.EDIT_QUERY');
            saveQueryFormState.requestType = REQUEST_TYPE.EDIT;
            saveQueryFormState.selectedQuery = queryItem;
            saveQueryFormState.visible = true;
        };
        const handleClickSaveQuery = () => {
            saveQueryFormState.title = i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE_QUERY');
            saveQueryFormState.requestType = REQUEST_TYPE.SAVE;
            saveQueryFormState.visible = true;
        };

        const handleDeleteQueryConfirm = async () => {
            checkDeleteState.visible = false;
            try {
                await SpaceConnector.client.costAnalysis.costQuerySet.delete({ cost_query_set_id: state.itemIdForDeleteQuery });
                await store.dispatch('service/costAnalysis/listCostQueryList');
                showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_DELETE_QUERY'), '', root);
                if (state.selectedQueryId === state.itemIdForDeleteQuery) {
                    await SpaceRouter.router.push({ name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME });
                    initSelectedQueryOptions();
                }
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_DELETE_QUERY'));
            }
        };

        const handleClickQueryItem = async (queryItem: Required<MenuItem>) => {
            if (queryItem.name !== props.querySetId) {
                await SpaceRouter.router.replace({
                    name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                    params: { querySetId: queryItem.name },
                });
            }
            await store.commit('service/costAnalysis/setSelectedQueryId', queryItem.name);
            if (!queryItem.name) {
                initSelectedQueryOptions();
                return;
            }
            const { options } = getQueryWithKey(queryItem.name);
            store.dispatch('service/costAnalysis/setQueryOptions', options);
            store.commit('service/costAnalysis/setSelectedQueryId', queryItem.name);
        };

        const handleSaveQueryConfirm = ({ updatedQuery, requestType }: SaveQueryEmitParam) => {
            if (!updatedQuery) return;
            if (requestType === REQUEST_TYPE.EDIT && updatedQuery.cost_query_set_id !== state.selectedQueryId) {
                store.dispatch('service/costAnalysis/listCostQueryList');
                return;
            }
            store.dispatch('service/costAnalysis/listCostQueryList');
            if (requestType === REQUEST_TYPE.SAVE) {
                SpaceRouter.router.replace({
                    name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                    params: { querySetId: updatedQuery.cost_query_set_id },
                });
            }
        };

        const handleSaveQueryOption = async () => {
            try {
                const {
                    granularity, chartType,
                    period, groupBy, filters,
                } = store.state.service.costAnalysis;
                await SpaceConnector.client.costAnalysis.costQuerySet.update({
                    cost_query_set_id: state.selectedQueryId,
                    options: {
                        granularity,
                        chart_type: chartType,
                        period,
                        group_by: groupBy,
                        filters,
                    },
                });
                await store.dispatch('service/costAnalysis/listCostQueryList');
                showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_SAVED_QUERY'), '', root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_SAVED_QUERY'));
            }
        };

        watch(() => saveQueryFormState.visible, () => {
            if (saveQueryFormState.visible === false) saveQueryFormState.selectedQuery = {};
        });
        watch(() => props.querySetId, (querySetId) => {
            if (querySetId) {
                replaceUrlQuery();
            }
        });

        (async () => {
            initSelectedQueryOptions();

            await store.dispatch('service/costAnalysis/listCostQueryList');
            if (props.querySetId) {
                const { name, options } = getQueryWithKey(props.querySetId);
                if (name) {
                    store.dispatch('service/costAnalysis/setQueryOptions', options);
                    store.commit('service/costAnalysis/setSelectedQueryId', props.querySetId);
                } else {
                    await SpaceRouter.router.replace({ name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME });
                }
            } else {
                const urlQuery: CostAnalysisPageUrlQuery = SpaceRouter.router.currentRoute.query;
                const options: Partial<CostQuerySetOption> = {
                    chart_type: queryStringToString(urlQuery.chartType),
                    granularity: queryStringToString(urlQuery.granularity),
                    group_by: queryStringToArray(urlQuery.groupBy),
                    period: queryStringToObject(urlQuery.period),
                    filters: queryStringToObject(urlQuery.filters),
                };

                store.dispatch('service/costAnalysis/setQueryOptions', options);
                store.commit('service/costAnalysis/setSelectedQueryId', props.querySetId);
            }

            subscribeQuerySetOptions();
        })();

        return {
            ...toRefs(state),
            routeState,
            checkDeleteState,
            saveQueryFormState,
            handleClickDeleteQuery,
            handleClickEditQuery,
            handleClickSaveQuery,
            handleDeleteQueryConfirm,
            handleClickQueryItem,
            handleSaveQueryConfirm,
            handleSaveQueryOption,
            QUERY_VISIBILITY_TYPE,
            getQueryWithKey,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-page {
    .title-section {
        display: flex;

        .title-main-wrapper {
            @apply flex items-center flex-wrap gap-2;

            .button-wrapper {
                @apply flex items-center;
            }
        }

        .dropdown-item-modal {
            @apply flex items-center flex-wrap gap-1;

            .default-item-suffix {
                @apply text-gray-400;
            }
        }

        .list-button::v-deep {
            @apply bg-transparent;
            margin-right: 0.5rem;

            .p-context-menu {
                min-width: 22rem;

                .menu-item-wrapper {
                    display: flex;
                    justify-content: space-between;
                }
            }
        }

        .query-item-wrapper {
            @apply flex justify-between;
            width: 100%;
        }

        .title-extra-wrapper {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-left: 0.75rem;

            .button-wrapper {
                @apply flex items-center flex-wrap gap-4;
            }
        }
    }

    .cost-analysis-chart {
        margin-bottom: 1rem;
    }
}
</style>
