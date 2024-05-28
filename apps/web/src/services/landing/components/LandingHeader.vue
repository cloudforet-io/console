<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PTooltip,
} from '@spaceone/design-system';

import { store } from '@/store';

import TopBarAdminToggleButton
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-admin-toggle-button/TopBarAdminToggleButton.vue';
import TopBarProfile
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-profile/TopBarProfile.vue';

import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';

interface props {
    isDomainLandingPage: boolean;
}

const props = withDefaults(defineProps<props>(), {
    isDomainLandingPage: false,
});

const storeState = reactive({
    isDomainAdmin: computed<boolean>(() => store.getters['user/isDomainAdmin']),
});

const state = reactive({
    openedProfileMenu: false,
});
const handleOpenedMenu = (visible: boolean) => {
    state.openedProfileMenu = visible;
};
</script>

<template>
    <div class="landing-header">
        <console-logo v-if="props.isDomainLandingPage"
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
    .landing-left-wrapper {
        @apply absolute;
        top: -0.5rem;
        left: 0.375rem;
    }
    .landing-right-wrapper {
        @apply absolute flex items-center;
        top: 0.652rem;
        right: 1.5rem;
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
