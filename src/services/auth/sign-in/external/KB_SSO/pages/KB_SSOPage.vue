<template>
    <fragment />
</template>

<script lang="ts">
import {
    ComponentRenderProxy, defineComponent, getCurrentInstance, onMounted,
} from '@vue/composition-api';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { isUserAccessibleToRoute } from '@/lib/access-control';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';


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
        const vm = getCurrentInstance()?.proxy as ComponentRenderProxy;

        const onSignIn = async () => {
            if (!props.nextPath) {
                await vm.$router.push({ name: DASHBOARD_ROUTE._NAME });
                return;
            }

            const resolvedRoute = SpaceRouter.router.resolve(props.nextPath);
            const isAccessible = isUserAccessibleToRoute(resolvedRoute.route, store.getters['user/pagePermissionList']);
            if (isAccessible) {
                await vm.$router.push(props.nextPath);
            } else {
                await vm.$router.push({ name: DASHBOARD_ROUTE._NAME });
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
