import { computed, reactive } from 'vue';

import dayjs from 'dayjs';
import { isEmpty, sortBy } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { CostQuerySetCreateParameters } from '@/schema/cost-analysis/cost-query-set/api-verbs/create';
import type { CostQuerySetUpdateParameters } from '@/schema/cost-analysis/cost-query-set/api-verbs/update';
import type { CostQuerySetModel } from '@/schema/cost-analysis/cost-query-set/model';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { Currency } from '@/store/modules/settings/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { GRANULARITY, GROUP_BY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { convertRelativePeriodToPeriod } from '@/services/cost-explorer/helpers/cost-explorer-period-helper';
import { useCostQuerySetStore } from '@/services/cost-explorer/stores/cost-query-set-store';
import type {
    RelativePeriod, Granularity, GroupBy, Period,
} from '@/services/cost-explorer/types/cost-explorer-query-type';


interface GroupByItem {
    name: GroupBy|string;
    label: string;
}

const getRefinedFilters = (consoleFilters?: ConsoleFilter[]): Record<string, string[]> => {
    if (!consoleFilters || isEmpty(consoleFilters)) return {};
    const result: Record<string, string[]> = {};
    consoleFilters.forEach((d) => {
        result[d.k as string] = d.v as string[];
    });
    return result;
};

