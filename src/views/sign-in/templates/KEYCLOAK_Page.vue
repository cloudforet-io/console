<template>
    <div>
        test
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, defineComponent, getCurrentInstance, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import { PButton } from '@spaceone/design-system';
import { makeProxy } from '@/lib/compostion-util';
import Keycloak from 'keycloak-js';

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
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
        });

        const signInFail = async () => {
        };

        const initOptions = {
            url: 'https://sso.stargate.spaceone.dev/auth/realms/SpaceOne/protocol/openid-connect/auth',
            realm: 'SpaceOne',
            clientId: 'keycloak-test-client-id',
        };
        onMounted(async () => {
            const keycloak = Keycloak(initOptions);

            keycloak.init({ onLoad: 'login-required' , flow: 'hybrid'}).then((auth) => {
                if (!auth) {
                    window.location.reload();
                } else {
                    console.log('Authenticated');
                }
            }).catch(() => {
                console.log('Failed');
            });
        });
        return {
            ...toRefs(state),
        };
    },
});
</script>

<style scoped>

</style>
