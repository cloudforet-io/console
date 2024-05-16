import type { UnwrapRef } from 'vue';
import { computed, reactive } from 'vue';

import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { NewWidgetProps } from '@/common/modules/widgets/types/widget-display-type';


export const useWidgetDataState = (props: UnwrapRef<NewWidgetProps>) => {
    const config = getWidgetConfig(props.widgetName);
    // TODO: 'useWidgetConsoleFilters' refactoring with dataSource
    // const consoleFilters = useWidgetConsoleFilters(props, baseState, overrides);
    const widgetDataState = reactive({
        dataSources: computed(() => props.dataSources),
        dataMapping: computed(() => props.dataMapping),
        filters: computed(() => props.filters),
        variables: computed(() => props.variables),
        dateRange: computed(() => props.dateRange),
        granularity: computed(() => config.meta.granularity),
    });

    return {
        widgetDataState,
    };
};
