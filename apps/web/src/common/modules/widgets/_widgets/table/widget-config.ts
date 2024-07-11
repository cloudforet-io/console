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
        tableDataField: {
            options: {
                max: 15,
            },
        },
        groupBy: {
            options: {
                dataTarget: 'labels_info',
                multiSelectable: true,
                hideCount: false,
                defaultIndex: 0,
            },
        },
    },
    optionalFieldsSchema: {
        comparison: {},
        subTotal: {},
        total: {},
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
    },
    dependencies: {
        groupBy: ['comparison'],
        tableDataField: ['comparison'],
    },
};


export default table;
