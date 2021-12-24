import faker from 'faker';
import {
    DYNAMIC_WIDGET_TYPE, DynamicWidgetProps, DynamicWidgetSchemaOptions, DynamicWidgetType,
} from '@/data-display/dynamic/dynamic-widget/type';
import { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { DYNAMIC_CHART_TYPE } from '@/data-display/dynamic/dynamic-chart/config';

interface DynamicWidgetMockData {
    schemaOptions: DynamicWidgetSchemaOptions;
    data: any;
}

export const getDynamicWidgetChartTypeMockData = (): DynamicWidgetMockData => {
    const chartType = faker.random.arrayElement(DYNAMIC_CHART_TYPE);

    const valueOptions: DynamicField = {
        key: 'value',
        name: 'Value',
        type: 'text',
    };

    const nameOptions: DynamicField = {
        key: 'value',
        name: 'Value',
        type: 'text',
    };

    return {
        schemaOptions: {
            value_options: valueOptions,
            name_options: nameOptions,
            chart_type: chartType,
            limit: 10,
        },
        data: {},
    };
};

export const getDynamicWidgetCardTypeMockData = (): DynamicWidgetMockData => ({
    schemaOptions: {},
    data: {},
});

export const getDynamicWidgetMockData = (_type?: DynamicWidgetType): DynamicWidgetProps => {
    const type = _type ?? faker.random.arrayElement(DYNAMIC_WIDGET_TYPE);

    let props: DynamicWidgetProps = {
        type,
        name: faker.lorem.sentence(1),
        schemaOptions: {},
        data: {},
        loading: false,
        viewOptions: {},
    };

    if (type === 'card') props = { ...getDynamicWidgetCardTypeMockData(), ...props };
    else if (type === 'chart') props = { ...getDynamicWidgetChartTypeMockData(), ...props };

    return props;
};
