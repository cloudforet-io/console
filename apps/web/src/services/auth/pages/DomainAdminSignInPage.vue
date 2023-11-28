<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent } from 'vue';

export default defineComponent({
    beforeRouteEnter(to, from, next) {
        if (from?.meta?.isSignInPage) {
            next((vm) => {
                vm.$router.replace({
                    query: { ...to.query, nextPath: from.query.nextPath },
                }).catch(() => {});
            });
        } else next();
    },
});
</script>

<script lang="ts" setup>
/* eslint-disable import/first */
// eslint-disable-next-line import/no-duplicates
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { isUserAccessibleToRoute } from '@/lib/access-control';

import ErrorHandler from '@/common/composables/error/errorHandler';

import IDPWSignIn from '@/services/auth/authenticator/local/template/ID_PW.vue';
import SignInRightContainer from '@/services/auth/components/SignInRightContainer.vue';
import { getDefaultRouteAfterSignIn } from '@/services/auth/helpers/default-route-helper';


interface Props {
    isDomainOwner: boolean;
    nextPath?: string;
}

const props = withDefaults(defineProps<Props>(), {
    isDomainOwner: false,
    nextPath: undefined,
});

const router = useRouter();

const state = reactive({
    showErrorMessage: computed(() => store.state.display.isSignInFailed),
});

const onSignIn = async () => {
    try {
        const defaultRoute = getDefaultRouteAfterSignIn(store.getters['user/isDomainOwner'], store.getters['user/hasSystemRole'], store.getters['user/hasPermission']);

        if (!props.nextPath) {
            await router.push(defaultRoute);
            return;
        }

        const resolvedRoute = SpaceRouter.router.resolve(props.nextPath);
        const isAccessible = isUserAccessibleToRoute(resolvedRoute.route, store.getters['user/pagePermissionList']);
        if (isAccessible) {
            await router.push(props.nextPath);
        } else {
            await router.push(defaultRoute);
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        await store.dispatch('display/showSignInErrorMessage');
    }
};
</script>

<template>
    <sign-in-right-container
        is-domain-owner
        :show-error-message="state.showErrorMessage"
    >
        <template #input>
            <i-d-p-w-sign-in class="local-sign-in-wrapper"
                             is-domain-owner
                             @sign-in="onSignIn"
            />
        </template>
    </sign-in-right-container>
</template>
