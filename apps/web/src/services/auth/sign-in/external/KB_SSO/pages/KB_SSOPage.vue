<script lang="ts" setup>
import {
    onMounted,
} from 'vue';

import { isUserAccessibleToRoute } from '@/lib/access-control';

import { loadAuth } from '@/services/auth/authenticator/loader';
import {getDefaultRouteAfterSignIn} from "@/services/auth/lib/helper";
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

interface Props {
    secureToken: string;
    secureSessionId: string;
    resultCode: string;
    nextPath?: string;
}

const props = withDefaults(defineProps<Props>(), {
    secureToken: '',
    secureSessionId: '',
    resultCode: '',
    nextPath: undefined,
});
const router = useRouter();
const store = useStore();

const onSignIn = async () => {
    const defaultRoute = getDefaultRouteAfterSignIn(store.getters['user/isDomainOwner'], store.getters['user/hasSystemRole'], store.getters['user/hasPermission']);

    if (!props.nextPath) {
        await router.push(defaultRoute);
        return;
    }

    const resolvedRoute = router.resolve(props.nextPath);
    const isAccessible = isUserAccessibleToRoute(resolvedRoute, store.getters['user/pagePermissionList']);
    if (isAccessible) {
        await router.push(props.nextPath);
    } else {
        await router.push(defaultRoute);
    }
};

onMounted(async () => {
    const param = {
        secureToken: props.secureToken,
        secureSessionId: props.secureSessionId,
    };
    await loadAuth('KB_SSO').signIn(onSignIn, param);
});

</script>

<template>
    <template />
</template>
