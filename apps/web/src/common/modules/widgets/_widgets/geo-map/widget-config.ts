import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const geoMap: WidgetConfig = {
    widgetName: 'geoMap',
    meta: {
        title: 'Geo Map',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        granularity: {},
        dataField: {},
        groupBy: {
            options: {
                dataTarget: 'labels_info',
                hideCount: true,
                fixedValue: 'Region',
            },
        },
    },
    optionalFieldsSchema: {
        displayAnnotation: {},
    },
};


export default geoMap;
