<template>
    <div>Sign Out..</div>
</template>
<script lang="ts">
import router from '@/routes/index';
import { store } from '@/store';
// @ts-ignore
const { gapi } = window;
export const getAuth2 = (clientId): Promise<any> => new Promise(((resolve, reject) => {
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
export const googleOauthSignOut = (auth2): Promise<void> => new Promise(((resolve, reject) => {
    auth2.signOut().then((resp) => {
        auth2.disconnect();
        resolve();
    }).catch(() => {
        reject(new Error('google oauth sign out error'));
    });
}));

export default {
    name: 'SignOut',
    props: {
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    beforeRouteEnter(to, from, next) {
        (async () => {
            // sign out
            const authType = store.state.domain.extendedAuthType;
            try {
                await router.app.$store.dispatch('user/signOut');
            } catch (e) {
                console.error('user sign out failed', e);
                next({ name: 'error' });
            }
            // google oauth disconnect
            if (authType !== undefined && authType === 'GOOGLE_OAUTH2') {
                try {
                    const auth2 = await getAuth2(router.app.$store.state.domain.authOptions.client_id);
                    await googleOauthSignOut(auth2);
                } catch (e) {
                    console.error('google oauth2 init/sign out failed', e);
                    next({ name: 'error' });
                }
            }
            // go sign in
            await router.push({ name: 'SignIn', query: { nextPath: from.fullPath } });
        })();
    },
};
</script>
