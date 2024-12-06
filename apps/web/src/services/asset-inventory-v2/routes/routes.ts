import type { RouteConfig } from 'vue-router';

import { upperCase } from 'lodash';

import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';

import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ACCOUNT_TYPE_BADGE_OPTION } from '@/services/asset-inventory-v2/constants/service-account-constant';
import { ASSET_INVENTORY_ROUTE_V2 } from '@/services/asset-inventory-v2/routes/route-constant';

const AssetInventoryContainer = () => import('@/services/asset-inventory-v2/AssetInventoryContainer.vue');

const CloudServiceDetailPage = () => import('@/services/asset-inventory-v2/pages/CloudServiceDetailPage.vue');
const CloudServiceSearch = () => import('@/services/asset-inventory-v2/pages/CloudServiceSearchPage.vue');
const CloudServiceTypeSearch = () => import('@/services/asset-inventory-v2/pages/CloudServiceTypeSearchPage.vue');

const CloudServicePage = () => import('@/services/asset-inventory-v2/pages/CloudServicePage.vue');
const NoResourcePage = () => import('@/common/pages/NoResourcePage.vue');

const MetricExplorerMainPage = () => import('@/services/asset-inventory-v2/pages/MetricExplorerMainPage.vue');
const MetricExplorerDetailPage = () => import('@/services/asset-inventory-v2/pages/MetricExplorerDetailPage.vue');

const CollectorMainPage = () => import('@/services/asset-inventory-v2/pages/CollectorMainPage.vue');
const CreateCollectorPage = () => import('@/services/asset-inventory-v2/pages/CollectorCreatePage.vue');

const ServiceAccountPage = () => import('@/services/asset-inventory-v2/pages/ServiceAccountPage.vue');
const ServiceAccountDetailPage = () => import('@/services/asset-inventory-v2/pages/ServiceAccountDetailPage.vue');
const ServiceAccountAddPage = () => import('@/services/asset-inventory-v2/pages/ServiceAccountAddPage.vue');

const CollectorHistoryPage = () => import('@/services/asset-inventory-v2/pages/CollectorHistoryPage.vue');
const CollectJobPage = () => import('@/services/asset-inventory-v2/pages/CollectHistoryJobPage.vue');
const CollectorDetailPage = () => import('@/services/asset-inventory-v2/pages/CollectorDetailPage.vue');

const userStore = useUserStore(pinia);

