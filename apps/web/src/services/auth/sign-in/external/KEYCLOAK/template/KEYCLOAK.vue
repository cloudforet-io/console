<script lang="ts" setup>
import { PButton } from '@spaceone/design-system';
import { useRouter } from 'vue-router';

import { AUTH_ROUTE } from '@/services/auth/route-config';

const router = useRouter();

const openKeycloakSignIn = () => {
    router.push({ name: AUTH_ROUTE.SIGN_IN.KEYCLOAK._NAME });
};

</script>

<template>
    <div class="keycloak-wrapper">
        <p-button style-type="secondary"
                  size="lg"
                  class="keycloak-btn"
                  @click="openKeycloakSignIn"
        >
            Sign In with Keycloak
        </p-button>
    </div>
</template>

<style lang="postcss" scoped>
.keycloak-btn {
    width: 100%;
}
</style>
