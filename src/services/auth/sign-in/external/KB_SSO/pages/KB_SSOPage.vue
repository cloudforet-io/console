<template>
    <fragment />
</template>

<script lang="ts">
import {
    ComponentRenderProxy, defineComponent, getCurrentInstance, onMounted,
} from '@vue/composition-api';
import { loadAuth } from '@/services/auth/authenticator/loader';

export default defineComponent({
    name: 'KB_SSOPage',
    components: {
    },
    props: {
        secureToken: {
            type: String,
            default: '',
        },
        secureSessionId: {
            type: String,
            default: '',
        },
        resultCode: {
            type: String,
            default: '',
        },
        nextPath: {
            type: String,
            default: '/',
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const onSignIn = async () => {
            await vm.$router.push(props.nextPath);
        };

        onMounted(async () => {
            const param = {
                secureToken: props.secureToken,
                secureSessionId: props.secureSessionId,
            };
            await loadAuth('KB_SSO').signIn(onSignIn, param);
        });
    },
});
</script>

<style scoped>

</style>
