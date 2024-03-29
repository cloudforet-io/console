<script setup lang="ts">
import { reactive } from 'vue';

import FNB from '@/common/modules/navigations/FNB.vue';
import TopBarProfile
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-profile/TopBarProfile.vue';

import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';
import LandingContents from '@/services/landing/components/LandingContents.vue';

const state = reactive({
    openedProfileMenu: false,
});

const handleOpenedMenu = (visible: boolean) => {
    state.openedProfileMenu = visible;
};
</script>

<template>
    <div class="workspace-lading-page">
        <top-bar-profile :visible="state.openedProfileMenu"
                         class="profile"
                         @update:visible="handleOpenedMenu"
        />
        <console-logo class="logo"
                      :position-fixed="false"
        />
        <landing-contents />
        <f-n-b class="fnb" />
    </div>
</template>

<style scoped lang="postcss">
.workspace-lading-page {
    @apply relative flex flex-col items-center w-full h-full;
    padding-top: 0.625rem;
    padding-right: 1.5rem;
    padding-left: 1.5rem;
    .profile {
        margin-left: auto;
    }
    .logo {
        margin-top: -2.625rem;
        margin-left: -2rem;
    }
    .fnb {
        @apply absolute w-full;
        bottom: 0;
        margin-top: 2rem;
    }
}
</style>
