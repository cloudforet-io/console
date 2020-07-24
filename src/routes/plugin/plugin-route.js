import { fluentApi } from '@/lib/fluent-api';

const Plugin = () => import('@/views/plugin/plugin');
const PluginNavBar = () => import('@/views/plugin/pluginNavBar');

const Collector = () => import('@/views/plugin/collector/pages/Collector.vue');

const CollectorPlugins = () => import('@/views/plugin/collector/pages/CollectorPlugins.vue');
const CollectorCreator = () => import('@/views/plugin/collector/pages/CollectorCreator.vue');
const TagsPage = () => import('@/views/common/tags/TagsPage.vue');

export default {
    path: 'plugin',
    name: 'plugin',
    redirect: '/plugin/collector',
    meta: { label: 'Plugin', breadcrumb: true },
    components: {
        lnb: PluginNavBar,
        main: Plugin,
    },
    children: [
        {
            path: 'collector',
            name: 'collector',
            redirect: '/plugin/collector',
            meta: {
                label: 'Collector',
                breadcrumb: true,
                api: fluentApi.inventory().collector(),
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: 'collectorMain',
                    props: true,
                    component: Collector,
                },
                // {
                //     path: ':resourceId/tags',
                //     name: 'collectorTags',
                //     meta: { label: 'tags' },
                //     props: true,
                //     component: TagsPage,
                // },
                {
                    path: 'create',
                    name: 'createCollector',
                    meta: { label: 'Create Collector', breadcrumb: true },
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
