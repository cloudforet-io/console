<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { getDefaultRouteAfterSignIn } from '@/services/auth/helpers/default-route-helper';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';



const route = useRoute();
const router = useRouter();

const userWorkspaceStore = useUserWorkspaceStore();

const handleSignIn = async () => {
    try {
        const hasBoundWorkspaces = userWorkspaceStore.getters.workspaceList.length > 0;
        const defaultRoute = getDefaultRouteAfterSignIn(hasBoundWorkspaces);
        await router.push(defaultRoute).catch(() => {});
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

onMounted(async () => {
    const { refresh_token } = route.query;
    if (!refresh_token) {
        loadAuth('SAML').signOut();
        router.push({ name: AUTH_ROUTE.SIGN_OUT._NAME });
        return;
    }
    try {
        await loadAuth('SAML').onSuccess(refresh_token);
        await handleSignIn();
    } catch (e) {
        loadAuth('SAML').signOut();
        router.push({ name: AUTH_ROUTE.SIGN_OUT._NAME });
    }
});


</script>
<template>
    <div>SAML Login...</div>
</template>
