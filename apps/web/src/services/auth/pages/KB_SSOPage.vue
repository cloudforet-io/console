<template>
    <fragment />
</template>

<script lang="ts">
import type Vue from 'vue';
import {
    defineComponent, getCurrentInstance, onMounted,
} from 'vue';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { isUserAccessibleToRoute } from '@/lib/access-control';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { getDefaultRouteAfterSignIn } from '@/services/auth/helpers/default-route-helper';


export default defineComponent({
    name: 'KBSSOPage',
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
        const userWorkspaceStore = useUserWorkspaceStore();


        const onSignIn = async () => {
            const hasBoundWorkspace = userWorkspaceStore.getters.workspaceList.length > 0;
            const defaultRoute = getDefaultRouteAfterSignIn(hasBoundWorkspace);

            if (!props.nextPath) {
                await vm.$router.push(defaultRoute);
                return;
            }

            const resolvedRoute = SpaceRouter.router.resolve(props.nextPath);
            const isAccessible = isUserAccessibleToRoute(resolvedRoute.route, store.getters['user/isDomainAdmin'], store.getters['user/pageAccessPermissionList']);
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
