<template>
    <div class="keycloak-wrapper">
        <p-button @click="openKeycloakSignIn">
            keycloak login
        </p-button>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    defineComponent, getCurrentInstance, onMounted, reactive, toRefs,
} from '@vue/composition-api';

import { PButton } from '@spaceone/design-system';
import KeycloakPage from '@/views/sign-in/templates/KEYCLOAK_Page.vue';
import {store} from "@/store";

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
</style>
