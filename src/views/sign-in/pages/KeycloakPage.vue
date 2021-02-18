<template>
    <fragment />
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, defineComponent, getCurrentInstance, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import { PButton } from '@spaceone/design-system';
import { loadAuth } from '@/views/sign-in/lib/authenticator/loader';

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

        const onSignIn = async () => {
            const hasPermission = vm.$store.getters['user/hasPermission'];
            if (!hasPermission && vm.$route.name !== 'userAccount') {
                await vm.$router.replace({ name: 'userAccount' });
            } else await vm.$router.push(props.nextPath);
        };

        onMounted(async () => {
            await loadAuth('KEYCLOAK').signIn(onSignIn);
        });
        return {
        };
    },
});
</script>

<style scoped>

</style>
