const Identity = () => import('@/views/identity/Identity.vue');
const IdentityNavBar = () => import('@/views/identity/IdentityNavBar.vue');

const User = () => import('@/views/identity/user/User.vue');
const Project = () => import('@//views/identity/project/Project.vue');

export default {
    path: 'identity',
    name: 'identity',
    redirect: '/identity/project',
    meta: { label: 'Identity', requiresAuth: true },
    components: {
        lnb: IdentityNavBar,
        main: Identity,
    },
    children: [
        {
            path: 'project',
            name: 'project',
            meta: { label: 'Project', requiresAuth: true, requireFNB: true },
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
