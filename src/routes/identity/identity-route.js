const LNB = () => import('@/views/containers/lnb/LNB.template.vue');

const Identity = () => import('@/views/identity/Identity');
const User = () => import('@/views/identity/user/User');
const Project = () => import('@//views/identity/project/Project');

export default {
    path: 'identity',
    name: 'identity',
    redirect: '/identity/project',
    meta: { label: 'Identity', requiresAuth: true },
    components: {
        lnb: LNB,
        main: Identity,
    },
    children: [
        {
            path: 'project',
            name: 'project',
            meta: { label: 'Project', requiresAuth: true },
            component: Project,
        },
        {
            path: 'user',
            name: 'user',
            meta: { label: 'User', requiresAuth: true },
            component: User,
        },
    ],
};
