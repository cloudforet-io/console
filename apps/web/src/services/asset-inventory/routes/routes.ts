import type { RouteConfig } from 'vue-router';

import { upperCase } from 'lodash';

import { store } from '@/store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';

const AssetInventoryContainer = () => import('@/services/asset-inventory/AssetInventoryContainer.vue');

const CloudServiceDetailPage = () => import('@/services/asset-inventory/pages/CloudServiceDetailPage.vue');
const CloudServiceSearch = () => import('@/services/asset-inventory/pages/CloudServiceSearchPage.vue');
const CloudServiceTypeSearch = () => import('@/services/asset-inventory/pages/CloudServiceTypeSearchPage.vue');

const ServerPage = () => import('@/services/asset-inventory/pages/ServerPage.vue');
const CloudServicePage = () => import('@/services/asset-inventory/pages/CloudServicePage.vue');
const NoResourcePage = () => import('@/common/pages/NoResourcePage.vue');

const CollectorMainPage = () => import('@/services/asset-inventory/pages/CollectorMainPage.vue');
const CreateCollectorPage = () => import('@/services/asset-inventory/pages/CollectorCreatePage.vue');

const ServiceAccountPage = () => import('@/services/asset-inventory/pages/ServiceAccountPage.vue');
const ServiceAccountDetailPage = () => import('@/services/asset-inventory/pages/ServiceAccountDetailPage.vue');
const ServiceAccountAddPage = () => import('@/services/asset-inventory/pages/ServiceAccountAddPage.vue');
const ServiceAccountSearchPage = () => import('@/services/asset-inventory/pages/ServiceAccountSearchPage.vue');

const CollectorHistoryPage = () => import('@/services/asset-inventory/pages/CollectorHistoryPage.vue');
const CollectJobPage = () => import('@/services/asset-inventory/pages/CollectHistoryJobPage.vue');
const CollectorDetailPage = () => import('@/services/asset-inventory/pages/CollectorDetailPage.vue');

const assetInventoryRoute: RouteConfig = {
    path: 'asset-inventory',
    name: ASSET_INVENTORY_ROUTE._NAME,
    meta: { menuId: MENU_ID.ASSET_INVENTORY, accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
    redirect: () => getRedirectRouteByPagePermission(MENU_ID.ASSET_INVENTORY, store.getters['user/pagePermissionMap']),
    component: AssetInventoryContainer,
    children: [
        {
            path: 'cloud-service',
            meta: { menuId: MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                    meta: { lnbVisible: true },
                    component: CloudServicePage as any,
                },
                {
                    path: 'search/:searchKey/:id',
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.SEARCH._NAME,
                    props: true,
                    component: CloudServiceSearch,
                },
                {
                    path: 'type/search/:id',
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.TYPE_SEARCH._NAME,
                    props: true,
                    component: CloudServiceTypeSearch,
                },
                {
                    path: 'no-resource',
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.NO_RESOURCE._NAME,
                    meta: { lnbVisible: true, translationId: 'COMMON.ERROR.NO_RESOURCE_TITLE' },
                    component: NoResourcePage as any,
                },
                {
                    path: ':provider/:group',
                    meta: { label: ({ params }) => `[${upperCase(params.provider)}] ${params.group}` },
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: ':name?',
                            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                            meta: { lnbVisible: true, label: ({ params }) => params.name },
                            props: true,
                            component: CloudServiceDetailPage as any,
                        },
                    ],
                },
            ],
        },
        {
            path: 'server',
            name: ASSET_INVENTORY_ROUTE.SERVER._NAME,
            meta: { lnbVisible: true, menuId: MENU_ID.ASSET_INVENTORY_SERVER },
            component: ServerPage as any,
        },
        {
            path: 'collector',
            meta: { menuId: MENU_ID.ASSET_INVENTORY_COLLECTOR },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
                    meta: { lnbVisible: true },
                    props: true,
                    component: CollectorMainPage as any,
                },
                {
                    path: 'create',
                    name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME,
                    meta: { translationId: 'PLUGIN.COLLECTOR.CREATE.TITLE', accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION, centeredLayout: true },
                    component: CreateCollectorPage as any,
                },
                {
                    path: 'history',
                    meta: { translationId: 'MANAGEMENT.COLLECTOR_HISTORY.MAIN.TITLE' },
                    component: { template: '<keep-alive><router-view /></keep-alive>' },
                    children: [
                        {
                            path: '/',
                            name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME,
                            meta: { lnbVisible: true },
                            component: CollectorHistoryPage as any,
                        },
                        {
                            path: ':jobId',
                            name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME,
                            meta: { lnbVisible: true, label: ({ params }) => params.jobId, copiable: true },
                            props: true,
                            component: CollectJobPage as any,
                        },
                    ],
                },
                {
                    path: ':collectorId',
                    name: ASSET_INVENTORY_ROUTE.COLLECTOR.DETAIL._NAME,
                    props: true,
                    meta: { lnbVisible: true, label: ({ params }) => params.collectorId, copiable: true },
                    component: CollectorDetailPage as any,
                },
            ],
        },
        {
            path: 'service-account',
            meta: { menuId: MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
                    meta: { lnbVisible: true },
                    props: true,
                    component: ServiceAccountPage as any,
                },
                {
                    path: ':serviceAccountId',
                    name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME,
                    meta: { lnbVisible: true, label: ({ params }) => params.serviceAccountId },
                    props: true,
                    component: ServiceAccountDetailPage,
                },
                {
                    path: 'search/:id',
                    name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.SEARCH._NAME,
                    props: true,
                    component: ServiceAccountSearchPage,
                },
                {
                    path: 'add/:provider',
                    name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.ADD._NAME,
                    meta: { translationId: 'IDENTITY.SERVICE_ACCOUNT.ADD.TITLE', accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION },
                    props: true,
                    component: ServiceAccountAddPage as any,
                },
                {
                    path: 'no-resource',
                    name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.NO_RESOURCE._NAME,
                    meta: { lnbVisible: true, translationId: 'COMMON.ERROR.NO_RESOURCE_TITLE' },
                    component: NoResourcePage as any,
                },
            ],
        },
    ],
};
export default assetInventoryRoute;
