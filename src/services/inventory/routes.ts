import { RouteConfig } from 'vue-router';

const CloudServiceDetailPage = () => import(/* webpackChunkName: "CloudServiceDetailPage" */ '@/services/inventory/cloud-service/cloud-service-detail/CloudServiceDetailPage.vue');
const CloudServiceSearch = () => import(/* webpackChunkName: "CloudServiceSearch" */ '@/services/inventory/cloud-service/cloud-service-search/CloudServiceSearchPage.vue');
const CloudServiceTypeSearch = () => import(/* webpackChunkName: "CloudServiceTypeSearch" */ '@/services/inventory/cloud-service/cloud-service-type-search/CloudServiceTypeSearchPage.vue');

const Server = () => import(/* webpackChunkName: "Server" */ '@/services/inventory/server/ServerPage.vue');
const CloudServicePage = () => import(/* webpackChunkName: "CloudServicePage" */ '@/services/inventory/cloud-service/CloudServicePage.vue');
const NoResource = () => import(/* webpackChunkName: "NoResource" */ '@/common/pages/NoResourcePage.vue');

export const INVENTORY_ROUTE = Object.freeze({
    _NAME: 'inventory',
    SERVER: { _NAME: 'server' },
    CLOUD_SERVICE: {
        _NAME: 'cloudService',
        TYPE: { _NAME: 'cloudServiceMain' },
        SEARCH: { _NAME: 'cloudServiceSearch' },
        TYPE_SEARCH: { _NAME: 'cloudServiceTypeSearch' },
        NO_RESOURCE: { _NAME: 'noCloudService' },
        DETAIL: { _NAME: 'cloudServiceDetail' },
    },
});

export default {
    path: 'inventory',
    name: INVENTORY_ROUTE._NAME,
    redirect: 'inventory/cloud-service',
    meta: { label: 'Inventory' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'server',
            meta: { label: 'Server' },
            name: INVENTORY_ROUTE.SERVER._NAME,
            component: Server,
        },
        {
            path: 'cloud-service',
            name: INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
            redirect: '/inventory/cloud-service',
            meta: { label: 'Cloud Service' },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: INVENTORY_ROUTE.CLOUD_SERVICE.TYPE._NAME,
                    component: CloudServicePage,
                },
                {
                    path: 'search/:searchKey/:id',
                    name: INVENTORY_ROUTE.CLOUD_SERVICE.SEARCH._NAME,
                    meta: {
                        label: 'search',
                    },
                    props: true,
                    component: CloudServiceSearch,
                },
                {
                    path: 'type/search/:id',
                    name: INVENTORY_ROUTE.CLOUD_SERVICE.TYPE_SEARCH._NAME,
                    meta: {
                        label: 'search',
                    },
                    props: true,
                    component: CloudServiceTypeSearch,
                },
                {
                    path: 'no-resource',
                    name: INVENTORY_ROUTE.CLOUD_SERVICE.NO_RESOURCE._NAME,
                    component: NoResource,
                },
                {
                    path: ':provider/:group/:name?',
                    name: INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                    props: true,
                    meta: { label: 'Cloud Service' },
                    component: CloudServiceDetailPage,
                },
            ],

        },
    ],
} as RouteConfig;
