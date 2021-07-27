<template>
    <div>Sign Out..</div>
</template>
<script lang="ts">
import { SpaceRouter } from '@/routes';
import { store } from '@/store';
import { loadAuth } from '@/views/sign-in/authenticator/loader';
import { SIGN_IN_ROUTE } from '@/routes/sign-in/sign-in-route';

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
            try {
                const authType = store.state.domain.extendedAuthType;
                await loadAuth(authType).signOut();
            } catch (e) {
                console.error(e);
            } finally {
                // TODO: change from using SpaceRouter to next()
                await SpaceRouter.router.push({ name: SIGN_IN_ROUTE._NAME, query: { ...to.query, nextPath: to.query.nextPath, error: to.query.error } });
            }
        })();
    },
};
</script>
