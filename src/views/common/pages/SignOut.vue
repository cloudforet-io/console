<template>
    <div>Sign Out..</div>
</template>

<script lang="ts">
import { store } from '@/store';
import router from '@/routes/index';
// @ts-ignore
const { gapi } = window;

export default {
    name: 'SignOut',
    props: {
        authSystem: {
            type: String,
            default: undefined,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    beforeRouteEnter(to, from, next) {
        (async () => {
            try {
                if (to.params.authSystem === 'GOOGLE_OAUTH2') {
                    await store.dispatch('user/signOut');
                    if (!gapi.auth2) {
                        gapi.load('auth2', () => {
                            gapi.auth2.init();
                        });
                    }
                    const auth2 = gapi.auth2.getAuthInstance();
                    auth2.signOut().then(() => {
                        auth2.disconnect();
                    });
                }
                if (to.params.authSystem === 'ID_PW') {
                    await store.dispatch('user/signOut');
                }
                const routerMeta: any = {
                    name: 'Login',
                    meta: { excludeAuth: true },
                };
                if (router && router.currentRoute.path) {
                    routerMeta.query = { nextPath: router.currentRoute.path };
                }
                if (router) {
                    await router.push(routerMeta);
                }
            } catch (e) {
                next({ name: 'error' });
            }
        })();
    },
};
</script>
