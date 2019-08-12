// const BaseHeader = () => import('@/containers/header/CTHD_001_Header');
import BaseHeader from '@/containers/header/CTHD_001_Header';
const IdentityMain = () => import('@/views/identity/IDNT_001_IdentityMain');
const User = () => import('@/views/identity/user/IDUS_001_User');
const Project = () => import('@//views/identity/project/IDPJ_001_Project');

export default {
    path: 'identity',
    name: 'identity',
    redirect: '/identity/project',
    meta: { label: 'Identity', requiresAuth: true },
    components: {
        header: BaseHeader,
        main: IdentityMain
    },
    children: [
        {
            path: 'project',
            name: 'project',
            meta: { label: 'Project', requiresAuth: true },
            component: Project
        },
        {
            path: 'user',
            name: 'user',
            meta: { label: 'User', requiresAuth: true },
            component: User
        }
    ]
};
