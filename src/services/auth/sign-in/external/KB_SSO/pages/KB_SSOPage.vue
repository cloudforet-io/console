<template>
    <fragment />
</template>

<script lang="ts">
import {
    defineComponent, getCurrentInstance, onMounted,
} from 'vue';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { isUserAccessibleToRoute } from '@/lib/access-control';

import { loadAuth } from '@/services/auth/authenticator/loader';
import {getDefaultRouteAfterSignIn} from "@/services/auth/lib/helper";


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
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;

        const onSignIn = async () => {
            const defaultRoute = getDefaultRouteAfterSignIn(store.getters['user/isDomainOwner'], store.getters['user/hasSystemRole'], store.getters['user/hasPermission']);

            if (!props.nextPath) {
                await vm.$router.push(defaultRoute);
                return;
            }

            const resolvedRoute = SpaceRouter.router.resolve(props.nextPath);
            const isAccessible = isUserAccessibleToRoute(resolvedRoute.route, store.getters['user/pagePermissionList']);
            if (isAccessible) {
                await vm.$router.push(props.nextPath);
            } else {
                await vm.$router.push(defaultRoute);
            }
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
