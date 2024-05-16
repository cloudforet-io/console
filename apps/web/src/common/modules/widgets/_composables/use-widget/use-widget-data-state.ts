import type { UnwrapRef } from 'vue';
import { computed, reactive } from 'vue';

import type { DashboardVariables, DataSource } from '@/schema/dashboard/_types/dashboard-type';
import type { DataMapping, Granularity, NewWidgetFilters } from '@/schema/dashboard/_types/widget-type';

import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { NewWidgetProps } from '@/common/modules/widgets/types/widget-display-type';


interface WidgetDataState {
    dataSources?: DataSource[];
    dataMapping?: DataMapping;
    filters?: NewWidgetFilters;
    variables?: DashboardVariables;
    baseOnDate?: string;
    granularity?: Granularity;
}
export const useWidgetDataState = (props: UnwrapRef<NewWidgetProps>): { widgetDataState: WidgetDataState } => {
    const config = getWidgetConfig(props.widgetName);
    // TODO: 'useWidgetConsoleFilters' refactoring with dataSource
    // const consoleFilters = useWidgetConsoleFilters(props, baseState, overrides);
    const widgetDataState = reactive({
        dataSources: computed(() => props.dataSources),
        dataMapping: computed(() => props.dataMapping),
        filters: computed(() => props.filters),
        variables: computed(() => props.variables),
        baseOnDate: computed(() => props.baseOnDate),
        granularity: computed(() => config.meta.granularity),
    });

    return {
        widgetDataState,
    };
};
