<template>
    <div>Sign Out..</div>
</template>
<script lang="ts">
import router from '@/routes/index';
import { store } from '@/store';
// @ts-ignore
const { gapi } = window;
const getAuth2 = (clientId): Promise<any> => new Promise(((resolve, reject) => {
    if (!gapi.auth2) {
        gapi.load('auth2', (resp) => {
            gapi.auth2.init({
                // eslint-disable-next-line camelcase
                client_id: clientId,
                // eslint-disable-next-line camelcase
                fetch_basic_profile: false,
                scope: 'profile',
            }).then(() => {
                resolve(gapi.auth2.getAuthInstance());
            }).catch(() => {
                reject(new Error('Init error'));
            });
        });
    } else {
        resolve(gapi.auth2.getAuthInstance());
    }
}));
const googleOauthSignOut = (auth2): Promise<void> => new Promise(((resolve, reject) => {
    auth2.signOut().then((resp) => {
        auth2.disconnect();
        resolve();
    }).catch(() => {
        reject(new Error('google oauth sign out error'));
    });
}));
const getAuthSystem = async () => {
    let authSystem;
    if (store.state.user.userType === 'DOMAIN_OWNER') authSystem = 'ID_PW';
    else authSystem = store.state.domain.authSystem;
    return authSystem;
};
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
            // sign out
            const authSystem = await getAuthSystem();
            try {
                await router.app.$store.dispatch('user/signOut');
            } catch (e) {
                console.error('user sign out failed', e);
                next({ name: 'error' });
            }
            // google oauth disconnect
            if (authSystem === 'GOOGLE_OAUTH2') {
                try {
                    const auth2 = await getAuth2(router.app.$store.state.domain.authOptions.client_id);
                    await googleOauthSignOut(auth2);
                } catch (e) {
                    console.error('google oauth2 init/sign out failed', e);
                    next({ name: 'error' });
                }
            }
            // go sign in
            await router.push({ name: 'Login', query: { nextPath: from.fullPath } });
        })();
    },
};
</script>
