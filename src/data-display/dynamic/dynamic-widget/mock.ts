import { faker } from '@faker-js/faker';

import { DYNAMIC_CHART_THEMES, DYNAMIC_CHART_TYPE } from '@/data-display/dynamic/dynamic-chart/config';
import { getDynamicChartMockData } from '@/data-display/dynamic/dynamic-chart/mock';
import type { DynamicChartType } from '@/data-display/dynamic/dynamic-chart/type';
import { DEFAULT_NAME_OPTIONS, DEFAULT_VALUE_OPTIONS } from '@/data-display/dynamic/dynamic-widget/config';
import type { DynamicWidgetProps, DynamicWidgetSchemaOptions, DynamicWidgetType } from '@/data-display/dynamic/dynamic-widget/type';
import {
    DYNAMIC_WIDGET_TYPE,
} from '@/data-display/dynamic/dynamic-widget/type';

interface DynamicWidgetMockData {
    schemaOptions: DynamicWidgetSchemaOptions;
    data: any;
}

export const getDynamicWidgetChartTypeMockData = (_chartType?: DynamicChartType): DynamicWidgetMockData => {
    const chartType = _chartType ?? faker.helpers.arrayElement(DYNAMIC_CHART_TYPE);

    return {
        schemaOptions: {
            value_options: DEFAULT_VALUE_OPTIONS,
            name_options: DEFAULT_NAME_OPTIONS,
            chart_type: chartType,
        },
        data: getDynamicChartMockData(chartType, undefined, DEFAULT_VALUE_OPTIONS, DEFAULT_NAME_OPTIONS).data,
    };
};

export const getDynamicWidgetSummaryTypeMockData = (): DynamicWidgetMockData => ({
    schemaOptions: {
        value_options: DEFAULT_VALUE_OPTIONS,
    },
    data: {
        value: faker.datatype.number(10000000),
    },
});

export const getDynamicWidgetMockData = (_type?: DynamicWidgetType): DynamicWidgetProps => {
    const type = _type ?? faker.helpers.arrayElement(DYNAMIC_WIDGET_TYPE);

    let props: DynamicWidgetProps = {
        index: faker.datatype.number({ min: 0, max: DYNAMIC_CHART_THEMES.length - 1 }),
        type,
        name: faker.lorem.sentence(3),
        schemaOptions: {},
        data: {},
        loading: false,
        viewOptions: {},
    };

    if (type === 'summary') props = { ...props, ...getDynamicWidgetSummaryTypeMockData() };
    else if (type === 'chart') props = { ...props, ...getDynamicWidgetChartTypeMockData() };
    return props;
};
