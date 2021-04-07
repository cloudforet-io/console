<template>
    <div>Sign Out..</div>
</template>
<script lang="ts">
import router from '@/routes';
import { store } from '@/store';
import { loadAuth } from '@/views/sign-in/lib/authenticator/loader';

export default {
    name: 'SignOut',
    props: {
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    beforeRouteEnter(to, from, next) {
        (async () => {
            try {
                const authType = store.state.domain.extendedAuthType;
                await loadAuth(authType).signOut();
            } catch (e) {
                console.error(e);
            } finally {
                await router.push({ name: 'SignIn', query: { ...to.query, nextPath: to.query.nextPath, error: to.query.error  }});
            }
        })();
    },
};
</script>
