const Secret = () => import('@/views/secret/Secret.vue');
const SecretNavBar = () => import('@/views/secret/SecretNavBar.vue');
const CredentialsGroup = () => import('@/views/secret/credentials-group/pages/CredentialsGroup.vue');
const Credentials = () => import('@/views/secret/credentials/Credentials.vue');
const AddCredentials = () => import('@/views/secret/credentials-group/pages/AddCredentials.vue');

export default {
    path: 'secret',
    name: 'secret',
    redirect: 'secret/credentials',
    meta: { label: 'Secret', breadcrumb: true },
    components: {
        lnb: SecretNavBar,
        main: Secret,
    },
    children: [
        {
            path: 'credentials-group',
            name: 'credentialsGroup',
            redirect: '/secret/credentials-group',
            meta: { label: 'Credentials Group', breadcrumb: true },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: 'credentialsGroupMain',
                    component: CredentialsGroup,
                },
                {
                    path: 'add/:id',
                    name: 'addCredentials',
                    meta: { label: 'Add Credentials' },
                    component: AddCredentials,
                    props: true,
                },
            ],
        },
        {
            path: 'credentials',
            name: 'credentials',
            meta: { label: 'Credentials', breadcrumb: true },
            component: Credentials,
        },
    ],
};
