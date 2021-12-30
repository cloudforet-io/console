<template>
    <div class="cost-analysis-page">
        <p-breadcrumbs :routes="routeState.route" />
        <section class="title-section">
            <p-select-dropdown :items="queryItemList" type="icon-button" button-icon="ic_list"
                               class="list-button"
                               @select="handleClickQueryItem"
            >
                <template #menu-item--format="{item}">
                    <div class="query-item-wrapper">
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
                            <!--                            <p-icon-text-button name="ic_download" style-type="gray-border">-->
                            <!--                                PDF-->
                            <!--                            </p-icon-text-button>-->
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
        <delete-modal :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CHECK_DELETE_MODAL_DESC')"
                      :visible.sync="checkDeleteState.visible"
                      @confirm="handleDeleteQueryConfirm"
        />
    </div>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';

import {
    computed, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PBreadcrumbs, PPageTitle, PIconButton, PSelectDropdown, PI, PButton,
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
    queryStringToArray, queryStringToBoolean,
    queryStringToObject,
    queryStringToString,
} from '@/lib/router-query-string';
import { CostAnalysisPageUrlQuery } from '@/services/billing/cost-management/cost-analysis/type';
import { Location } from 'vue-router';

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
        // PIconTextButton,
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
        });

        /* util */
        const setSelectedQueryId = (queryId?: string) => {
            store.commit('service/costAnalysis/setSelectedQueryId', queryId);
        };

        const setQueryOptions = (options?: Partial<CostQuerySetOption>) => {
            if (options) store.dispatch('service/costAnalysis/setQueryOptions', options);
            else store.dispatch('service/costAnalysis/initCostAnalysisStoreState');
        };

        const getQueryOptionsFromUrlQuery = (urlQuery: CostAnalysisPageUrlQuery): Partial<CostQuerySetOption> => ({
            granularity: queryStringToString(urlQuery.granularity),
            stack: queryStringToBoolean(urlQuery.stack),
            group_by: queryStringToArray(urlQuery.groupBy),
            period: queryStringToObject(urlQuery.period),
            filters: queryStringToObject(urlQuery.filters),
        });

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
                    setQueryOptions();
                    setSelectedQueryId();
                }
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_DELETE_QUERY'));
            }
        };

        const handleClickQueryItem = async (queryId: string) => {
            if (queryId === state.selectedQueryId) return;

            if (queryId) {
                const { options } = getQueryWithKey(queryId);
                setQueryOptions(options);
                setSelectedQueryId(queryId);
            } else {
                setQueryOptions();
                setSelectedQueryId();
            }
        };

        const handleSaveQueryConfirm = ({ updatedQuery, requestType }: SaveQueryEmitParam) => {
            if (!updatedQuery) return;

            store.dispatch('service/costAnalysis/listCostQueryList');

            if (requestType === REQUEST_TYPE.EDIT && updatedQuery.cost_query_set_id !== state.selectedQueryId) {
                return;
            }

            if (requestType === REQUEST_TYPE.SAVE) {
                setSelectedQueryId(updatedQuery.cost_query_set_id);
            }
        };

        const handleSaveQueryOption = async () => {
            try {
                const {
                    granularity, stack,
                    period, groupBy, filters,
                } = store.state.service.costAnalysis;
                await SpaceConnector.client.costAnalysis.costQuerySet.update({
                    cost_query_set_id: state.selectedQueryId,
                    options: {
                        granularity,
                        stack,
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

        /* Watchers */
        watch(() => saveQueryFormState.visible, () => {
            if (saveQueryFormState.visible === false) saveQueryFormState.selectedQuery = {};
        });

        watch(() => state.selectedQueryId, (selectedQueryId) => {
            if (props.querySetId !== selectedQueryId) {
                const location: Location = {
                    params: { querySetId: selectedQueryId },
                    query: {},
                };

                SpaceRouter.router.replace(location);
            }
        });

        let unregisterStoreWatch;
        const registerStoreWatch = () => {
            unregisterStoreWatch = store.watch((_, getters) => getters['service/costAnalysis/currentQuerySetOptions'], (options) => {
                if (props.querySetId) return;

                const newQuery: CostAnalysisPageUrlQuery = {
                    granularity: primitiveToQueryString(options.granularity),
                    stack: primitiveToQueryString(options.stack),
                    groupBy: arrayToQueryString(options.groupBy),
                    period: objectToQueryString(options.period),
                    filters: objectToQueryString(options.filters),
                };

                const currentQuery = SpaceRouter.router.currentRoute.query;
                if (JSON.stringify(newQuery) !== JSON.stringify(currentQuery)) {
                    SpaceRouter.router.replace({ query: newQuery });
                }
            }, { immediate: false });
        };

        onUnmounted(() => {
            if (unregisterStoreWatch) {
                unregisterStoreWatch();
            }
        });

        /* Page Init */
        (async () => {
            // list cost query sets
            await store.dispatch('service/costAnalysis/listCostQueryList');

            // init states
            if (props.querySetId) {
                const { name, options } = getQueryWithKey(props.querySetId);
                if (name) {
                    setQueryOptions(options);
                    setSelectedQueryId(props.querySetId);
                } else {
                    setSelectedQueryId();
                }
            } else {
                const options = getQueryOptionsFromUrlQuery(SpaceRouter.router.currentRoute.query);
                setQueryOptions(options);
            }

            // register store watch
            registerStoreWatch();
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
        @apply relative;
        display: flex;

        .p-page-title {
            flex-wrap: wrap;
            row-gap: 2rem;
        }

        .title-main-wrapper {
            @apply flex items-center flex-wrap gap-2;
            margin-left: 2.5rem;
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
            @apply absolute bg-transparent;
            top: 0;
            left: 0;
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

            .button-wrapper {
                @apply flex items-center flex-wrap gap-4;
            }
        }
    }

    .cost-analysis-chart {
        @apply relative z-10;
        margin-bottom: 1rem;
    }

    @screen mobile {
        &::v-deep .extra {
            width: 100%;
        }
    }
}
</style>
