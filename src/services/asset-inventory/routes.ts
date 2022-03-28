import { RouteConfig } from 'vue-router';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const CloudServiceDetailPage = () => import(/* webpackChunkName: "CloudServiceDetailPage" */ '@/services/asset-inventory/cloud-service/cloud-service-detail/CloudServiceDetailPage.vue');
const CloudServiceSearch = () => import(/* webpackChunkName: "CloudServiceSearch" */ '@/services/asset-inventory/cloud-service/cloud-service-search/CloudServiceSearchPage.vue');
const CloudServiceTypeSearch = () => import(/* webpackChunkName: "CloudServiceTypeSearch" */ '@/services/asset-inventory/cloud-service/cloud-service-type-search/CloudServiceTypeSearchPage.vue');

const Server = () => import(/* webpackChunkName: "Server" */ '@/services/asset-inventory/server/ServerPage.vue');
const CloudServicePage = () => import(/* webpackChunkName: "CloudServicePage" */ '@/services/asset-inventory/cloud-service/CloudServicePage.vue');
const NoResourcePage = () => import(/* webpackChunkName: "NoResourcePage" */ '@/common/pages/NoResourcePage.vue');

const CollectorPage = () => import(/* webpackChunkName: "CollectorPage" */ '@/services/asset-inventory/collector/CollectorPage.vue');
const CollectorPluginPage = () => import(/* webpackChunkName: "CollectorPlugin" */ '@/services/asset-inventory/collector/collector-plugins/CollectorPluginsPage.vue');
const CreateCollectorPage = () => import(/* webpackChunkName: "CreateCollector" */ '@/services/asset-inventory/collector/create-collector/CreateCollectorPage.vue');

const ServiceAccountPage = () => import(/* webpackChunkName: "ServiceAccountPage" */ '@/services/asset-inventory/service-account/ServiceAccountPage.vue');
const ServiceAccountAddPage = () => import(/* webpackChunkName: "ServiceAccountAddPage" */ '@/services/asset-inventory/service-account/service-account-add/ServiceAccountAddPage.vue');
const ServiceAccountSearchPage = () => import(/* webpackChunkName: "ServiceAccountSearchPage" */ '@/services/asset-inventory/service-account/service-account-search/ServiceAccountSearchPage.vue');

const CollectorHistoryPage = () => import(/* webpackChunkName: "CollectorHistory" */ '@/services/asset-inventory/collector-history/CollectorHistoryPage.vue');
const CollectJobPage = () => import(/* webpackChunkName: "CollectorHistory" */ '@/services/asset-inventory/collector-history/collect-job/CollectJobPage.vue');

export default {
    path: 'asset-inventory',
    name: ASSET_INVENTORY_ROUTE._NAME,
    redirect: 'asset-inventory/cloud-service',
    meta: { label: 'Asset Inventory' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'server',
            meta: { label: 'Server' },
            name: ASSET_INVENTORY_ROUTE.SERVER._NAME,
            component: Server,
        },
        {
            path: 'cloud-service',
            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
            redirect: '/asset-inventory/cloud-service',
            meta: { label: 'Cloud Service' },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.TYPE._NAME,
                    component: CloudServicePage,
                },
                {
                    path: 'search/:searchKey/:id',
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.SEARCH._NAME,
                    meta: {
                        label: 'search',
                    },
                    props: true,
                    component: CloudServiceSearch,
                },
                {
                    path: 'type/search/:id',
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.TYPE_SEARCH._NAME,
                    meta: {
                        label: 'search',
                    },
                    props: true,
                    component: CloudServiceTypeSearch,
                },
                {
                    path: 'no-resource',
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.NO_RESOURCE._NAME,
                    component: NoResourcePage,
                },
                {
                    path: ':provider/:group/:name?',
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                    props: true,
                    meta: { label: 'Cloud Service' },
                    component: CloudServiceDetailPage,
                },
            ],
        },
        {
            path: 'collector',
            meta: { label: 'Collector' },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
                    props: true,
                    component: CollectorPage,
                },
                {
                    path: 'create',
                    name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME,
                    meta: { label: 'Create Collector' },
                    redirect: '/create/plugins',
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: 'plugins',
                            name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE.PLUGINS._NAME,
                            component: CollectorPluginPage,
                        },
                        {
                            path: 'create-collector/:pluginId',
                            name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE.STEPS._NAME,
                            props: true,
                            component: CreateCollectorPage,
                        },
                    ],
                },
            ],
        },
        {
            path: 'service-account',
            meta: {
                label: 'Service Account',
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
                    props: true,
                    component: ServiceAccountPage,
                },
                {
                    path: 'search/:id',
                    name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.SEARCH._NAME,
                    meta: {
                        label: 'search',
                    },
                    props: true,
                    component: ServiceAccountSearchPage,
                },
                {
                    path: 'add/:provider',
                    name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.ADD._NAME,
                    meta: { label: 'Add Service Account' },
                    props: true,
                    component: ServiceAccountAddPage,
                },
                {
                    path: 'no-resource',
                    name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.NO_RESOURCE._NAME,
                    component: NoResourcePage,
                },
            ],
        },
        {
            path: 'collector-history',
            meta: { label: 'Collector History' },
            component: { template: '<keep-alive><router-view /></keep-alive>' },
            children: [
                {
                    path: '/',
                    name: ASSET_INVENTORY_ROUTE.COLLECTOR_HISTORY._NAME,
                    component: CollectorHistoryPage,
                },
                {
                    path: ':jobId',
                    name: ASSET_INVENTORY_ROUTE.COLLECTOR_HISTORY.JOB._NAME,
                    props: true,
                    component: CollectJobPage,
                },
            ],
        },
    ],
} as RouteConfig;
