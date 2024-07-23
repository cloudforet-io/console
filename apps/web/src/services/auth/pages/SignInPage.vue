<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent } from 'vue';

export default defineComponent({
    beforeRouteEnter(to, from, next) {
        if (from?.meta?.isSignInPage) {
            next((vm) => {
                vm.$router.replace({
                    query: { ...to.query, previousPath: from.query.previousPath, redirectPath: from.query.redirectPath },
                }).catch(() => {});
            });
        } else next();
    },
});
</script>

<script lang="ts" setup>
/* eslint-disable import/first */
// eslint-disable-next-line import/no-duplicates
import { reactive, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { SpaceRouter } from '@/router';
import { store } from '@/store';


import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { getLastAccessedWorkspaceId } from '@/lib/site-initializer/last-accessed-workspace';

import ErrorHandler from '@/common/composables/error/errorHandler';

import IDPWSignIn from '@/services/auth/authenticator/local/template/ID_PW.vue';
import SignInRightContainer from '@/services/auth/components/SignInRightContainer.vue';
import { getDefaultRouteAfterSignIn } from '@/services/auth/helpers/default-route-helper';
import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';

interface Props {
    previousPath?: string;
    redirectPath?: string;
}

const props = withDefaults(defineProps<Props>(), {
    previousPath: undefined,
    redirectPath: undefined,
});
const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();

const route = useRoute();
const router = useRouter();

const state = reactive({
    authType: computed(() => store.state.domain.extendedAuthType),
    beforeUser: store.state.user.userId,
    component: computed(() => {
        let component;
        const auth = state.authType;
        if (auth) {
            try {
                component = () => import(`../authenticator/external/${auth}/template/${auth}.vue`);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        }
        return component;
    }),
    showErrorMessage: route.query.error === 'error' || computed(() => store.state.display.isSignInFailed),
});

// Note: 아래 메서드는 모든 LoginPage(e.g. KeycloakPage, SAMLRedirectPage ...)에서 로그인 성공 이후 동일 적용되어야하는 핸들러입니다.
// Note: This method should be applied to all LoginPage (e.g. KeycloakPage, SAMLRedirectPage ...) after login success.
const onSignIn = async (userId:string) => {
    appContextStore.setGlobalGrantLoading(true);
    try {
        const isSameUserAsPreviouslyLoggedInUser = state.beforeUser === userId;
        const hasBoundWorkspaces = userWorkspaceStore.getters.workspaceList.length > 0;
        const defaultRoute = getDefaultRouteAfterSignIn(hasBoundWorkspaces);
        const lastAccessedWorkspaceId = await getLastAccessedWorkspaceId();

        if (props.redirectPath) {
            await router.push(router.resolve(props.redirectPath).location).catch(() => {
                router.push(defaultRoute).catch(() => {});
            });
            return;
        }

        if (!lastAccessedWorkspaceId) {
            await router.push({
                name: LANDING_ROUTE._NAME,
            });
            return;
        }
        if (!props.previousPath || !isSameUserAsPreviouslyLoggedInUser) {
            await router.push(defaultRoute).catch(() => {});
            return;
        }

        const resolvedRoute = router.resolve(props.previousPath);
        const allRoutes = SpaceRouter.router.getRoutes();

        const isValidRoute = allRoutes.some((route) => route.name === resolvedRoute.route.name);
        if (isValidRoute) {
            await router.push(resolvedRoute.location).catch(() => {});
        } else {
            await router.push(defaultRoute).catch(() => {});
        }
    } catch (e) {
        appContextStore.setGlobalGrantLoading(false);
        ErrorHandler.handleError(e);
    }
};

/* Watcher */
watch(() => route.query.error, (value) => {
    state.showErrorMessage = !!value;
});

watch(() => route.name, () => {
    store.dispatch('display/hideSignInErrorMessage');
}, { immediate: true });
</script>

<template>
    <sign-in-right-container
        class="sign-in-page-right-container"
        :show-error-message="state.showErrorMessage"
    >
        <template #input>
            <i-d-p-w-sign-in class="id-pw-wrapper"
                             @sign-in="onSignIn"
            />
            <div v-if="state.component"
                 class="btn-divider"
            >
                <span>{{ $t('COMMON.SIGN_IN.OR') }}</span>
            </div>
            <component :is="state.component"
                       class="sign-in-template"
                       @sign-in="onSignIn"
            />
        </template>
    </sign-in-right-container>
</template>

<style lang="postcss" scoped>
.sign-in-page-right-container {
    .id-pw-wrapper {
        margin-bottom: 1.5rem;
    }
    .btn-divider {
        @apply flex items-center text-gray-200 justify-center;
        flex-basis: 100%;
        font-size: 0.75rem;
        line-height: 120%;
        margin-bottom: 1.5rem;
        & span {
            @apply text-gray-900;
            margin: 0.5rem;
        }
        &::before, &::after {
            @apply bg-gray-300;
            content: "";
            width: 5.5rem;
            height: 1px;
        }
    }

    @media screen and (width < 478px) {
        .template-wrapper {
            width: 15rem;
            margin: auto 2.5rem;
            align-self: center;
            .right-logo-character {
                @apply mx-auto;
                display: block;
                width: 33%;
                margin-bottom: calc((15rem / 3) / 2 - 0.5rem);
            }
            .sign-in-title {
                display: none;
            }
            .sign-in-subtitle {
                display: none;
            }
        }
    }
}
</style>
