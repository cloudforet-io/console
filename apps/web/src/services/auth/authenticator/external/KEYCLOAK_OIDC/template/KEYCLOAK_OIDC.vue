<template>
    <div class="keycloak-wrapper">
        <p-button style-type="secondary"
                  size="lg"
                  class="keycloak-btn"
                  @click="openKeycloakSignIn"
        >
            {{ $t('COMMON.SIGN_IN.BUTTON_LABEL', {
                idp: 'Keycloak',
            }) }}
        </p-button>
    </div>
</template>

<script lang="ts">
import {
    defineComponent, reactive, toRefs,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { PButton } from '@cloudforet/mirinae';

import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';



export default defineComponent({
    name: 'KEYCLOAKODIC',
    components: {
        PButton,
    },
    setup() {
        const router = useRouter();
        const state = reactive({
            keycloakVisible: false,
        });

        const openKeycloakSignIn = () => {
            router.push({ name: AUTH_ROUTE.SIGN_IN.KEYCLOAK._NAME });
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
