import { NUMBER_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';

// import { indigo, red, yellow } from '@/styles/colors';


const table: WidgetConfig = {
    widgetName: 'table',
    meta: {
        title: 'Table',
        sizes: ['md', 'full'],
    },
    requiredFieldsSchema: {
        granularity: {},
        dateRange: {},
        dataField: {
            options: {
                multiSelectable: true,
                allSelected: true,
            },
        },
        groupBy: {
            options: {
                dataTarget: 'labels_info',
                multiSelectable: true,
                hideCount: true,
            },
        },
    },
    optionalFieldsSchema: {
        comparison: {},
        total: {
            options: {
                toggle: false,
                default: true,
            },
        },
        // NOTE: rollback after progress developed
        // progressBar: {
        //     options: {
        //         defaultFormatRules: [
        //             { threshold: 90, color: yellow[500] },
        //             { threshold: 100, color: red[400] },
        //         ],
        //         baseColor: indigo[500],
        //     },
        // },
        dateFormat: {},
        numberFormat: {
            options: {
                default: NUMBER_FORMAT.FULL_NUMBER,
            },
        },
        dataFieldHeatmapColor: {},
        textWrap: {},
        tableColumnWidth: {},
        customTableColumnWidth: {},
        displayAnnotation: {},
        // missingValue: {},
    },
    dependencies: {
        groupBy: ['comparison', 'customTableColumnWidth'],
        tableDataField: ['comparison', 'subTotal', 'customTableColumnWidth'],
    },
};


export default table;
