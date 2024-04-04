<template>
    <fragment />
</template>

<script lang="ts">
import {
    defineComponent, onMounted,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceRouter } from '@/router';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

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
        const userWorkspaceStore = useUserWorkspaceStore();
        const appContextStore = useAppContextStore();
        const router = useRouter();

        const onSignIn = async () => {
            appContextStore.setGlobalGrantLoading(true);
            try {
                const hasBoundWorkspaces = userWorkspaceStore.getters.workspaceList.length > 0;
                const defaultRoute = getDefaultRouteAfterSignIn(hasBoundWorkspaces);

                if (!props.nextPath) {
                    await router.push(defaultRoute);
                    return;
                }

                const resolvedRoute = router.resolve(props.nextPath);
                const allRoutes = SpaceRouter.router.getRoutes();

                const isValidRoute = allRoutes.some((route) => route.name === resolvedRoute.route.name);
                if (isValidRoute) {
                    await router.push(resolvedRoute.location);
                } else {
                    await router.push(defaultRoute);
                }
            } catch (e) {
                appContextStore.setGlobalGrantLoading(false);
                ErrorHandler.handleError(e);
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
