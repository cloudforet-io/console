<script lang="ts">
import { defineComponent } from 'vue';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { AUTH_ROUTE } from '@/services/auth/route-config';

export default defineComponent({
    name: 'SignOutPage',
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            (async () => {
                try {
                    const authType = vm.$store.state.domain.extendedAuthType;
                    await loadAuth(authType).signOut();
                    await vm.$store.dispatch('user/setIsSessionExpired', true);
                } catch (e) {
                    ErrorHandler.handleError(e);
                } finally {
                    vm.$router.push({ name: AUTH_ROUTE.SIGN_IN._NAME, query: { ...to.query } });
                }
            })();
        });
    },
});
</script>

<template>
    <div />
</template>
