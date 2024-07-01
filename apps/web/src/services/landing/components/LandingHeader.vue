<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PTooltip,
} from '@spaceone/design-system';

import { store } from '@/store';

import TopBarAdminToggleButton
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-admin-toggle-button/TopBarAdminToggleButton.vue';
import TopBarProfile
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-profile/TopBarProfile.vue';

import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';
import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';

const route = useRoute();

const storeState = reactive({
    isDomainAdmin: computed<boolean>(() => store.getters['user/isDomainAdmin']),
});

const state = reactive({
    isDomainLandingPage: false,
    openedProfileMenu: false,
});
const handleOpenedMenu = (visible: boolean) => {
    state.openedProfileMenu = visible;
};

watch(() => route.name, (name) => {
    if (name === LANDING_ROUTE.DOMAIN._NAME) {
        state.isDomainLandingPage = true;
    }
}, { immediate: true });
</script>

<template>
    <div class="landing-header">
        <console-logo v-if="state.isDomainLandingPage"
                      class="landing-left-wrapper"
                      :size-ratio="0.57"
        />
        <div class="landing-right-wrapper">
            <p-tooltip v-if="storeState.isDomainAdmin"
                       :contents="$t('COMMON.GNB.TOOLTIP.ENABLE_ADMIN_MODE')"
                       position="bottom"
            >
                <top-bar-admin-toggle-button class="toggle-button" />
            </p-tooltip>
            <top-bar-profile :visible="state.openedProfileMenu"
                             @update:visible="handleOpenedMenu"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.landing-header {
    @apply flex justify-between;
    .landing-left-wrapper {
        margin-top: -0.5rem;
        margin-left: 0.375rem;
    }
    .landing-right-wrapper {
        @apply flex items-center;
        margin-top: 0.652rem;
        margin-right: 1.5rem;
        margin-left: auto;
        gap: 0.5rem;
    }

    /* custom design-system component - p-icon-button */
    :deep(.p-icon-button) {
        svg {
            width: 1.25rem !important;
            height: 1.25rem !important;
        }
    }
}
</style>
