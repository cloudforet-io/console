<template>
    <div class="keycloak-wrapper">
        <p-button @click="keycloakSignIn">
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
import { store } from '@/store';
import Keycloak from 'keycloak-js';

export default defineComponent({
    name: 'KEYCLOAK',
    components: {
        PButton,
    },
    setup(props, context) {
        const state = reactive({
            token: null,
            authenticated: false,
        });
        const vm = getCurrentInstance() as ComponentRenderProxy;


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
        const keycloakSignIn = async () => {
            const initOptions = {
                url: 'https://sso.stargate.spaceone.dev/auth',
                realm: 'SpaceOne',
                clientId: 'keycloak-test-client-id',
            };
            const keycloak = Keycloak(initOptions);
            keycloak.init({ onLoad: 'login-required' })
                .then((auth) => {
                    if (!auth) console.log('no auth');


                    const payload = {
                        idToken: keycloak.idToken,
                        accessToken: keycloak.token,
                    };
                    console.log(payload)

                    if (keycloak.token && keycloak.idToken && keycloak.token !== '' && keycloak.idToken !== '') {
                        store.dispatch('settings/setItem', {
                            key: 'login',
                            value: {
                                payload,
                            },
                            path: '/signIn',
                        });
                        console.log(`User has logged in: ${keycloak.subject}`);
                    }
                })
                .catch((e) => {
                    console.error(e);
                });
        };

        return {
            ...toRefs(state),
            goToAdminSignIn,
            signIn,
            keycloakSignIn,
        };
    },
});
</script>

<style lang="postcss" scoped>
</style>
