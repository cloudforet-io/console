<template>
    <div className="google-oauth-wrapper">
        <p-button @click="openKeycloakSignIn">
            keycloak login
        </p-button>
        <KeycloakPage
            v-if="keycloakVisible"
            :visible="keycloakVisible"
            @confirm="onKeycloakConfirm"
            @cancel="hideKeycloakSignIn"
        />
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    defineComponent, getCurrentInstance, onMounted, reactive, toRefs,
} from '@vue/composition-api';

import { PButton } from '@spaceone/design-system';
import KeycloakPage from '@/views/sign-in/templates/KEYCLOAK_Page.vue';

import { getAuth2, googleOauthSignOut } from '@/views/common/pages/SignOut.vue';
import { store } from '@/store';

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
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const openKeycloakSignIn = () => {
            console.log('ete');
            state.keycloakVisible = true;
        };

        const hideKeycloakSignIn = () => {
            state.keycloakVisible = false;
        };

        const onKeycloakConfirm = async () => {
            hideKeycloakSignIn();
        }

        const signIn = async () => {
            const credentials = {
                // eslint-disable-next-line camelcase
            };
            // context.emit('on-sign-in', userId, credentials);
        };
        const signInFail = async () => {
        };
        const goToAdminSignIn = () => {
            // context.emit('go-to-admin-sign-in');
        };

        return {
            ...toRefs(state),
            goToAdminSignIn,
            signIn,
            openKeycloakSignIn,
            onKeycloakConfirm,
            hideKeycloakSignIn,
        };
    },
});
</script>

<style lang="postcss" scoped>
</style>
