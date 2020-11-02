const Project = () => import('@/views/project/project/pages/ProjectPage');
const ProjectDetail = () => import('@/views/project/project/pages/ProjectDetail');

export const PROJECT_MAIN_PAGE_NAME = 'projectMain';
export const PROJECT_DETAIL_PAGE_NAME = 'projectDetail';
export default {
    path: 'project',
    meta: { label: 'Project' },
    component: { template: '<router-view />' },
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
    ],
};
