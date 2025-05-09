import type { RouteConfig } from 'vue-router';

import { upperCase } from 'lodash';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';

const AssetInventoryContainer = () => import('@/services/asset-inventory/AssetInventoryContainer.vue');

const CloudServiceDetailPage = () => import('@/services/asset-inventory/pages/CloudServiceDetailPage.vue');
const CloudServiceSearch = () => import('@/services/asset-inventory/pages/CloudServiceSearchPage.vue');
const CloudServiceTypeSearch = () => import('@/services/asset-inventory/pages/CloudServiceTypeSearchPage.vue');
const CloudServicePage = () => import('@/services/asset-inventory/pages/CloudServicePage.vue');
const NoResourcePage = () => import('@/common/pages/NoResourcePage.vue');

const ServerPage = () => import('@/services/asset-inventory/pages/ServerPage.vue');
const SecurityPage = () => import('@/services/asset-inventory/pages/SecurityPage.vue');

const MetricExplorerMainPage = () => import('@/services/asset-inventory/pages/MetricExplorerMainPage.vue');
const MetricExplorerDetailPage = () => import('@/services/asset-inventory/pages/MetricExplorerDetailPage.vue');

const AdminCollectorMainPage = () => import('@/services/asset-inventory/pages/admin/AdminCollectorMainPage.vue');
const AdminCollectorCreatePage = () => import('@/services/asset-inventory/pages/admin/AdminCollectorCreatePage.vue');
const AdminCollectorHistoryPage = () => import('@/services/asset-inventory/pages/admin/AdminCollectorHistoryPage.vue');
const AdminCollectHistoryJobPage = () => import('@/services/asset-inventory/pages/admin/AdminCollectHistoryJobPage.vue');
const AdminCollectorDetailPage = () => import('@/services/asset-inventory/pages/admin/AdminCollectorDetailPage.vue');


const adminAssetInventoryRoute: RouteConfig = {
    path: 'asset-inventory',
    name: ADMIN_ASSET_INVENTORY_ROUTE._NAME,
    meta: { menuId: MENU_ID.ASSET_INVENTORY, translationId: MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY].translationId },
    redirect: () => ({ name: ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME }),
    component: AssetInventoryContainer,
    children: [
        {
            path: 'cloud-service',
            meta: {
                menuId: MENU_ID.CLOUD_SERVICE,
                translationId: MENU_INFO_MAP[MENU_ID.CLOUD_SERVICE].translationId,
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                    meta: { lsbVisible: true },
                    component: CloudServicePage as any,
                },
                {
                    path: 'search/:searchKey/:id',
                    name: ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.SEARCH._NAME,
                    props: true,
                    component: CloudServiceSearch,
                },
                {
                    path: 'type/search/:id',
                    name: ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.TYPE_SEARCH._NAME,
                    props: true,
                    component: CloudServiceTypeSearch,
                },
                {
                    path: 'no-resource',
                    name: ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.NO_RESOURCE._NAME,
                    meta: { lsbVisible: true, translationId: 'COMMON.ERROR.NO_RESOURCE_TITLE' },
                    component: NoResourcePage as any,
                },
                {
                    path: ':provider/:group',
                    meta: { label: ({ params }) => `[${upperCase(params.provider)}] ${params.group}` },
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: ':name?',
                            name: ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                            meta: { lsbVisible: true, label: ({ params }) => params.name },
                            props: true,
                            component: CloudServiceDetailPage as any,
                        },
                    ],
                },
            ],
        },
        {
            path: 'server',
            name: ADMIN_ASSET_INVENTORY_ROUTE.SERVER._NAME,
            meta: { menuId: MENU_ID.SERVER, translationId: MENU_INFO_MAP[MENU_ID.SERVER].translationId },
            component: ServerPage as any,
        },
        {
            path: 'security',
            name: ADMIN_ASSET_INVENTORY_ROUTE.SECURITY._NAME,
            meta: { lsbVisible: true, menuId: MENU_ID.SECURITY, translationId: MENU_INFO_MAP[MENU_ID.SECURITY].translationId },
            component: SecurityPage as any,
            children: [
                {
                    path: ':provider/:group',
                    meta: { label: ({ params }) => `[${upperCase(params.provider)}] ${params.group}` },
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: ':name?',
                            name: ADMIN_ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME,
                            meta: { lsbVisible: true, label: ({ params }) => params.name },
                            props: true,
                            component: CloudServiceDetailPage as any,
                        },
                    ],
                },
            ],
        },
        {
            path: 'collector',
            meta: { menuId: MENU_ID.COLLECTOR, translationId: MENU_INFO_MAP[MENU_ID.COLLECTOR].translationId },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
                    props: true,
                    component: AdminCollectorMainPage as any,
                },
                {
                    path: 'create',
                    name: ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME,
                    meta: { translationId: 'PLUGIN.COLLECTOR.CREATE.TITLE', centeredLayout: true },
                    component: AdminCollectorCreatePage as any,
                },
                {
                    path: 'history',
                    meta: { translationId: 'MANAGEMENT.COLLECTOR_HISTORY.MAIN.TITLE' },
                    component: { template: '<keep-alive><router-view /></keep-alive>' },
                    children: [
                        {
                            path: '/',
                            name: ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME,
                            component: AdminCollectorHistoryPage as any,
                        },
                        {
                            path: ':jobId',
                            name: ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME,
                            meta: { label: ({ params }) => params.jobId, copiable: true },
                            props: true,
                            component: AdminCollectHistoryJobPage as any,
                        },
                    ],
                },
                {
                    path: ':collectorId',
                    name: ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR.DETAIL._NAME,
                    props: true,
                    meta: { label: ({ params }) => params.collectorId, copiable: true },
                    component: AdminCollectorDetailPage as any,
                },
            ],
        },
        {
            path: 'metric-explorer',
            meta: { menuId: MENU_ID.METRIC_EXPLORER, translationId: MENU_INFO_MAP[MENU_ID.METRIC_EXPLORER].translationId },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ADMIN_ASSET_INVENTORY_ROUTE.METRIC_EXPLORER._NAME,
                    meta: { menuId: MENU_ID.METRIC_EXPLORER, lsbVisible: true },
                    component: MetricExplorerMainPage as any,
                },
                {
                    path: ':metricId',
                    meta: { label: ({ params }) => params.metricId, lsbVisible: true },
                    props: true,
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '/',
                            name: ADMIN_ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                            meta: { label: ({ params }) => params.metricExampleId, lsbVisible: true },
                            props: true,
                            component: MetricExplorerDetailPage as any,
                        },
                    ],
                },
            ],
        },
    ],
};

export default adminAssetInventoryRoute;
