import { fluentApi } from '@/lib/fluent-api';

const AddServiceAccount = () => import('@/views/identity/service-account/pages/AddServiceAccount.vue');

const Identity = () => import('@/views/identity/Identity');

const IdentityNavBar = () => import('@/views/identity/IdentityNavBar');
const User = () => import('@/views/identity/user/User');
const ServiceAccount = () => import('@/views/identity/service-account/pages/ServiceAccount');
const ServiceAccountSearch = () => import('@/views/identity/service-account/pages/ServiceAccountSearch');
const TagsPage = () => import('@/views/common/tags/TagsPage.vue');

export default {
    path: 'identity',
    name: 'identity',
    redirect: '/identity/service-account',
    meta: { label: 'Identity', breadcrumb: true },
    components: {
        lnb: IdentityNavBar,
        main: Identity,
    },
    children: [
        {
            path: 'service-account',
            meta: {
                label: 'Service Account',
                breadcrumb: true,
                api: fluentApi.identity().serviceAccount(),
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: 'serviceAccount',
                    props: true,
                    component: ServiceAccount,
                },
                // {
                //     path: ':resourceId/tags',
                //     name: 'serviceAccountTags',
                //     meta: { label: 'tags' },
                //     props: true,
                //     component: TagsPage,
                // },
                {
                    path: 'search/:id',
                    name: 'serviceAccountSearch',
                    meta: {
                        label: 'search',
                    },
                    props: true,
                    component: ServiceAccountSearch,
                },
                {
                    path: 'add/:provider',
                    name: 'addServiceAccount',
                    meta: { label: 'Add Service Account' },
                    props: true,
                    component: AddServiceAccount,
                },
            ],
        },
        {
            path: 'user',
            name: 'user',
            meta: {
                label: 'User',
                breadcrumb: true,
                api: fluentApi.identity().user(),
            },
            redirect: '/identity/user',
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: 'userMain',
                    component: User,
                },
                {
                    path: ':resourceId/tags',
                    name: 'userTags',
                    props: true,
                    component: TagsPage,
                },
            ],
        },
    ],
};
