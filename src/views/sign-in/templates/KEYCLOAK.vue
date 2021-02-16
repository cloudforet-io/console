<template>
    <div class="keycloak-wrapper">
        <p-button
            style-type="primary1 outline"
            size="lg"
            @click="openKeycloakSignIn"
            class="keycloak-btn"
        >
            Sign In with Keycloak
        </p-button>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import { PButton } from '@spaceone/design-system';
import KeycloakPage from '@/views/sign-in/pages/KeycloakPage.vue';

export default defineComponent({
    name: 'KEYCLOAK',
    components: {
        PButton,
        KeycloakPage,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            keycloakVisible: false,
        });

        const openKeycloakSignIn = () => {
            vm.$router.push({ name: 'Keycloak' });
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
