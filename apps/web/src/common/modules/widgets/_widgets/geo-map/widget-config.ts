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
    },
    optionalFieldsSchema: {
        legend: {},
    },
};


export default geoMap;
