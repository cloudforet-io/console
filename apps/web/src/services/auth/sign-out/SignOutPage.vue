<template>
    <div>Sign Out..</div>
</template>
<script lang="ts">
import { useStore } from 'vuex';

import { SpaceRouter } from '@/router';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { AUTH_ROUTE } from '@/services/auth/route-config';

export default {
    name: 'SignOutPage',
    beforeRouteEnter(to) {
        (async () => {
            try {
                const store = useStore();
                const authType = store.state.domain.extendedAuthType;
                await loadAuth(authType).signOut();
                await store.dispatch('user/setIsSessionExpired', true);
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                await SpaceRouter.router.push({ name: AUTH_ROUTE.SIGN_IN._NAME, query: { ...to.query } });
            }
        })();
    },
};
</script>
