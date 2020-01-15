import {toRefs, reactive } from '@vue/composition-api';
import { object, number } from '@storybook/addon-knobs/vue';
import PBreadcrumb from './Breadcrumb.vue';
import md from './Breadcrumb.md';


export default {
    title: 'molecules/breadcrumbs/BreadcrumbItem',
    component: PBreadcrumb,
    parameters: {
        notes: md,
        info: {
            summary: md,
            components: { PBreadcrumb },
        },
    },
};

const routes = [
    {
        path: 'inventory',
        name: 'inventory',
        redirect: 'inventory/data-center',
        meta: { label: 'Inventory', breadcrumb: true },
        children: [
            {
                path: 'data-center',
                name: 'dataCenter',
                meta: { label: 'Data Center', breadcrumb: true },
            },
            {
                path: 'server',
                name: 'server',
                meta: { label: 'Server', breadcrumb: true },
            },
            {
                path: 'collector',
                name: 'collector',
                redirect: '/inventory/collector',
                meta: { label: 'Collector', breadcrumb: true },
                children: [
                    {
                        path: '/',
                        name: 'collectorMain',
                        meta: { label: '', requiresAuth: true },
                    },
                    {
                        path: 'create',
                        name: 'createCollector',
                        meta: { label: 'Create Collector', breadcrumb: true },
                        redirect: './create/plugins',
                        children: [
                            {
                                path: 'plugins',
                                name: 'collectorPlugins',
                                meta: { label: 'Plugins' },
                            },
                            {
                                path: 'collector-creator',
                                name: 'collectorCreator',
                                meta: { label: 'Collector Creator' },
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

const getState = () => reactive({
    currentIdx: number('currentIdx', 1),
    routes: object('routes', routes),
});

export const defaultCase = () => ({
    components: { PBreadcrumb },
    template: `<p-breadcrumb :current-idx="currentIdx"
                      :routes="routes"
        />`,
    setup() {
        return {
            ...toRefs(getState()),
        };
    },
});
