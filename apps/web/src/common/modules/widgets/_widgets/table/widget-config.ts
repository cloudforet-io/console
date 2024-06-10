import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';

import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const table: WidgetConfig = {
    widgetName: 'table',
    meta: {
        title: 'Table',
        sizes: ['md', 'full'],
    },
    requiredFieldsSchema: {
        tableDataField: {
            options: {
                default: 5,
                max: 15,
            },
        },
        groupBy: {
            options: {
                dataTarget: 'label_field',
                multiSelectable: true,
                hideCount: false,
            },
        },
    },
    optionalFieldsSchema: {
        comparison: {
            options: {
                granularity: GRANULARITY.DAILY,
                forTable: true,
            },
        },
        subTotal: {},
        total: {},
        progressBar: {},
    },
};


export default table;
