<template>
    <div>Sign Out..</div>
</template>
<script lang="ts">
import { SpaceRouter } from '@/router';

import { useDomainStore } from '@/store/domain/domain-store';
import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';

export default {
    name: 'SignOutPage',
    beforeRouteEnter(to) {
        (async () => {
            try {
                const domainStore = useDomainStore(pinia);
                const userStore = useUserStore(pinia);
                await loadAuth(domainStore.state.extendedAuthType).signOut();
                await userStore.setIsSessionExpired(true);
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                await SpaceRouter.router.push({ name: AUTH_ROUTE.SIGN_IN._NAME, query: { ...to.query } });
            }
        })();
    },
};
</script>
