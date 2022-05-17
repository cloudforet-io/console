<template>
    <fragment />
</template>

<script lang="ts">
import {
    ComponentRenderProxy, defineComponent, getCurrentInstance, onMounted,
} from '@vue/composition-api';
import { PButton } from '@spaceone/design-system';
import { loadAuth } from '@/services/auth/authenticator/loader';
import { SpaceRouter } from '@/router';
import { isRouteAccessible } from '@/lib/access-control';
import { store } from '@/store';
import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';

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
            default: undefined,
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
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const onSignIn = async () => {
            if (!props.nextPath) {
                await vm.$router.push({ name: DASHBOARD_ROUTE._NAME });
                return;
            }

            const resolvedRoute = SpaceRouter.router.resolve(props.nextPath);
            const isAccessible = isRouteAccessible(resolvedRoute.route, store.getters['user/pagePermissionList']);
            if (isAccessible) {
                await vm.$router.push(props.nextPath);
            } else {
                await vm.$router.push({ name: DASHBOARD_ROUTE._NAME });
            }
        };

        onMounted(async () => {
            await loadAuth('KEYCLOAK').signIn(onSignIn);
        });
    },
});
</script>
