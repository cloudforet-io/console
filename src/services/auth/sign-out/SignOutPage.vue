<template>
    <div>Sign Out..</div>
</template>
<script lang="ts">
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { loadAuth } from '@/services/auth/authenticator/loader';
import { AUTH_ROUTE } from '@/services/auth/route-config';
import ErrorHandler from '@/common/composables/error/errorHandler';

export default {
    name: 'SignOutPage',
    props: {
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    beforeRouteEnter(to) {
        (async () => {
            try {
                const authType = store.state.domain.extendedAuthType;
                await loadAuth(authType).signOut();
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                await SpaceRouter.router.push({ name: AUTH_ROUTE.SIGN_IN._NAME, query: { ...to.query, nextPath: to.query.nextPath, error: to.query.error } });
            }
        })();
    },
};
</script>
