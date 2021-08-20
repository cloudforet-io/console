<template>
<!--
 SSO 렌더링을 위한 마크업 작성(ex. SSO 버튼)
-->
</template>

<script lang="ts">
import { onMounted } from '@vue/composition-api';
import { loadAuth } from '@/views/sign-in/authenticator/loader';

export default {
    name: 'KBSignIn',
    setup(props, { context, emit }) {
        const onSignIn = () => {
            emit('sign-in');
        };

        const goToAdminSignIn = () => {
            emit('go-to-admin-sign-in');
        };

        onMounted(async () => {
            try {
                await loadAuth('KB_SSO').signIn(onSignIn);
            } catch (e) {
                context.emit('sign-in-error');
                console.error(e);
            }
        });
        return {
            goToAdminSignIn,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
