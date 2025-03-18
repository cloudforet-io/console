<script setup lang="ts">
import Vue, { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { throttle } from 'lodash';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { ROOT_ROUTE } from '@/router/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { getLastAccessedWorkspaceId } from '@/lib/site-initializer/last-accessed-workspace';

import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';

const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;
const router = useRouter();

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    globalGrantLoading: computed(() => appContextStore.getters.globalGrantLoading),
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
    loading: false,
});
const handleToggleAdminMode = throttle(async () => {
    state.loading = true;
    if (state.globalGrantLoading) {
        state.loading = false;
        return;
    }
    appContextStore.setGlobalGrantLoading(true);
    if (state.isAdminMode) {
        await userWorkspaceStore.load();
        if (state.workspaceList.length === 0) {
            await router.push({ name: LANDING_ROUTE.DOMAIN._NAME });
            return;
        }
        appContextStore.exitAdminMode();
        const lastAccessedWorkspaceId = await getLastAccessedWorkspaceId();
        if (lastAccessedWorkspaceId) {
            await router.push({
                name: ROOT_ROUTE.WORKSPACE._NAME,
                params: { workspaceId: lastAccessedWorkspaceId },
            }).catch(() => {});
        } else {
            await router.push({ name: ROOT_ROUTE.WORKSPACE._NAME }).catch(() => {});
        }

        Vue.notify({
            group: 'toastTopCenter',
            type: 'info',
            title: i18n.t('COMMON.GNB.ADMIN.SWITCH_WORKSPACE') as string,
            duration: 2000,
            speed: 1,
        });
        state.loading = false;
        return;
    }
    appContextStore.enterAdminMode();
    router.push({ name: ROOT_ROUTE.ADMIN._NAME });
    Vue.notify({
        group: 'toastTopCenter',
        type: 'info',
        title: i18n.t('COMMON.GNB.ADMIN.SWITCH_ADMIN') as string,
        duration: 2000,
        speed: 1,
    });
    state.loading = false;
}, 300);
</script>

<template>
    <label class="top-bar-admin-toggle-button">
        <input type="checkbox"
               class="switch-input"
               :disabled="state.loading"
               :checked="state.isAdminMode"
               @change="handleToggleAdminMode"
        >
        <div class="slider-wrapper">
            <span class="slider" />
            <span class="slider-text">Admin</span>
        </div>
    </label>
</template>

<style lang="postcss" scoped>
.top-bar-admin-toggle-button {
    @apply relative inline-block cursor-pointer;
    width: 4.875rem;
    height: 1.75rem;

    .switch-input {
        opacity: 0;
        width: 0;
        height: 0;

        &:checked {
            ~ .slider-wrapper {
                @apply border-violet-400;
                background: theme('colors.violet.700');
                box-shadow: 0 0.25rem 0.25rem 0 rgba(44, 15, 102, 0.5) inset;
            }
            ~ .slider-wrapper .slider::before {
                @apply bg-violet-200;
                filter: drop-shadow(0.0625rem 0.0625rem 0.125rem rgba(44, 15, 102, 0.5));
                transform: translateX(3.125rem);
            }
            ~ .slider-wrapper .slider-text {
                @apply text-violet-100;
                left: 0.5625rem;
            }
        }
    }

    .slider-wrapper {
        @apply relative inline-block w-full h-full rounded-full cursor-pointer border border-gray-200;
        background: rgba(221, 221, 223, 0.6);
        box-shadow: 0 0.25rem 0.25rem 0 rgba(194, 194, 198, 0.5) inset;
        margin-top: 2px;

        .slider {
            @apply absolute top-0 left-0 right-0 bottom-0;
            transition: 0.4s;
            z-index: 2;

            &::before {
                @apply absolute bg-gray-100 rounded-full;
                width: 1.25rem;
                height: 1.25rem;
                filter: drop-shadow(0.0625rem 0.0625rem 0.125rem rgba(194, 194, 198, 0.5));
                content: "";
                left: 0.1875rem;
                top: 0.1875rem;
                transition: 0.4s;
            }
        }
        .slider-text {
            @apply absolute text-paragraph-sm text-gray-400 font-bold;
            left: 1.6875rem;
            top: 0.25rem;
            opacity: 0.9;
            z-index: 1;
        }
    }
}
</style>
