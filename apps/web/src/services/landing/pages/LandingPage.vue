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
        <div class="scroll-contents">
            <console-logo class="logo"
                          :position-fixed="false"
                          :is-hidden-if-tablet="false"
            />
            <landing-contents />
            <f-n-b class="fnb" />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.workspace-lading-page {
    @apply relative flex flex-col w-full h-full;
    .profile {
        @apply absolute;
        top: 0.652rem;
        right: 1.5rem;
    }
    .scroll-contents {
        @apply flex flex-col items-center overflow-y-auto;
        padding-right: 1.5rem;
        padding-bottom: calc($fnb-height + 5.375rem);
        padding-left: 1.5rem;
        .logo {
            margin-top: 0.5rem;
            margin-left: -2rem;
        }
        .fnb {
            @apply absolute w-full bg-gray-100;
            bottom: 0;
            margin-top: 2rem;
        }
    }
}
</style>
