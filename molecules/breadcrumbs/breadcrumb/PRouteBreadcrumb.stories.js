import { toRefs, reactive } from '@vue/composition-api';
import { object, number } from '@storybook/addon-knobs/vue';
import PRouteBreadcrumb from '@/components/molecules/breadcrumbs/breadcrumb/PRouteBreadcrumb.vue';
import md from '@/components/molecules/breadcrumbs/breadcrumb/PRouteBreadcrumb.md';


export default {
    title: 'molecules/breadcrumbs/RouteBreadcrumb',
    component: PRouteBreadcrumb,
    parameters: {
        notes: md,
        info: {
            summary: md,
            components: { PRouteBreadcrumb },
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
    components: { PRouteBreadcrumb },
    template: `<p-route-breadcrumb :current-idx="currentIdx"
                      :routes="routes"
        />`,
    setup() {
        return {
            ...toRefs(getState()),
        };
    },
});
