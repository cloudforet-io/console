import { RouteConfig } from 'vue-router';

const CollectorPage = () => import(/* webpackChunkName: "CollectorPage" */ '@/services/plugin/collector/CollectorPage.vue');

const CollectorPluginPage = () => import(/* webpackChunkName: "CollectorPlugin" */ '@/services/plugin/collector/collector-plugins/CollectorPluginsPage.vue');
const CreateCollectorPage = () => import(/* webpackChunkName: "CreateCollector" */ '@/services/plugin/collector/create-collector/CreateCollectorPage.vue');

export const PLUGIN_ROUTE = Object.freeze({
    _NAME: 'plugin',
    COLLECTOR: {
        _NAME: 'collectorMain',
        CREATE: {
            _NAME: 'createCollector',
            PLUGINS: { _NAME: 'collectorPlugins' },
            STEPS: { _NAME: 'collectorCreateSteps' },
        },
    },
});

export default {
    path: 'plugin',
    name: PLUGIN_ROUTE._NAME,
    redirect: '/plugin/collector',
    meta: { label: 'Plugin' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'collector',
            meta: { label: 'Collector' },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: PLUGIN_ROUTE.COLLECTOR._NAME,
                    props: true,
                    component: CollectorPage,
                },
                {
                    path: 'create',
                    name: PLUGIN_ROUTE.COLLECTOR.CREATE._NAME,
                    meta: { label: 'Create Collector' },
                    redirect: './create/plugins',
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: 'plugins',
                            name: PLUGIN_ROUTE.COLLECTOR.CREATE.PLUGINS._NAME,
                            component: CollectorPluginPage,
                        },
                        {
                            path: 'create-collector/:pluginId',
                            name: PLUGIN_ROUTE.COLLECTOR.CREATE.STEPS._NAME,
                            props: true,
                            component: CreateCollectorPage,
                        },
                    ],
                },
            ],
        },
    ],
} as RouteConfig;
