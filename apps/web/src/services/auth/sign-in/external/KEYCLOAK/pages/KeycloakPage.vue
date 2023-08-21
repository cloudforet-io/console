<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { SpaceRouter } from '@/router';

import { isUserAccessibleToRoute } from '@/lib/access-control';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/route-config';

const router = useRouter();

export default defineComponent({
    name: 'KeycloakPage',
    beforeRouteEnter(to, from, next) {
        if (from?.meta?.isSignInPage) {
            next((vm) => {
                vm.$router.replace({
                    query: { ...to.query, nextPath: from.query.nextPath },
                }).catch(() => {});
            });
        } else next();
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
    setup(props) {
        const store = useStore();

        const onSignIn = async () => {
            if (!props.nextPath) {
                await router.push({ name: HOME_DASHBOARD_ROUTE._NAME });
                return;
            }

            const resolvedRoute = SpaceRouter.router.resolve(props.nextPath);
            const isAccessible = isUserAccessibleToRoute(resolvedRoute.route, store.getters['user/pagePermissionList']);
            if (isAccessible) {
                await router.push(props.nextPath);
            } else {
                await router.push({ name: HOME_DASHBOARD_ROUTE._NAME });
            }
        };

        onMounted(async () => {
            await loadAuth('KEYCLOAK').signIn(onSignIn);
        });
    },
});
</script>
