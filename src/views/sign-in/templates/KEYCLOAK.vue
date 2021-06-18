<template>
    <div class="keycloak-wrapper">
        <p-button
            style-type="primary1 outline"
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
    defineComponent, reactive, toRefs,
} from '@vue/composition-api';

import { PButton } from '@spaceone/design-system';
import KeycloakPage from '@/views/sign-in/pages/KeycloakPage.vue';
import { SIGN_IN_ROUTE } from '@/routes/sign-in/sign-in-route';
import router from '@/routes';

export default defineComponent({
    name: 'KEYCLOAK',
    components: {
        PButton,
        KeycloakPage,
    },
    setup(props, context) {
        const state = reactive({
            keycloakVisible: false,
        });

        const openKeycloakSignIn = () => {
            router.push({ name: SIGN_IN_ROUTE.KEYCLOAK._NAME });
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
