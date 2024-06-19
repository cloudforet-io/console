import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';

import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const table: WidgetConfig = {
    widgetName: 'table',
    meta: {
        title: 'Table',
        sizes: ['md', 'full'],
    },
    requiredFieldsSchema: {
        granularity: {},
        tableDataField: {
            options: {
                defaultMaxCount: 5,
                max: 15,
            },
        },
        groupBy: {
            options: {
                dataTarget: 'labels_info',
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