import { fluentApi } from '@/lib/fluent-api';

const Identity = () => import('@/views/identity/Identity');

const IdentityNavBar = () => import('@/views/identity/IdentityNavBar');
const User = () => import('@/views/identity/user/User');
const ServiceAccount = () => import('@/views/identity/service-account/pages/ServiceAccount');
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
        // {
        //     path: 'project',
        //     name: 'project',
        //     meta: { label: 'Project', breadcrumb: true },
        //     component: Project,
        // },
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
        {
            path: 'service-account',
            name: 'service-account',
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
                    component: ServiceAccount,
                },
                {
                    path: ':resourceId/tags',
                    name: 'serviceAccountTags',
                    meta: { label: 'tags' },
                    props: true,
                    component: TagsPage,
                },
            ],
        },
    ],
};
