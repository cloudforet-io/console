const Collector = () => import('@/views/plugin/collector/pages/Collector.vue');

const CollectorPlugins = () => import('@/views/plugin/collector/pages/CollectorPlugins.vue');
const CollectorCreator = () => import('@/views/plugin/collector/pages/CollectorCreator.vue');

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
                    component: Collector,
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
                            component: CollectorPlugins,
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
                                    component: CollectorCreator,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