const assetInventoryRouteV2: RouteConfig = {
    path: 'asset-inventory',
    name: ASSET_INVENTORY_ROUTE_V2._NAME,
    meta: {
        menuId: MENU_ID.ASSET_INVENTORY,
        translationId: MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY].translationId,
    },
    redirect: (to) => getRedirectRouteByPagePermission(to, userStore.getters.pageAccessPermissionMap),
    component: AssetInventoryContainer,
    children: [
        {
            path: 'cloud-service',
            meta: { menuId: MENU_ID.CLOUD_SERVICE, translationId: MENU_INFO_MAP[MENU_ID.CLOUD_SERVICE].translationId },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ASSET_INVENTORY_ROUTE_V2.CLOUD_SERVICE._NAME,
                    meta: { lsbVisible: true, menuId: MENU_ID.CLOUD_SERVICE },
                    component: CloudServicePage as any,
                },
                {
                    path: 'search/:searchKey/:id',
                    name: ASSET_INVENTORY_ROUTE_V2.CLOUD_SERVICE.SEARCH._NAME,
                    props: true,
                    component: CloudServiceSearch,
                },
                {
                    path: 'type/search/:id',
                    name: ASSET_INVENTORY_ROUTE_V2.CLOUD_SERVICE.TYPE_SEARCH._NAME,
                    props: true,
                    component: CloudServiceTypeSearch,
                },
                {
                    path: 'no-resource',
                    name: ASSET_INVENTORY_ROUTE_V2.CLOUD_SERVICE.NO_RESOURCE._NAME,
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
                            name: ASSET_INVENTORY_ROUTE_V2.CLOUD_SERVICE.DETAIL._NAME,
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
                    name: ASSET_INVENTORY_ROUTE_V2.COLLECTOR._NAME,
                    meta: { menuId: MENU_ID.COLLECTOR },
                    props: true,
                    component: CollectorMainPage as any,
                },
                {
                    path: 'create',
                    name: ASSET_INVENTORY_ROUTE_V2.COLLECTOR.CREATE._NAME,
                    meta: { translationId: 'PLUGIN.COLLECTOR.CREATE.TITLE', centeredLayout: true },
                    component: CreateCollectorPage as any,
                },
                {
                    path: 'history',
                    meta: { translationId: 'MANAGEMENT.COLLECTOR_HISTORY.MAIN.TITLE' },
                    component: { template: '<keep-alive><router-view /></keep-alive>' },
                    children: [
                        {
                            path: '/',
                            name: ASSET_INVENTORY_ROUTE_V2.COLLECTOR.HISTORY._NAME,
                            component: CollectorHistoryPage as any,
                        },
                        {
                            path: ':jobId',
                            name: ASSET_INVENTORY_ROUTE_V2.COLLECTOR.HISTORY.JOB._NAME,
                            meta: { label: ({ params }) => params.jobId, copiable: true },
                            props: true,
                            component: CollectJobPage as any,
                        },
                    ],
                },
                {
                    path: ':collectorId',
                    name: ASSET_INVENTORY_ROUTE_V2.COLLECTOR.DETAIL._NAME,
                    props: true,
                    meta: { label: ({ params }) => params.collectorId, copiable: true },
                    component: CollectorDetailPage as any,
                },
            ],
        },
        {
            path: 'service-account',
            meta: { menuId: MENU_ID.SERVICE_ACCOUNT, translationId: MENU_INFO_MAP[MENU_ID.SERVICE_ACCOUNT].translationId },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ASSET_INVENTORY_ROUTE_V2.SERVICE_ACCOUNT._NAME,
                    meta: { menuId: MENU_ID.SERVICE_ACCOUNT },
                    props: true,
                    component: ServiceAccountPage as any,
                },
                {
                    path: 'no-resource',
                    name: ASSET_INVENTORY_ROUTE_V2.SERVICE_ACCOUNT.NO_RESOURCE._NAME,
                    meta: { translationId: 'COMMON.ERROR.NO_RESOURCE_TITLE' },
                    component: NoResourcePage as any,
                },
                {
                    path: ':serviceAccountId',
                    name: ASSET_INVENTORY_ROUTE_V2.SERVICE_ACCOUNT.DETAIL._NAME,
                    meta: { label: ({ params }) => params.serviceAccountId, copiable: true },
                    props: true,
                    component: ServiceAccountDetailPage,
                },
                {
                    path: 'add/:provider/:serviceAccountType',
                    name: ASSET_INVENTORY_ROUTE_V2.SERVICE_ACCOUNT.ADD._NAME,
                    meta: {
                        translationId: ({ params }) => (['IDENTITY.SERVICE_ACCOUNT.ADD.TITLE', {
                            type: ACCOUNT_TYPE_BADGE_OPTION[params.serviceAccountType].label,
                        }]),
                    },
                    props: true,
                    component: ServiceAccountAddPage as any,
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
                    name: ASSET_INVENTORY_ROUTE_V2.METRIC_EXPLORER._NAME,
                    meta: { menuId: MENU_ID.METRIC_EXPLORER, lsbVisible: true },
                    component: MetricExplorerMainPage as any,
                },
                {
                    path: ':metricId',
                    name: ASSET_INVENTORY_ROUTE_V2.METRIC_EXPLORER.DETAIL._NAME,
                    meta: { label: ({ params }) => params.metricId, lsbVisible: true },
                    props: true,
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '/',
                            name: ASSET_INVENTORY_ROUTE_V2.METRIC_EXPLORER.DETAIL._NAME,
                            meta: { label: ({ params }) => params.metricExampleId, lsbVisible: true },
                            props: true,
                            component: MetricExplorerDetailPage as any,
                        },
                        {
                            path: ':metricExampleId',
                            name: ASSET_INVENTORY_ROUTE_V2.METRIC_EXPLORER.DETAIL.EXAMPLE._NAME,
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
export default assetInventoryRouteV2;
