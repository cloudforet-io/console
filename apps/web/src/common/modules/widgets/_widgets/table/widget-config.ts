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
                fields: [
                    {
                        name: 'dynamicField',
                        labelTranslationCode: 'DASHBOARDS.WIDGET.OVERLAY.STEP_2.DYNAMIC_FIELD',
                        dataTarget: 'label_field',
                        multiSelectable: false,
                    },
                    {
                        name: 'staticField',
                        labelTranslationCode: 'DASHBOARDS.WIDGET.OVERLAY.STEP_2.STATIC_FIELD',
                        dataTarget: 'data_field',
                        multiSelectable: true,
                    },
                ],
            },
        },
        groupBy: {
            options: {
                dataTarget: 'label_field',
                multiSelectable: true,
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
