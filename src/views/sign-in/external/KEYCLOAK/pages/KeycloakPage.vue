<template>
    <fragment />
</template>

<script lang="ts">
import {
    ComponentRenderProxy, defineComponent, getCurrentInstance, onMounted,
} from '@vue/composition-api';
import { PButton } from '@spaceone/design-system';
import { loadAuth } from '@/views/sign-in/authenticator/loader';
import { IDENTITY_ROUTE } from '@/routes/identity/identity-route';

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
    beforeRouteEnter(to, from, next) {
        if (from?.meta.isSignInPage) {
            next((vm) => {
                vm.$router.replace({
                    query: { ...to.query, nextPath: from.query.nextPath },
                }).catch(() => {});
            });
        } else next();
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const onSignIn = async () => {
            await vm.$router.push(props.nextPath);
        };

        onMounted(async () => {
            await loadAuth('KEYCLOAK').signIn(onSignIn);
        });

    },
});
</script>

<style scoped>

</style>
