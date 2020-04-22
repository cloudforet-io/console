import { fluentApi } from '@/lib/fluent-api';

const ProjectNavBar = () => import('@/views/project/ProjectNavBar');
const Project = () => import('@//views/project/project/pages/Project2');
const ProjectDetail = () => import('@/views/project/project/pages/ProjectDetail');
const TagsPage = () => import('@/views/common/tags/TagsPage.vue');

export default {
    path: 'project',
    name: 'project',
    // redirect: '/project',
    meta: { label: 'Project', breadcrumb: true, api: fluentApi.identity().project() },
    components: {
        lnb: ProjectNavBar,
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
