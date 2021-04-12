import { RouteConfig } from 'vue-router';

const Project = () => import(/* webpackChunkName: "ProjectPage" */ '@/views/project/project/pages/ProjectPage.vue');
const ProjectDetail = () => import(/* webpackChunkName: "ProjectDetail" */ '@/views/project/project/pages/ProjectDetail.vue');

export const PROJECT_ROUTE = Object.freeze({
    MAIN: 'projectMain',
    DETAIL: 'projectDetail',
});

export default {
    path: 'project',
    meta: { label: 'Project' },
    component: { template: '<router-view />' },
    children: [
        {
            path: '/',
            name: PROJECT_ROUTE.MAIN,
            props: true,
            component: Project,
        },
        {
            path: ':id',
            name: PROJECT_ROUTE.DETAIL,
            props: true,
            component: ProjectDetail,
        },
    ],
} as RouteConfig;
