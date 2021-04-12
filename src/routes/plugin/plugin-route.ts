import { RouteConfig } from 'vue-router';

const CollectorPage = () => import(/* webpackChunkName: "CollectorPage" */ '@/views/plugin/collector/pages/CollectorPage.vue');

const CollectorPluginPage = () => import(/* webpackChunkName: "CollectorPlugin" */ '@/views/plugin/collector/pages/CollectorPluginPage.vue');
const CreateCollectorPage = () => import(/* webpackChunkName: "CreateCollector" */ '@/views/plugin/collector/pages/CreateCollectorPage.vue');

export const PLUGIN_ROUTE = Object.freeze({
    MAIN: 'plugin',
    COLLECTOR: {
        MAIN: 'collectorMain',
        CREATE: {
            MAIN: 'createCollector',
            PLUGINS: 'collectorPlugins',
            STEPS: 'collectorCreateSteps',
        },
    },
});

export default {
    path: 'plugin',
    name: PLUGIN_ROUTE.MAIN,
    redirect: '/plugin/collector',
    meta: { label: 'Plugin' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'collector',
            name: 'collector',
            redirect: '/plugin/collector',
            meta: {
                label: 'Collector',
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: PLUGIN_ROUTE.COLLECTOR.MAIN,
                    props: true,
                    component: CollectorPage,
                },
                {
                    path: 'create',
                    name: PLUGIN_ROUTE.COLLECTOR.CREATE.MAIN,
                    meta: { label: 'Create Collector' },
                    redirect: './create/plugins',
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: 'plugins',
                            name: PLUGIN_ROUTE.COLLECTOR.CREATE.PLUGINS,
                            component: CollectorPluginPage,
                        },
                        {
                            path: 'collector-creator/:pluginId',
                            name: PLUGIN_ROUTE.COLLECTOR.CREATE.STEPS,
                            component: CreateCollectorPage,
                        },
                    ],
                },
            ],
        },
    ],
} as RouteConfig;
