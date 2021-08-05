import { RouteConfig } from 'vue-router';

const CloudServicePage = () => import(/* webpackChunkName: "CloudServicePage" */ '@/views/inventory/cloud-service/pages/CloudServicePage.vue');
const CloudServiceSearch = () => import(/* webpackChunkName: "CloudServiceSearch" */ '@/views/inventory/cloud-service/pages/CloudServiceSearch.vue');
const CloudServiceTypeSearch = () => import(/* webpackChunkName: "CloudServiceTypeSearch" */ '@/views/inventory/cloud-service/pages/CloudServiceTypeSearch.vue');

const Server = () => import(/* webpackChunkName: "Server" */ '@/views/inventory/server/pages/ServerPage.vue');
const CloudService = () => import(/* webpackChunkName: "CloudService" */ '@/views/inventory/cloud-service/pages/CloudServiceType.vue');
const NoResource = () => import(/* webpackChunkName: "NoResource" */ '@/common/pages/NoResource.vue');

export const INVENTORY_ROUTE = Object.freeze({
    _NAME: 'inventory',
    SERVER: { _NAME: 'server' },
    CLOUD_SERVICE: {
        _NAME: 'cloudService',
        TYPE: { _NAME: 'cloudServiceMain' },
        SEARCH: { _NAME: 'cloudServiceSearch' },
        TYPE_SEARCH: { _NAME: 'cloudServiceTypeSearch' },
        NO_RESOURCE: { _NAME: 'noCloudService' },
        DETAIL: { _NAME: 'cloudServicePage' },
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
                    component: CloudService,
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
                    path: ':provider/:group/:name',
                    name: INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                    props: true,
                    meta: { label: 'Cloud Service' },
                    component: CloudServicePage,
                },
            ],

        },
    ],
} as RouteConfig;
