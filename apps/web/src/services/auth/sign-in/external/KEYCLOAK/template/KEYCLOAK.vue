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

<script lang="ts">
import {
    defineComponent, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PButton } from '@spaceone/design-system';

import { AUTH_ROUTE } from '@/services/auth/route-config';

export default defineComponent({
    name: 'KEYCLOAK',
    components: {
        PButton,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            keycloakVisible: false,
        });

        const openKeycloakSignIn = () => {
            vm.$router.push({ name: AUTH_ROUTE.SIGN_IN.KEYCLOAK._NAME });
        };
        return {
            openKeycloakSignIn,
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss" scoped>
.keycloak-btn {
    width: 100%;
}
</style>
