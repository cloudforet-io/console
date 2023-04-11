import { faker } from '@faker-js/faker';

import { DEFAULT_NAME_OPTIONS, DEFAULT_VALUE_OPTIONS, DYNAMIC_CHART_TYPE } from '@/data-display/dynamic/dynamic-chart/config';
import type { DynamicChartType } from '@/data-display/dynamic/dynamic-chart/type';
import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';

interface DynamicChartMockData {
    type: DynamicChartType;
    data: any[];
}

const getChartData = (
    length = 15,
    valueOptions: DynamicField = DEFAULT_VALUE_OPTIONS,
    nameOptions: DynamicField = DEFAULT_NAME_OPTIONS,
): any[] => {
    const nameKey = nameOptions.key;
    const valueKey = valueOptions.key;
    faker.helpers.arrayElements(Array.from(Array(23).keys()));
    return Array.from(Array(length).keys()).map(() => ({
        [nameKey]: faker.random.word(),
        [valueKey]: faker.datatype.number(19000000000),
    }));
};

export const getDynamicChartMockData = (
    type?: DynamicChartType,
    length = 15,
    valueOptions: DynamicField = DEFAULT_VALUE_OPTIONS,
    nameOptions: DynamicField = DEFAULT_NAME_OPTIONS,
): DynamicChartMockData => {
    const chartType = type ?? faker.helpers.arrayElement(DYNAMIC_CHART_TYPE);


    return {
        type: chartType,
        data: getChartData(length, valueOptions, nameOptions),
    };
};
