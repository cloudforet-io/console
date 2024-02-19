<template>
    <div class="top-bar-my-page-toolset">
        <top-bar-profile :visible="state.profileMenuVisible"
                         @update:visible="updateOpenedMenu"
        />
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { store } from '@/store';

import TopBarProfile from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-profile/TopBarProfile.vue';

const state = reactive({
    timezone: computed(() => store.state.user.timezone),
    profileMenuVisible: false,
});

const hideMenu = () => {
    state.profileMenuVisible = false;
};
const openMenu = () => {
    state.profileMenuVisible = true;
};
const updateOpenedMenu = (visible: boolean) => {
    if (visible) openMenu();
    else hideMenu();
};

</script>

<style lang="postcss" scoped>
.top-bar-my-page-toolset {
    @apply flex items-center gap-3;
}
</style>
