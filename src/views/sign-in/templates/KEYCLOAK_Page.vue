<template>
    <fragment />
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, defineComponent, getCurrentInstance, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import { PButton } from '@spaceone/design-system';
import { makeProxy } from '@/lib/compostion-util';
import Keycloak from 'keycloak-js';
import { store } from '@/store';

export default defineComponent({
    name: 'KeycloakPage',
    components: {
        PButton,
    },
    props: {
        visible: {
            type: Boolean,
            default: undefined,
        },
        nextPath: {
            type: String,
            default: '/',
        },
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const authOptions = vm.$store.state.domain.authOptions;
        const issuer = authOptions.issuer;
        const parsedIssuer = issuer.split('/');

        const authIndex = parsedIssuer.indexOf('auth');
        const baseUrl = parsedIssuer[authIndex - 1];
        const realmIndex = parsedIssuer.indexOf('realms');
        const realm = parsedIssuer[realmIndex + 1];

        const clientId = authOptions.client_id;


        const initOptions = {
            url: `https://${baseUrl}/auth`,
            realm,
            clientId,
        };
        const keycloak = Keycloak(initOptions);

        const signInFail = async () => {
            await vm.$router.push({ name: 'SignIn', query: { error: 'error' } });
            await keycloak.logout();
        };

        const signIn = async (userId, token) => {
            try {
                const credentials = {
                    // eslint-disable-next-line camelcase
                    access_token: token,
                };
                await store.dispatch('user/signIn', {
                    domainId: store.state.domain.domainId,
                    userId,
                    userType: 'USER',
                    credentials,
                });
                const hasPermission = vm.$store.getters['user/hasPermission'];
                if (!hasPermission && vm.$route.name !== 'userAccount') {
                    await vm.$router.replace({ name: 'userAccount' });
                } else await vm.$router.push(props.nextPath);
            } catch (e) {
                await signInFail();

                console.error(e);
            }
        };

        onMounted(async () => {
            keycloak.init({ onLoad: 'login-required' })
                .then(async (auth) => {
                    if (!auth) {
                        await signInFail();
                    }
                    if (keycloak.token && keycloak.idToken && keycloak.token !== '' && keycloak.idToken !== '') {
                        // @ts-ignore
                        await signIn(keycloak.tokenParsed.email, keycloak.token);
                    }
                })
                .catch((e) => {
                    console.error(e);
                });
        });
        return {
        };
    },
});
</script>

<style scoped>

</style>
