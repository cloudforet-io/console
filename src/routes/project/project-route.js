import { fluentApi } from '@/lib/fluent-api';

const Identity = () => import('@/views/identity/Identity');

const IdentityNavBar = () => import('@/views/identity/IdentityNavBar');
const User = () => import('@/views/identity/user/User');
const Project = () => import('@//views/identity/project/pages/Project2');
const ProjectDetail = () => import('@/views/identity/project/pages/ProjectDetail');
const ServiceAccount = () => import('@/views/identity/service-account/pages/ServiceAccount');
const TagsPage = () => import('@/views/common/tags/TagsPage.vue');

export default {
    path: 'project',
    name: 'project',
    // redirect: '/project',
    meta: { label: 'Project', breadcrumb: true, api: fluentApi.identity().project() },
    components: {
        lnb: IdentityNavBar,
        main: { template: '<router-view />' },
    },
    children: [
        {
            path: '/',
            name: 'projectMain',
            component: Project,
        },
        {
            path: ':id',
            name: 'projectDetail',
            props: true,
            component: ProjectDetail,
        },
        {
            path: ':resourceId/tags',
            name: 'projectTags',
            meta: { label: 'tags' },
            props: true,
            component: TagsPage,
        },
    ],
};
