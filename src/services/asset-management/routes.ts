import { RouteConfig } from 'vue-router';
import { ASSET_MANAGEMENT_ROUTE } from '@/services/asset-management/route-config';

const CloudServiceDetailPage = () => import(/* webpackChunkName: "CloudServiceDetailPage" */ '@/services/asset-management/cloud-service/cloud-service-detail/CloudServiceDetailPage.vue');
const CloudServiceSearch = () => import(/* webpackChunkName: "CloudServiceSearch" */ '@/services/asset-management/cloud-service/cloud-service-search/CloudServiceSearchPage.vue');
const CloudServiceTypeSearch = () => import(/* webpackChunkName: "CloudServiceTypeSearch" */ '@/services/asset-management/cloud-service/cloud-service-type-search/CloudServiceTypeSearchPage.vue');

const Server = () => import(/* webpackChunkName: "Server" */ '@/services/asset-management/server/ServerPage.vue');
const CloudServicePage = () => import(/* webpackChunkName: "CloudServicePage" */ '@/services/asset-management/cloud-service/CloudServicePage.vue');
const NoResourcePage = () => import(/* webpackChunkName: "NoResourcePage" */ '@/common/pages/NoResourcePage.vue');

const CollectorPage = () => import(/* webpackChunkName: "CollectorPage" */ '@/services/asset-management/collector/CollectorPage.vue');
const CollectorPluginPage = () => import(/* webpackChunkName: "CollectorPlugin" */ '@/services/asset-management/collector/collector-plugins/CollectorPluginsPage.vue');
const CreateCollectorPage = () => import(/* webpackChunkName: "CreateCollector" */ '@/services/asset-management/collector/create-collector/CreateCollectorPage.vue');

const ServiceAccountPage = () => import(/* webpackChunkName: "ServiceAccountPage" */ '@/services/asset-management/service-account/ServiceAccountPage.vue');
const ServiceAccountAddPage = () => import(/* webpackChunkName: "ServiceAccountAddPage" */ '@/services/asset-management/service-account/service-account-add/ServiceAccountAddPage.vue');
const ServiceAccountSearchPage = () => import(/* webpackChunkName: "ServiceAccountSearchPage" */ '@/services/asset-management/service-account/service-account-search/ServiceAccountSearchPage.vue');

const CollectorHistoryPage = () => import(/* webpackChunkName: "CollectorHistory" */ '@/services/asset-management/collector-history/CollectorHistoryPage.vue');
const CollectJobPage = () => import(/* webpackChunkName: "CollectorHistory" */ '@/services/asset-management/collector-history/collect-job/CollectJobPage.vue');

export default {
    path: 'inventory',
    name: ASSET_MANAGEMENT_ROUTE._NAME,
    redirect: 'inventory/cloud-service',
    meta: { label: 'Inventory' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'server',
            meta: { label: 'Server' },
            name: ASSET_MANAGEMENT_ROUTE.SERVER._NAME,
            component: Server,
        },
        {
            path: 'cloud-service',
            name: ASSET_MANAGEMENT_ROUTE.CLOUD_SERVICE._NAME,
            redirect: '/inventory/cloud-service',
            meta: { label: 'Cloud Service' },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ASSET_MANAGEMENT_ROUTE.CLOUD_SERVICE.TYPE._NAME,
                    component: CloudServicePage,
                },
                {
                    path: 'search/:searchKey/:id',
                    name: ASSET_MANAGEMENT_ROUTE.CLOUD_SERVICE.SEARCH._NAME,
                    meta: {
                        label: 'search',
                    },
                    props: true,
                    component: CloudServiceSearch,
                },
                {
                    path: 'type/search/:id',
                    name: ASSET_MANAGEMENT_ROUTE.CLOUD_SERVICE.TYPE_SEARCH._NAME,
                    meta: {
                        label: 'search',
                    },
                    props: true,
                    component: CloudServiceTypeSearch,
                },
                {
                    path: 'no-resource',
                    name: ASSET_MANAGEMENT_ROUTE.CLOUD_SERVICE.NO_RESOURCE._NAME,
                    component: NoResourcePage,
                },
                {
                    path: ':provider/:group/:name?',
                    name: ASSET_MANAGEMENT_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
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
                    name: ASSET_MANAGEMENT_ROUTE.COLLECTOR._NAME,
                    props: true,
                    component: CollectorPage,
                },
                {
                    path: 'create',
                    name: ASSET_MANAGEMENT_ROUTE.COLLECTOR.CREATE._NAME,
                    meta: { label: 'Create Collector' },
                    redirect: './create/plugins',
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: 'plugins',
                            name: ASSET_MANAGEMENT_ROUTE.COLLECTOR.CREATE.PLUGINS._NAME,
                            component: CollectorPluginPage,
                        },
                        {
                            path: 'create-collector/:pluginId',
                            name: ASSET_MANAGEMENT_ROUTE.COLLECTOR.CREATE.STEPS._NAME,
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
                    name: ASSET_MANAGEMENT_ROUTE.SERVICE_ACCOUNT._NAME,
                    props: true,
                    component: ServiceAccountPage,
                },
                {
                    path: 'search/:id',
                    name: ASSET_MANAGEMENT_ROUTE.SERVICE_ACCOUNT.SEARCH._NAME,
                    meta: {
                        label: 'search',
                    },
                    props: true,
                    component: ServiceAccountSearchPage,
                },
                {
                    path: 'add/:provider',
                    name: ASSET_MANAGEMENT_ROUTE.SERVICE_ACCOUNT.ADD._NAME,
                    meta: { label: 'Add Service Account' },
                    props: true,
                    component: ServiceAccountAddPage,
                },
                {
                    path: 'no-resource',
                    name: ASSET_MANAGEMENT_ROUTE.SERVICE_ACCOUNT.NO_RESOURCE._NAME,
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
                    name: ASSET_MANAGEMENT_ROUTE.HISTORY.COLLECTOR._NAME,
                    component: CollectorHistoryPage,
                },
                {
                    path: ':jobId',
                    name: ASSET_MANAGEMENT_ROUTE.HISTORY.COLLECTOR.JOB._NAME,
                    props: true,
                    component: CollectJobPage,
                },
            ],
        },
    ],
} as RouteConfig;
