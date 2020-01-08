const Secret = () => import('@/views/secret/Secret.vue');
const SecretNavBar = () => import('@/views/secret/SecretNavBar.vue');
const CredentialsGroup = () => import('@/views/secret/credentials-group/CredentialsGroup.vue');
const Credentials = () => import('@/views/secret/credentials/Credentials.vue');

export default {
    path: 'secret',
    name: 'secret',
    redirect: 'secret/credentials-group',
    meta: { label: 'Secret', requiresAuth: true },
    components: {
        lnb: SecretNavBar,
        main: Secret,
    },
    children: [
        {
            path: 'credentials-group',
            name: 'credentialsGroup',
            meta: { label: 'Credentials Group', requiresAuth: true },
            component: CredentialsGroup,
        },
        {
            path: 'credentials',
            name: 'credentials',
            meta: { label: 'Credentials', requiresAuth: true },
            component: Credentials,
        },
    ],
};
