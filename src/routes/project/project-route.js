import { fluentApi } from '@/lib/fluent-api';

const ProjectNavBar = () => import('@/views/project/ProjectNavBar');
const Project = () => import('@/views/project/project/pages/ProjectPage');
const ProjectDetail = () => import('@/views/project/project/pages/ProjectDetail');
const TagsPage = () => import('@/views/common/tags/TagsPage.vue');

export const PROJECT_MAIN_PAGE_NAME = 'projectMain';
export const PROJECT_DETAIL_PAGE_NAME = 'projectDetail';
export const PROJECT_TAG_PAGE_NAME = 'projectTags';
export default {
    path: 'project',
    meta: { label: 'Project', breadcrumb: true, api: fluentApi.identity().project() },
    components: {
        lnb: ProjectNavBar,
        main: { template: '<router-view />' },
    },
    children: [
        {
            path: '/',
            name: PROJECT_MAIN_PAGE_NAME,
            props: true,
            component: Project,
        },
        {
            path: ':id',
            name: PROJECT_DETAIL_PAGE_NAME,
            props: true,
            component: ProjectDetail,
        },
        // {
        //     path: ':resourceId/tags',
        //     name: PROJECT_TAG_PAGE_NAME,
        //     meta: { label: 'tags' },
        //     props: true,
        //     component: TagsPage,
        // },
    ],
};
