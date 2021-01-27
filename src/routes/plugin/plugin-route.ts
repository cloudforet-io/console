import { RouteConfig } from 'vue-router';

const CollectorPage = () => import(/* webpackChunkName: "CollectorPage" */ '@/views/plugin/collector/pages/CollectorPage.vue');

const CollectorPluginPage = () => import(/* webpackChunkName: "CollectorPlugin" */ '@/views/plugin/collector/pages/CollectorPluginPage.vue');
const CreateCollectorPage = () => import(/* webpackChunkName: "CreateCollector" */ '@/views/plugin/collector/pages/CreateCollectorPage.vue');

export default {
    path: 'plugin',
    name: 'plugin',
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
                    name: 'collectorMain',
                    props: true,
                    component: CollectorPage,
                },
                {
                    path: 'create',
                    name: 'createCollector',
                    meta: { label: 'Create Collector' },
                    redirect: './create/plugins',
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: 'plugins',
                            name: 'collectorPlugins',
                            component: CollectorPluginPage,
                        },
                        {
                            path: 'collector-creator',
                            name: Symbol('collector-creator'),
                            // redirect: './plugins',
                            component: { template: '<router-view />' },
                            children: [
                                {
                                    path: ':pluginId',
                                    name: Symbol(':pluginId'),
                                    props: true,
                                    component: CreateCollectorPage,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
} as RouteConfig;
