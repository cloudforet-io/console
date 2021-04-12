import { RouteConfig } from 'vue-router';

const CloudServicePage = () => import(/* webpackChunkName: "CloudServicePage" */ '@/views/inventory/cloud-service/pages/CloudServicePage.vue');
const CloudServiceSearch = () => import(/* webpackChunkName: "CloudServiceSearch" */ '@/views/inventory/cloud-service/pages/CloudServiceSearch.vue');
const CloudServiceTypeSearch = () => import(/* webpackChunkName: "CloudServiceTypeSearch" */ '@/views/inventory/cloud-service/pages/CloudServiceTypeSearch.vue');

const Server = () => import(/* webpackChunkName: "Server" */ '@/views/inventory/server/pages/ServerPage.vue');
const CloudService = () => import(/* webpackChunkName: "CloudService" */ '@/views/inventory/cloud-service/pages/CloudServiceType.vue');
const NoResource = () => import(/* webpackChunkName: "NoResource" */ '@/common/pages/NoResource.vue');

export const INVENTORY_ROUTE = Object.freeze({
    SERVER: {
        MAIN: 'server',
    },
    CLOUD_SERVICE: {
        MAIN: 'cloudService',
        TYPE: 'cloudServiceMain',
        SEARCH: 'cloudServiceSearch',
        TYPE_SEARCH: 'cloudServiceTypeSearch',
        NO_RESOURCE: 'noCloudService',
        DETAIL: 'cloudServicePage',
    },
});

export default {
    path: 'inventory',
    name: 'inventory',
    redirect: 'inventory/server',
    meta: { label: 'Inventory' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'server',
            meta: {
                label: 'Server',
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: INVENTORY_ROUTE.SERVER.MAIN,
                    component: Server,
                },
            ],
        },
        {
            path: 'cloud-service',
            name: INVENTORY_ROUTE.CLOUD_SERVICE.MAIN,
            redirect: '/inventory/cloud-service',
            meta: { label: 'Cloud Service' },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: INVENTORY_ROUTE.CLOUD_SERVICE.TYPE,
                    component: CloudService,
                },
                {
                    path: 'search/:searchKey/:id',
                    name: INVENTORY_ROUTE.CLOUD_SERVICE.SEARCH,
                    meta: {
                        label: 'search',
                    },
                    props: true,
                    component: CloudServiceSearch,
                },
                {
                    path: 'type/search/:id',
                    name: INVENTORY_ROUTE.CLOUD_SERVICE.TYPE_SEARCH,
                    meta: {
                        label: 'search',
                    },
                    props: true,
                    component: CloudServiceTypeSearch,
                },
                {
                    path: 'no-resource',
                    name: INVENTORY_ROUTE.CLOUD_SERVICE.NO_RESOURCE,
                    component: NoResource,
                },
                {
                    path: ':provider/:group/:name',
                    props: true,
                    meta: {
                        label: 'Cloud Service',
                    },
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '/',
                            name: INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL,
                            props: true,
                            component: CloudServicePage,
                        },
                    ],
                },
            ],

        },
    ],
} as RouteConfig;
