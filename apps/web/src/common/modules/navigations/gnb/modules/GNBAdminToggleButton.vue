<script setup lang="ts">
import Vue, { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';


import { i18n } from '@/translations';

import { ROOT_ROUTE } from '@/router/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';

const appContextStore = useAppContextStore();
const router = useRouter();

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const handleToggleAdminMode = () => {
    if (state.isAdminMode) {
        appContextStore.switchToWorkspaceMode();
        router.push({ name: ROOT_ROUTE.WORKSPACE._NAME });
        Vue.notify({
            group: 'toastTopCenter',
            type: 'info',
            title: i18n.t('COMMON.GNB.ADMIN.SWITCH_WORKSPACE'),
            duration: 2000,
            speed: 1,
        });
        return;
    }
    appContextStore.switchToAdminMode();
    router.push({ name: ROOT_ROUTE.ADMIN._NAME });
    Vue.notify({
        group: 'toastTopCenter',
        type: 'info',
        title: i18n.t('COMMON.GNB.ADMIN.SWITCH_ADMIN'),
        duration: 2000,
        speed: 1,
    });
};
</script>

<template>
    <label class="g-n-b-admin-toggle-button">
        <input type="checkbox"
               class="switch-input"
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
.g-n-b-admin-toggle-button {
    @apply relative inline-block cursor-pointer;
    width: 5.625rem;
    height: 1.75rem;
    padding-left: 0.75rem;

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
