import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';

import { indigo, red, yellow } from '@/styles/colors';


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
        comparison: {},
        subTotal: {},
        total: {},
        progressBar: {
            options: {
                defaultFormatRules: [
                    { threshold: 90, color: yellow[500] },
                    { threshold: 100, color: red[400] },
                ],
                baseColor: indigo[500],
            },
        },
    },
};


export default table;
