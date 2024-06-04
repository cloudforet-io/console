import type { UnwrapRef, ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import type { DashboardVariables, DataSource } from '@/schema/dashboard/_types/dashboard-type';
import type { DataMapping, Granularity, NewWidgetFilters } from '@/schema/dashboard/_types/widget-type';

import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { WidgetProps } from '@/common/modules/widgets/types/widget-display-type';


interface WidgetDataState {
    dataSources?: ComputedRef<DataSource[]>;
    dataMapping?: ComputedRef<DataMapping>;
    filters?: ComputedRef<NewWidgetFilters|undefined>;
    variables?: ComputedRef<DashboardVariables>;
    baseOnDate?: ComputedRef<string|undefined>;
    granularity?: ComputedRef<Granularity|undefined>;
}
interface UseWidgetDataReturnType {
    itemList: any[];
    fetcher: () => void;
}

export const useWidgetData = (props: UnwrapRef<WidgetProps>): UseWidgetDataReturnType => {
    const config = getWidgetConfig(props.widgetName);
    // TODO: 'useWidgetConsoleFilters' refactoring with dataSource
    // const consoleFilters = useWidgetConsoleFilters(props, baseState, overrides);
    const widgetDataState = reactive<WidgetDataState>({
        dataSources: computed(() => props.dataSources),
        dataMapping: computed(() => props.dataMapping),
        filters: computed(() => props.filters),
        variables: computed(() => props.variables),
        baseOnDate: computed(() => props.baseOnDate),
        granularity: computed(() => config.meta.granularity),
    });

    const fetcher = () => {
        console.debug('fetch!', widgetDataState.dataSources);
    };

    return {
        itemList: [],
        fetcher,
    };
};