export const useCostAnalysisPageStore = defineStore('cost-analysis-page', () => {
    const allReferenceStore = useAllReferenceStore();
    const costQuerySetStore = useCostQuerySetStore();
    const costQuerySetGetters = costQuerySetStore.getters;
    const costQuerySetState = costQuerySetStore.state;
    const appContextStore = useAppContextStore();

    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        managedGroupByItems: computed<GroupByItem[]>(() => {
            if (_state.isAdminMode) {
                return Object.values(GROUP_BY_ITEM_MAP).filter((d) => d.name !== GROUP_BY.PROJECT);
            }
            return Object.values(GROUP_BY_ITEM_MAP).filter((d) => d.name !== GROUP_BY.WORKSPACE);
        }),
    });
    const state = reactive({
        granularity: GRANULARITY.MONTHLY as Granularity,
        groupBy: [] as Array<GroupBy|string>,
        chartGroupBy: undefined as GroupBy|string|undefined,
        period: undefined as Period|undefined,
        relativePeriod: undefined as RelativePeriod|undefined,
        filters: {} as Record<string, string[]>,
        enabledFiltersProperties: undefined as string[]|undefined,
    });
    const getters = reactive({
        selectedQueryId: computed(() => costQuerySetState.selectedQuerySetId),
        costQueryList: computed(() => costQuerySetState.costQuerySetList),
        selectedQuerySet: computed(() => costQuerySetGetters.selectedQuerySet),
        selectedDataSourceId: computed(() => costQuerySetState.selectedDataSourceId),
        managedCostQuerySetList: computed(() => costQuerySetGetters.managedCostQuerySets),
        currency: computed<Currency>(() => {
            if (costQuerySetState.selectedDataSourceId) {
                const targetDataSource = allReferenceStore.getters.costDataSource[costQuerySetState.selectedDataSourceId ?? ''];
                return targetDataSource?.data?.plugin_info?.metadata?.currency ?? 'USD';
            }
            return 'USD';
        }),
        defaultGroupByItems: computed(() => {
            let additionalInfoGroupBy: GroupByItem[] = [];
            if (costQuerySetState.selectedDataSourceId) {
                const targetDataSource = allReferenceStore.getters.costDataSource[costQuerySetState.selectedDataSourceId ?? ''];
                const additionalInfoKeys = targetDataSource?.data?.cost_additional_info_keys;
                if (targetDataSource && additionalInfoKeys?.length) {
                    additionalInfoGroupBy = additionalInfoKeys.map((d) => ({
                        name: `additional_info.${d}`,
                        label: d,
                    }));
                }
            }
            return [..._state.managedGroupByItems, ...sortBy(additionalInfoGroupBy, 'label')];
        }),
        consoleFilters: computed<ConsoleFilter[]>(() => {
            const results: ConsoleFilter[] = [];
            Object.entries(state.filters ?? {}).forEach(([category, filterItems]) => {
                if (filterItems.length) {
                    results.push({
                        k: category,
                        v: filterItems,
                        o: '=',
                    });
                }
            });
            return results;
        }),
        dataSourceImageUrl: computed<string>(() => {
            if (costQuerySetState.selectedDataSourceId) {
                const targetDataSource = allReferenceStore.getters.costDataSource[costQuerySetState.selectedDataSourceId ?? ''];
                return store.getters['reference/pluginItems'][targetDataSource?.data?.plugin_info?.plugin_id]?.icon;
            }
            return '';
        }),
        isPeriodInvalid: computed<boolean>(() => {
            const now = dayjs().utc();
            const checkPeriod = (limit:number):{isStartInvalid:boolean, isEndInvalid:boolean} => {
                const isStartInvalid = now.diff(state.period?.start, 'month') >= limit;
                const isEndInvalid = now.diff(state.period?.end, 'month') >= limit;
                return { isStartInvalid, isEndInvalid };
            };
            const DAILY_LIMIT_MONTH = 12;
            const OTHER_LIMIT_MONTH = 36;
            const isGranularityDaily = state.granularity === GRANULARITY.DAILY;
            const { isStartInvalid, isEndInvalid } = checkPeriod(isGranularityDaily ? DAILY_LIMIT_MONTH : OTHER_LIMIT_MONTH);
            return isStartInvalid || isEndInvalid;
        }),
    });

    /* Mutations */
    const setChartGroupBy = (groupBy: GroupBy|string|undefined) => {
        state.chartGroupBy = groupBy;
    };
    const setEnabledFiltersProperties = (enabledProperties: string[]) => {
        state.enabledFiltersProperties = enabledProperties;
    };
    const setFilters = (filters: Record<string, string[]>) => {
        state.filters = filters;
    };
    const setGranularity = (granularity: Granularity) => {
        state.granularity = granularity;
    };
    const setGroupBy = (groupBy: Array<GroupBy|string>) => {
        state.groupBy = groupBy;
    };
    const setPeriod = (period?: Period) => {
        state.period = period;
    };
    const setRelativePeriod = (relativePeriod?: RelativePeriod) => {
        state.relativePeriod = relativePeriod;
    };

    /* Actions */
    const reset = () => {
        state.granularity = GRANULARITY.MONTHLY;
        state.groupBy = [];
        state.chartGroupBy = undefined;
        state.period = undefined;
        state.relativePeriod = undefined;
        state.filters = {};
        state.enabledFiltersProperties = undefined;
    };
    const setQueryOptions = (options?: CostQuerySetModel['options']) => {
        reset();
        if (!options) return;

        if (options.granularity) state.granularity = options.granularity;

        state.groupBy = options.group_by ?? [];
        state.chartGroupBy = options.group_by?.[0];

        if (options.relative_period) {
            state.relativePeriod = options.relative_period;
            state.period = convertRelativePeriodToPeriod({
                relativePeriod: options.relative_period,
                granularity: options.granularity,
            });
        } else if (options.period) {
            state.period = { start: options.period.start, end: options.period.end };
        }
        state.filters = getRefinedFilters(options.filters);

        // check admin mode
        if (options.metadata?.filters_schema?.enabled_properties?.length) {
            if (_state.isAdminMode) {
                state.enabledFiltersProperties = options.metadata.filters_schema.enabled_properties.filter((d) => d !== GROUP_BY.PROJECT);
            } else {
                state.enabledFiltersProperties = options.metadata.filters_schema.enabled_properties.filter((d) => d !== GROUP_BY.WORKSPACE);
            }
        } else {
            state.enabledFiltersProperties = _state.managedGroupByItems.map((d) => d.name);
        }
    };
    const saveQuery = async (name: string): Promise<CostQuerySetModel|undefined> => {
        const options: CostQuerySetModel['options'] = {
            granularity: state.granularity,
            period: state.period,
            relative_period: state.relativePeriod,
            group_by: state.groupBy,
            filters: getters.consoleFilters,
            metadata: { filters_schema: { enabled_properties: state.enabledFiltersProperties ?? [] } },
        };
        let createdData;
        try {
            createdData = await SpaceConnector.clientV2.costAnalysis.costQuerySet.create<CostQuerySetCreateParameters, CostQuerySetModel>({
                name,
                data_source_id: costQuerySetState.selectedDataSourceId as string,
                options,
            });
            selectQueryId(createdData.cost_query_set_id);
        } catch (e) {
            ErrorHandler.handleError(e);
        }
        return createdData;
    };
    const selectQueryId = (querySetId: string|undefined) => {
        costQuerySetStore.setSelectedQuerySetId(querySetId);
    };
    const editQuery = async (querySetId: string, name: string): Promise<CostQuerySetModel> => {
        let updatedQueryData;
        if (costQuerySetGetters.selectedQuerySet?.name !== name) {
            try {
                updatedQueryData = await SpaceConnector.clientV2.costAnalysis.costQuerySet.update<CostQuerySetUpdateParameters, CostQuerySetModel>({
                    cost_query_set_id: querySetId,
                    name,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        }
        return updatedQueryData;
    };
    const getCostQueryList = async () => {
        await costQuerySetStore.listCostQuerySets();
    };

    const actions = {
        reset,
        setQueryOptions,
        saveQuery,
        selectQueryId,
        editQuery,
        getCostQueryList,
    };
    const mutations = {
        setChartGroupBy,
        setEnabledFiltersProperties,
        setFilters,
        setGranularity,
        setGroupBy,
        setPeriod,
        setRelativePeriod,
    };

    (async () => {
        await store.dispatch('reference/plugin/load');
    })();

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
