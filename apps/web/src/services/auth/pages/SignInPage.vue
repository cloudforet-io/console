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
import { reactive, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { SpaceRouter } from '@/router';
import { store } from '@/store';


import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import IDPWSignIn from '@/services/auth/authenticator/local/template/ID_PW.vue';
import SignInRightContainer from '@/services/auth/components/SignInRightContainer.vue';
import { getDefaultRouteAfterSignIn } from '@/services/auth/helpers/default-route-helper';

interface Props {
    nextPath?: string;
}

const props = withDefaults(defineProps<Props>(), {
    nextPath: undefined,
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
const onSignIn = async (userId:string) => {
    appContextStore.setGlobalGrantLoading(true);
    try {
        const isSameUserAsPreviouslyLoggedInUser = state.beforeUser === userId;
        const hasBoundWorkspaces = userWorkspaceStore.getters.workspaceList.length > 0;
        const defaultRoute = getDefaultRouteAfterSignIn(hasBoundWorkspaces);

        if (!props.nextPath || !isSameUserAsPreviouslyLoggedInUser) {
            await router.push(defaultRoute).catch(() => {});
            return;
        }

        const resolvedRoute = router.resolve(props.nextPath);
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
        @apply flex items-center text-gray-200;
        flex-basis: 100%;
        font-size: 0.75rem;
        line-height: 120%;
        margin-bottom: 1.5rem;
        & span {
            @apply text-gray-900;
            margin: 0.5rem;
        }
        &::before, &::after {
            @apply bg-gray-200;
            content: "";
            flex-grow: 1;
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
