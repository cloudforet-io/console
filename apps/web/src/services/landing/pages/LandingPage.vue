<script setup lang="ts">
import { computed, reactive } from 'vue';

import { store } from '@/store';

import FNB from '@/common/modules/navigations/FNB.vue';
import TopBarProfile
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-profile/TopBarProfile.vue';

import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';

const storeState = reactive({
    hasPermission: computed((() => store.getters['user/hasPermission'])),
});
const state = reactive({
    openedProfileMenu: false,
});

const openMenu = (visible: boolean) => {
    if (!visible) hideMenu();
    else if (storeState.hasPermission) {
        state.openedProfileMenu = true;
    }
};
const hideMenu = () => {
    state.openedProfileMenu = false;
};
const handleOpenedMenu = (visible: boolean) => {
    if (visible) openMenu(visible);
    else hideMenu();
};
</script>

<template>
    <div class="workspace-lading-page">
        <top-bar-profile :visible="state.openedProfileMenu"
                         class="profile"
                         @update:visible="handleOpenedMenu"
        />
        <console-logo class="logo" />
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
        margin-left: -2rem;
    }
    .fnb {
        @apply absolute w-full;
        bottom: 0;
        margin-top: 2rem;
    }
}
</style>
