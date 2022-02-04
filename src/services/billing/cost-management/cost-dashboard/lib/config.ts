import Layout1WidgetList from '@/services/billing/cost-management/cost-dashboard/dashboard-layouts/layout-1.json';
import Layout4WidgetList from '@/services/billing/cost-management/cost-dashboard/dashboard-layouts/layout-4.json';
import { DefaultLayout } from '@/services/billing/cost-management/cost-dashboard/type';

export const defaultLayoutMap = {
    'layout-1': {
        default_layout_id: 'layout-1',
        name: 'Cost Overview',
        widgetList: Layout1WidgetList,
    },
    'layout-4': {
        default_layout_id: 'layout-4',
        name: 'CDN & Traffic Cost',
        widgetList: Layout4WidgetList,
    },
};
export const defaultLayoutList: Record<string, DefaultLayout> = {
    ...{ blank: { name: 'Blank', widgetList: [] } },
    ...{ 'layout-1': { ...defaultLayoutMap['layout-1'] } },
    ...{ 'layout-4': { ...defaultLayoutMap['layout-4'] } },
};
export const defaultLayoutData = Object.values(defaultLayoutList);

export const continentData = [{
    continent_code: 'africa',
    title: 'Africa',
    longitude: 21.621094,
    latitude: 11.081385,
    width: 96,
    height: 96,
    pieData: [] as any,
}, {
    continent_code: 'europe',
    title: 'Europe',
    longitude: -6.362217,
    latitude: 50.896104,
    width: 96,
    height: 96,
    pieData: [],
}, {
    continent_code: 'north_america',
    title: 'North America',
    latitude: 39.563353,
    longitude: -99.316406,
    width: 96,
    height: 96,
    pieData: [],
}, {
    continent_code: 'south_america',
    title: 'South America',
    longitude: -69.6417454,
    latitude: -13.6631791,
    width: 96,
    height: 96,
    pieData: [],
}, {
    continent_code: 'asia_pacific',
    title: 'Asia Pacific',
    longitude: 103.183594,
    latitude: 47.212106,
    width: 96,
    height: 96,
    pieData: [],
}, {
    continent_code: 'middle_east',
    title: 'Middle East',
    longitude: 26.3842897,
    latitude: 26.8496363,
    width: 96,
    height: 96,
    pieData: [],
}];
